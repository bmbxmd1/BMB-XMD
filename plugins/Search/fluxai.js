const { bmbtz } = require("../../devbmb/bmbtz");
const axios = require("axios");

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

// Context ya newsletter
const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363382023564830@newsletter",
    newsletterName: "𝙱.𝙼.𝙱-𝚃𝙴𝙲𝙷",
    serverMessageId: 1
  }
};

// =============== FLUX AI ===============
bmbtz({
  nomCom: "fluxai",
  aliases: ["flux", "imagine"],
  categorie: "Search",
  reaction: "📸"
}, async (jid, sock, { ms, repondre, arg }) => {
  const q = arg.join(" ");
  if (!q) return repondre("❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚙𝚛𝚘𝚖𝚙𝚝 𝚏𝚘𝚛 𝚝𝚑𝚎 𝚒𝚖𝚊𝚐𝚎.");
  await repondre("> *𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝙿𝙷𝙾𝚃𝙾 📸*");

  try {
    const url = `https://iamtkm.vercel.app/ai/NanoBanana?apikey=tkm&prompt=${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });

    await sock.sendMessage(jid, {
      image: Buffer.from(data, "binary"),
      caption: `🌲 *𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳 𝙱𝚈 𝙱.𝙼.𝙱-𝚃𝙴𝙲𝙷* 😎\n📸 𝚁𝙴𝙰𝙳𝚈 : *${q}*`,
      contextInfo
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("FluxAI Error:", error);
    repondre(`❌ Error: ${error.message || "Failed to generate image."}`);
  }
});

// =============== STABLE DIFFUSION ===============
bmbtz({
  nomCom: "stablediffusion",
  aliases: ["sdiffusion", "imagine2"],
  categorie: "Search",
  reaction: "📸"
}, async (jid, sock, { ms, repondre, arg }) => {
  const q = arg.join(" ");
  if (!q) return repondre("❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚙𝚛𝚘𝚖𝚙𝚝 𝚏𝚘𝚛 𝚝𝚑𝚎 𝚒𝚖𝚊𝚐𝚎.");
  await repondre("> *𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝙿𝙷𝙾𝚃𝙾 📸*");

  try {
    const url = `https://iamtkm.vercel.app/ai/NanoBanana?apikey=tkm&prompt=${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });

    await sock.sendMessage(jid, {
      image: Buffer.from(data, "binary"),
      caption: `🌲 *𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳 𝙱𝚈 𝙱.𝙼.𝙱-𝚃𝙴𝙲𝙷* 😎\n✨ 𝚁𝙴𝙰𝙳𝚈: *${q}*`,
      contextInfo
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("StableDiffusion Error:", error);
    repondre(`❌ Error: ${error.message || "Failed to generate image."}`);
  }
});

// =============== STABILITY AI ===============
bmbtz({
  nomCom: "stabilityai",
  aliases: ["stability", "imagine3"],
  categorie: "Search",
  reaction: "📸"
}, async (jid, sock, { ms, repondre, arg }) => {
  const q = arg.join(" ");
  if (!q) return repondre("❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚙𝚛𝚘𝚖𝚙𝚝 𝚏𝚘𝚛 𝚝𝚑𝚎 𝚒𝚖𝚊𝚐𝚎.");
  await repondre("> *𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝙿𝙷𝙾𝚃𝙾 📸*");

  try {
    const url = `https://iamtkm.vercel.app/ai/NanoBanana?apikey=tkm&prompt=${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });

    await sock.sendMessage(jid, {
      image: Buffer.from(data, "binary"),
      caption: `🌲 *𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳 𝙱𝚈 𝙱.𝙼.𝙱-𝚃𝙴𝙲𝙷* 😎\n📸 𝚁𝙴𝙰𝙳𝚈: *${q}*`,
      contextInfo
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("StabilityAI Error:", error);
    repondre(`❌ Error: ${error.message || "Failed to generate image."}`);
  }
});

// =============== NANOBANANA ===============
bmbtz({
  nomCom: "nanobanana",
  aliases: ["nano", "imagine4"],
  categorie: "Search",
  reaction: "📸"
}, async (jid, sock, { ms, repondre, arg }) => {
  const q = arg.join(" ");
  if (!q) return repondre("❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚙𝚛𝚘𝚖𝚙𝚝 𝚏𝚘𝚛 𝚝𝚑𝚎 𝚒𝚖𝚊𝚐𝚎.");
  await repondre("> *𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝙿𝙷𝙾𝚃𝙾 📸*");

  try {
    const url = `https://iamtkm.vercel.app/ai/NanoBanana?apikey=tkm&prompt=${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });

    await sock.sendMessage(jid, {
      image: Buffer.from(data, "binary"),
      caption: `🌲 *𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳 𝙱𝚈 𝙱.𝙼.𝙱-𝚃𝙴𝙲𝙷* 😎\n🍌 𝚁𝙴𝙰𝙳𝚈: *${q}*`,
      contextInfo
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("NanoBanana Error:", error);
    repondre(`❌ Error: ${error.message || "Failed to generate image."}`);
  }
});
