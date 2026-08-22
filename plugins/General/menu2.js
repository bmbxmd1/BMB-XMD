const { bmbtz, cm } = require("../../devbmb/bmbtz");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../../settings");
const { getCachedSettingsSync } = require("../../lib/settingsCache");

/**
 * menu
 *
 * Rewritten from a template the user provided. Fixes two real bugs
 * found in it along the way:
 *   - `s.MODE.toLowerCase() === "yes"` checked against a value MODE
 *     never actually holds (it's "on"/"off", set via .mode public/
 *     .mode private) — Mode would always display PRIVATE regardless
 *     of the real setting. Now reads the live value via
 *     getCachedSettingsSync(), matching how plugins/Settings/settings.js
 *     itself reads current settings.
 *   - The image URL pointed at url.bmbxmd.workers.dev, the same dead
 *     image host that broke .ping earlier in this project — replaced
 *     with the project's own configured menu image (conf.URL), with a
 *     plain-text fallback if sending the image fails for any reason.
 *
 * Visual style is intentionally its own design (different border/bullet
 * glyphs, different layout details) rather than a copy of any specific
 * reference menu someone might recognize.
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

// WhatsApp "Read more" trick — an invisible character repeated many
// times pushes the rest of the caption behind an expandable link,
// keeping the initial view short.
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

    let infoMessage = `┏─⦿ *B.M.B-TECH* ⦿─┓\n` +
      `┆ Hey there, *${nomAuteurMessage}* 👋\n` +
      `┆\n` +
      `┆ ▸ Platform : *${os.platform()}*\n` +
      `┆ ▸ Mode     : *${mode}*\n` +
      `┆ ▸ Prefix   : *[ ${prefixe} ]*\n` +
      `┆ ▸ Time     : *${currentTime}*\n` +
      `┆ ▸ Date     : *${currentDate}*\n` +
      `┆ ▸ Commands : *${cm.length}*\n` +
      `┗━━━━━━━━━━━━━━━━━┛\n` +
      `${readMore}\n`;

    let menuMessage = "";
    for (const category in commandsByCategory) {
      menuMessage += `\n▞▚ *${category.toUpperCase()}* ▚▞\n`;
      for (const cmdName of commandsByCategory[category]) {
        menuMessage += `   ➛ ${cmdName}\n`;
      }
    }

    menuMessage += `\n─────────────\n✦ *B.M.B-TECH* — built to last ✦`;

    const fullCaption = infoMessage + menuMessage;
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
