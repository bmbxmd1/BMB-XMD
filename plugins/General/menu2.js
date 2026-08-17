const fs = require('fs-extra');
const path = require('path');
const { bmbtz } = require(__dirname + "/../../devbmb/bmbtz");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../../settings");

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

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

bmbtz({ nomCom: "menu2", categorie: "General" }, async (dest, client, commandOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage } = commandOptions;
    let { cm } = require(__dirname + "/../../devbmb/bmbtz");
    let commandsByCategory = {};
    let mode = (s.MODE.toLowerCase() === "yes") ? "PUBLIC" : "PRIVATE";

    cm.map((com) => {
        if (!commandsByCategory[com.categorie]) commandsByCategory[com.categorie] = [];
        commandsByCategory[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment().format('HH:mm:ss');
    const currentDate = moment().format('DD/MM/YYYY');

    let infoMessage = `┏━━━⚡ *B.M.B-TECH-V2* ⚡━━━┓
┃ 🔥  Hello, *${nomAuteurMessage}*! 🔥
┣━━━━━━━━━━━━━━━━━━━━━
┃ 📌 *System Info:*
┃ 💻 Platform: *${os.platform()}*
┣━━━━━━━━━━━━━━━━━━━━━
┃ ⚙️ *Bot Status:*
┃ 🔘 Mode: *${mode}*
┃ 🚀 Prefix: *[ ${prefixe} ]*
┃ ⏳ Time: *${currentTime}*
┃ 📆 Date: *${currentDate}*
┃ 📟 Commands: *${cm.length}*
┣━━━━━━━━━━━━━━━━━━━━━
┃ ${readMore}
┃ 🎩 *Command Menu* 🎩
┣━━━━━━━━━━━━━━━━━━━━━\n`;

    let menuMessage = "";

    for (const category in commandsByCategory) {
        menuMessage += `┣ 🔹 *${category.toUpperCase()}* 🔹\n`;
        for (const cmd of commandsByCategory[category]) {
            menuMessage += `┃   🔸 ${cmd}\n`;
        }
        menuMessage += `┣━━━━━━━━━━━━━━━━━━━━━\n`;
    }

    menuMessage += `┗🌟 *𝙱.𝙼.𝙱-𝚇𝙼𝙳 - Developed by the Best!* 🌟`;

    const imageUrl = "https://url.bmbxmd.workers.dev/menubmb.png";

    try {
        await client.sendMessage(dest, {
            image: { url: imageUrl },
            caption: infoMessage + menuMessage,
            footer: "© 𝙱.𝙼.𝙱-𝚇𝙼𝙳",
            ...newsletterContext
        }, { quoted: quotedContact });

    } catch (e) {
        console.log("❌ Menu error: " + e);
        repondre("❌ Menu error: " + e.message);
    }
});
