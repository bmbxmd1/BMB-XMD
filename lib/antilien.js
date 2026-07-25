const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../asset/antilien.json');

// Load data from JSON file
function loadAntilienData() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {}; // If file doesn't exist, start with an empty object
  }
}

// Save data to JSON file (non-blocking so it never stalls message handling)
function saveAntilienData(data) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) console.log('⚠️ [antilien] failed to save:', err.message);
  });
}

const antilienData = loadAntilienData();

async function ajouterOuMettreAJourJid(jid, etat) {
  antilienData[jid] = { etat, action: antilienData[jid]?.action || 'supp' };
  saveAntilienData(antilienData);
  console.log(`JID ${jid} added or updated in the 'antilien' table.`);
}

async function mettreAJourAction(jid, action) {
  if (antilienData[jid]) {
    antilienData[jid].action = action;
  } else {
    antilienData[jid] = { etat: 'non', action };
  }
  saveAntilienData(antilienData);
  console.log(`Action updated for JID ${jid} in the 'antilien' table.`);
}

async function verifierEtatJid(jid) {
  return antilienData[jid]?.etat === 'oui';
}

async function recupererActionJid(jid) {
  return antilienData[jid]?.action || 'supp';
}

module.exports = {
  ajouterOuMettreAJourJid,
  mettreAJourAction,
  verifierEtatJid,
  recupererActionJid,
};
