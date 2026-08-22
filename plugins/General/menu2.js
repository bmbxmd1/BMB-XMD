const { bmbtz, cm } = require("../../devbmb/bmbtz");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../../settings");
const { getCachedSettingsSync } = require("../../lib/settingsCache");

/**
 * menu
 *
 * Second visual pass — gives each category its own boxed "card"
 * (open decorative line → italicized command list → close line),
 * matching the polished, structured feel of the reference layout the
 * user liked, while using an entirely different glyph set/border
 * style so it doesn't read as a literal copy.
 */
const newsletterContext = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363382023564830@newsletter",
      newsletterName: "𝙱.𝙼.𝙱-𝚇𝙼𝙳",
      serverMessageId: 1
    }
  }
};

const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "B.M.B VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=255767862457:+255772341432\nEND:VCARD"
    }
  }
};

const readMoreChar = String.fromCharCode(8206);
const readMore = readMoreChar.repeat(4001);

bmbtz({ nomCom: "menu", alias: ["allmenu", "helplist"], categorie: "General" }, async (dest, client, commandOptions) => {
  let { ms, repondre, prefixe, nomAuteurMessage } = commandOptions;

  try {
    const commandsByCategory = {};
    cm.forEach((com) => {
      const cat = com.categorie || "General";
      if (!commandsByCategory[cat]) commandsByCategory[cat] = [];
      commandsByCategory[cat].push(com.nomCom);
    });

    const modeValue = getCachedSettingsSync().MODE ?? s.MODE;
    const mode = (modeValue || "").toLowerCase() === "on" ? "PUBLIC" : "PRIVATE";

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment().format("HH:mm:ss");
    const currentDate = moment().format("DD/MM/YYYY");

    const headerCard =
      `╭──✦ *B.M.B-TECH* ✦──╮\n` +
      `│\n` +
      `│ ❖ Hello, *${nomAuteurMessage}*\n` +
      `│ ❖ Platform : *${os.platform()}*\n` +
      `│ ❖ Mode     : *${mode}*\n` +
      `│ ❖ Prefix   : *[ ${prefixe} ]*\n` +
      `│ ❖ Time     : *${currentTime}*\n` +
      `│ ❖ Date     : *${currentDate}*\n` +
      `│ ❖ Commands : *${cm.length}*\n` +
      `│\n` +
      `╰───────────────╯\n` +
      `${readMore}\n`;

    let menuBody = "";
    for (const category in commandsByCategory) {
      menuBody += `\n『 *${category.toUpperCase()}* 』\n`;
      menuBody += `┄┈┄┈┄┈┄┈┄┈┄┈┄┈┄┈┄┈\n`;
      for (const cmdName of commandsByCategory[category]) {
        menuBody += `  ‣ _${cmdName}_\n`;
      }
      menuBody += `┄┈┄┈┄┈┄┈┄┈┄┈┄┈┄┈┄┈\n`;
    }

    menuBody += `\n✦ ─────────────── ✦\n*B.M.B-TECH* — built to last`;

    const fullCaption = headerCard + menuBody;
    const imageUrl = s.URL;

    try {
      await client.sendMessage(dest, {
        image: { url: imageUrl },
        caption: fullCaption,
        ...newsletterContext
      }, { quoted: quotedContact });
    } catch (imgErr) {
      console.log("[menu] image send failed, falling back to text:", imgErr.message || imgErr);
      await client.sendMessage(dest, { text: fullCaption, ...newsletterContext }, { quoted: ms });
    }

  } catch (e) {
    console.log("❌ Menu error: " + e);
    repondre("❌ Menu error: " + (e.message || e));
  }
});
