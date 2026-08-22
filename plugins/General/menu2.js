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

bmbtz({ nomCom: "menu", categorie: "General" }, async (dest, client, commandOptions) => {
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

    let infoMessage = `╭◈▬▬▬▬▬▬▬▬▬▬▬◈╮
◈ BOT NAME: *B.M.B-TECH-V2*
◈ COMMANDS: *${cm.length}+*
◈ USER: *${nomAuteurMessage}*
◈ PLATFORM: *${os.platform().toUpperCase()}*
◈ OWNER: *B.M.B*
◈ MODE: *${mode}*
◈ PREFIX: *[ ${prefixe} ]*
◈ TIME: *${currentTime}*
◈ DATE: *${currentDate}*
╰▬▬▬▬▬▬▬▬▬▬▬▬▬╯
${readMore}\n`;

    let menuMessage = "";

    for (const category in commandsByCategory) {
        menuMessage += `\n╭◈──${category.toUpperCase()}──◈╮\n`;
        for (const cmd of commandsByCategory[category]) {
            menuMessage += `┊ • ${cmd}\n`;
        }
        menuMessage += `╰▬▬▬▬▬▬▬▬▬▬▬▬▬╯\n`;
    }

    menuMessage += `\n✧ *𝙱.𝙼.𝙱-𝚇𝙼𝙳 - Bot Menu* ✧`;

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
