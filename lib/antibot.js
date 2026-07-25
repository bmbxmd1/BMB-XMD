const fs = require('fs');
const path = require('path');

// Define the path for the JSON file to store data
const dataFilePath = path.join(__dirname, '../asset/antibot.json');

// Function to read data from JSON file (used only at startup / cache miss)
function readDataFromFile() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or there's a read error, start empty
    return {};
  }
}

// Function to write data to JSON file — non-blocking so it never stalls
// message handling. The in-memory cache is already updated by the time
// this is called, so a slightly delayed write to disk is safe.
function writeDataToFile(data) {
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8', (err) => {
    if (err) console.log('⚠️ [antibot] failed to save:', err.message);
  });
}

// In-memory cache, loaded once at startup. All per-message reads hit this
// object directly instead of touching the filesystem.
let antibotData = readDataFromFile();

// Function to add or update a JID with a given state
function addOrUpdateJidState(jid, etat) {
  antibotData[jid] = antibotData[jid] || {};
  antibotData[jid].etat = etat;
  antibotData[jid].action = antibotData[jid].action || 'supp'; // Default action is 'supp' if not present

  writeDataToFile(antibotData);
  console.log(`JID ${jid} successfully added or updated.`);
}

// Function to update the action for a given JID
function updateJidAction(jid, action) {
  antibotData[jid] = antibotData[jid] || {};
  antibotData[jid].etat = antibotData[jid].etat || 'non'; // Default state is 'non' if not present
  antibotData[jid].action = action;

  writeDataToFile(antibotData);
  console.log(`Action successfully updated for JID ${jid}.`);
}

// Function to verify the state of a JID — reads from memory, no disk I/O.
function checkJidState(jid) {
  return antibotData[jid]?.etat === 'oui';
}

// Function to retrieve the action of a JID — reads from memory, no disk I/O.
function getJidAction(jid) {
  return antibotData[jid]?.action || 'supp';
}

// Export the functions for external use.
// Aliased names (atb-prefixed) are kept for compatibility with index.js,
// which was calling these under different names than this file exported —
// meaning antibot silently crashed on every message before this fix.
module.exports = {
  updateJidAction,
  addOrUpdateJidState,
  checkJidState,
  getJidAction,
  atbajouterOuMettreAJourJid: addOrUpdateJidState,
  atbmettreAJourAction: updateJidAction,
  atbverifierEtatJid: checkJidState,
  atbrecupererActionJid: getJidAction,
};
