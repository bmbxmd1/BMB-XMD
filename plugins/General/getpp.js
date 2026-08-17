const { bmbtz } = require('../../devbmb/bmbtz');
const s = require("../../settings");
const fs = require('fs');

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
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=254700000001:+254 700 000001\nEND:VCARD"
    }
  }
};

// Context ya newsletter
const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363382023564830@newsletter",
    newsletterName: "𝙱.𝙼.𝙱-𝚇𝙼𝙳",
    serverMessageId: 1
  }
};

// SET PROFILE PICTURE
bmbtz({
  nomCom: 'setpp',
  categorie: 'General',
  reaction: '📸'
}, async (dest, client, commandeOptions) => {
  const { ms, repondre, msgRepondu, superUser, auteurMessage, idBot } = commandeOptions;

  const userJid = auteurMessage;
  const botJid = idBot;
  const ownerNumber = s.OWNER_NUMBER || 'default_owner_number';
  const isOwner = userJid === `${ownerNumber}@s.whatsapp.net`;
  const isConnectedUser = userJid === botJid;

  if (!isConnectedUser && !isOwner && !superUser) {
    return repondre("🚫 *Only the connected bot user or owner can change the profile picture!*");
  }

  if (!msgRepondu) {
    return repondre("📸 *Please reply to an image with .settingspp to set it as your profile picture!*");
  }

  const imageMessage =
    msgRepondu.message?.imageMessage ||
    msgRepondu.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    msgRepondu.imageMessage || null;

  if (!imageMessage) {
    return repondre("🚫 *The replied message isn't an image!*");
  }

  try {
    const mediaPath = await client.downloadAndSaveMediaMessage(imageMessage);
    await client.updateProfilePicture(userJid, { url: mediaPath });
    fs.unlink(mediaPath, err => {
      if (err) console.error("Cleanup failed:", err);
    });

    // Success message na box
    const successMsg = `┏━━━━━━━━━━━━━━━━━━
┃ ✅ *Profile Picture Updated!*
┃ 👤 *User:* @${userJid.split('@')[0]}
┃ 🤖 *Bot:* ${s.BOT}
┃ 🔧 *Status:* Success
┗━━━━━━━━━━━━━━━━━`;

    repondre(successMsg, { mentions: [userJid] });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    repondre(`❌ *Failed to update profile picture:* ${error.message}`);
  }
});

// GET PROFILE PICTURE
bmbtz({
  nomCom: "getpp",
  categorie: "General",
  reaction: "📷",
}, async (dest, client, commandeOptions) => {
  const { ms, repondre, msgRepondu, auteurMsgRepondu, mybotpic } = commandeOptions;

  if (!msgRepondu) {
    return repondre(`❌ *Reply to someone's message to get their profile pic!*`);
  }

  try {
    // Loading message (normal)
    await repondre(
      `🔁 *Load..... @${auteurMsgRepondu.split("@")[0]}*`,
      { mentions: [auteurMsgRepondu] }
    );

    let ppuser;
    try {
      ppuser = await client.profilePictureUrl(auteurMsgRepondu, 'image');
    } catch {
      ppuser = mybotpic();
      await repondre(
        `🚫 *Profile picture locked or not found!*  
🖼️ *Showing bot profile instead...*`,
        { mentions: [auteurMsgRepondu] }
      );
    }

    // Box style caption
    const captionBox = `┏━━━━━━━━━━━━━━━━━━
┃ 🖼️ *Profile Picture*
┃ 👤 *User:* @${auteurMsgRepondu.split('@')[0]}
┃ 🤖 *Bot:* ${s.BOT}
┗━━━━━━━━━━━━━━━━━`;

    await client.sendMessage(dest, {
      image: { url: ppuser },
      caption: captionBox,
      mentions: [auteurMsgRepondu],
      contextInfo
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("Error in getpp:", error);
    await repondre(`❌ *Error while fetching profile picture:* ${error.message}`);
  }
});