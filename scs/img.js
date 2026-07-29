const { bmbtz } = require('../devbmb/bmbtz');
const axios = require('axios');

// VCard Contact
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "B.M.B VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=255767862457:+255767862457\nEND:VCARD"
    }
  }
};

// Newsletter context
const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363382023564830@newsletter",
    newsletterName: "𝙱.𝙼.𝙱-𝚇𝙼𝙳",
    serverMessageId: 1
  }
};

bmbtz({
  nomCom: "img",
  categorie: "Search",
  reaction: "📷"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('❌ Please specify an image search term!');
  }

  const searchTerm = arg.join(" ");

  try {
    const apiUrl = `https://api-library-kohi.onrender.com/api/gmage?q=${encodeURIComponent(searchTerm)}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data || !data.status || !Array.isArray(data.data) || data.data.length === 0) {
      return repondre('❌ No images found for your query.');
    }

    const results = data.data;
    // Send up to 5 images
    const sendCount = Math.min(results.length, 5);
    for (let i = 0; i < sendCount; i++) {
      try {
        await zk.sendMessage(dest, {
          image: { url: results[i] },
          contextInfo
        }, { quoted: ms });
      } catch (sendErr) {
        console.error('Failed to send image', i, sendErr.message);
      }
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    return repondre('❌ An error occurred while searching for images.');
  }
});
