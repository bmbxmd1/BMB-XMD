const { bmbtz } = require("../devbmb/bmbtz")
//const { getGroupe } = require("../lib/groupe")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const {ajouterOuMettreAJourJid,mettreAJourAction,verifierEtatJid} = require("../lib/antilien")
const {atbajouterOuMettreAJourJid,atbverifierEtatJid} = require("../lib/antibot")
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../settings");
const { default: axios } = require('axios');
const { resolveTargetJid } = require("../lib/lidResolver");
//const { uploadImageToImgur } = require('../devbmb/imgur');

/**
 * Work out who a group command (promote/demote/remove) should target.
 * Supports BOTH styles, same as NOVA-XMD:
 *   1. Replying to the target's message   -> .promote  (while replying)
 *   2. @mentioning the target directly    -> .promote @2547xxxxxxx
 * Mentions are checked first since that's the more explicit signal, then
 * falls back to the replied-to message's author.
 */
function getCommandTargetJid(ms, mtype, auteurMsgRepondu, participants) {
  try {
    const mentioned = ms?.message?.[mtype]?.contextInfo?.mentionedJid;
    if (Array.isArray(mentioned) && mentioned.length > 0) {
      const raw = mentioned[0];
      const resolved = resolveTargetJid(raw, participants);
      return resolved || raw;
    }
  } catch (e) {}

  if (auteurMsgRepondu) {
    const resolved = resolveTargetJid(auteurMsgRepondu, participants);
    return resolved || auteurMsgRepondu;
  }

  return null;
}





bmbtz({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {

  const {
    ms,
    repondre,
    arg,
    verifGroupe,
    nomGroupe,
    infosGroupe,
    nomAuteurMessage,
    verifAdmin,
    superUser
  } = commandeOptions;

  if (!verifGroupe) {
    repondre("🚫 *This command is for group use only.*");
    return;
  }

  let mess = (!arg || arg === ' ') ? '🔔 No message provided.' : arg.join(' ');
  let membresGroupe = await infosGroupe.participants;

  let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  let random = Math.floor(Math.random() * emoji.length);

  // Anza kujenga ki box kizuri
  let tag = 
`╭─────❰ *📣 GROUP TAG ALERT* ❱─────╮
│
│ 🏷️ *Group:* ${nomGroupe}
│ 👤 *By:* ${nomAuteurMessage}
│ 💬 *Message:* ${mess}
│
│ 👥 *Tagged Members:*
│────────────────────────────`;

  for (const membre of membresGroupe) {
    tag += `\n│ ${emoji[random]} @${membre.id.split("@")[0]}`;
  }

  tag += `\n╰────────────────────────────╯`;

  if (verifAdmin || superUser) {
    zk.sendMessage(dest, {
      text: tag,
      mentions: membresGroupe.map((i) => i.id)
    }, { quoted: ms });
  } else {
    repondre("🚫 *Only group admins can use this command.*");
  }

});

bmbtz({ nomCom: "link", categorie: 'Group', reaction: "🙋" }, async (dest, zk, commandeOptions) => {
  const { repondre, nomGroupe, nomAuteurMessage, verifGroupe } = commandeOptions;

  if (!verifGroupe) {
    repondre("😅 Wait bro, you want the link to my DM? This command is for *groups only*.");
    return;
  }

  var link = await zk.groupInviteCode(dest);
  var lien = `https://chat.whatsapp.com/${link}`;

  let mess =
`╭───❰ *GROUP LINK REQUESTED* ❱───╮
│
│ 🙋 Hello *${nomAuteurMessage}*,
│ 🔗 Here is the link for group *${nomGroupe}*:
│
│ 👉 ${lien}
│
│ © B.M.B-TECH 𝐬𝐜𝐢𝐞𝐧𝐜𝐞
╰────────────────────────────╯`;

  repondre(mess);

});
/** *nommer un membre comme admin */
bmbtz({ nomCom: "promote", categorie: 'Group', reaction: "🔃" }, async (dest, zk, commandeOptions) => {
  let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot, ms, mtype } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) { return repondre("For groups only"); }

  const targetJid = getCommandTargetJid(ms, mtype, auteurMsgRepondu, membresGroupe);

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id !== user) {
        continue;
      }
      else { return true }
    }
    return false;
  }

  const memberAdmin = (membresGroupe) => {
    let admin = [];
    for (const m of membresGroupe) {
      if (m.admin == null) continue;
      admin.push(m.id);

    }
    return admin;
  }

  const a = verifGroupe ? memberAdmin(membresGroupe) : '';


  let admin = verifGroupe && targetJid ? a.includes(targetJid) : false;
  let membre = targetJid ? verifMember(targetJid) : false;
  let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
  let zkad = verifGroupe ? a.includes(idBot) : false;
  try {
    if (autAdmin || superUser) {
      if (targetJid) {
        if (zkad) {
          if (membre) {
            if (admin == false) {
              var txt = `🎊🎊🎊  @${targetJid.split("@")[0]} rose in rank.\n
                      he/she has been named group administrator.`
              await zk.groupParticipantsUpdate(dest, [targetJid], "promote");
              zk.sendMessage(dest, { text: txt, mentions: [targetJid] })
            } else { return repondre("This member is already an administrator of the group.") }

          } else { return repondre("This user is not part of the group."); }
        }
        else { return repondre("Sorry, I cannot perform this action because I am not an administrator of the group.") }

      } else { repondre("Reply to a message from the member, or @mention them, to nominate as admin."); }
    } else { return repondre("Sorry I cannot perform this action because you are not an administrator of the group.") }
  } catch (e) { repondre("oups " + e) }

})

//fin nommer
/** ***demettre */

bmbtz({ nomCom: "demote", categorie: 'Group', reaction: "🔃" }, async (dest, zk, commandeOptions) => {
  let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot, ms, mtype } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) { return repondre("For groups only"); }

  const targetJid = getCommandTargetJid(ms, mtype, auteurMsgRepondu, membresGroupe);

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id !== user) {
        continue;
      }
      else { return true }
    }
    return false;
  }

  const memberAdmin = (membresGroupe) => {
    let admin = [];
    for (const m of membresGroupe) {
      if (m.admin == null) continue;
      admin.push(m.id);

    }
    return admin;
  }

  const a = verifGroupe ? memberAdmin(membresGroupe) : '';


  let admin = verifGroupe && targetJid ? a.includes(targetJid) : false;
  let membre = targetJid ? verifMember(targetJid) : false;
  let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
  let zkad = verifGroupe ? a.includes(idBot) : false;
  try {
    if (autAdmin || superUser) {
      if (targetJid) {
        if (zkad) {
          if (membre) {
            if (admin == false) {

              repondre("This member is not a group administrator.")

            } else {
              var txt = `@${targetJid.split("@")[0]} was removed from his position as a group administrator\n`
              await zk.groupParticipantsUpdate(dest, [targetJid], "demote");
              zk.sendMessage(dest, { text: txt, mentions: [targetJid] })
            }

          } else { return repondre("This user is not part of the group."); }
        }
        else { return repondre("Sorry I cannot perform this action because I am not an administrator of the group.") }

      } else { repondre("Reply to a message from the member, or @mention them, to demote."); }
    } else { return repondre("Sorry I cannot perform this action because you are not an administrator of the group.") }
  } catch (e) { repondre("oups " + e) }

})


/** ***fin démettre****  **/
/** **retirer** */
bmbtz({ nomCom: "remove", categorie: 'Group', reaction: "🦵" }, async (dest, zk, commandeOptions) => {
  let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, nomAuteurMessage, auteurMessage, superUser, idBot, ms, mtype } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) { return repondre("for groups only"); }

  const targetJid = getCommandTargetJid(ms, mtype, auteurMsgRepondu, membresGroupe);

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id !== user) {
        continue;
      }
      else { return true }
    }
    return false;
  }

  const memberAdmin = (membresGroupe) => {
    let admin = [];
    for (const m of membresGroupe) {
      if (m.admin == null) continue;
      admin.push(m.id);

    }
    return admin;
  }

  const a = verifGroupe ? memberAdmin(membresGroupe) : '';


  let admin = verifGroupe && targetJid ? a.includes(targetJid) : false;
  let membre = targetJid ? verifMember(targetJid) : false;
  let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
  let zkad = verifGroupe ? a.includes(idBot) : false;
  try {
    if (autAdmin || superUser) {
      if (targetJid) {
        if (zkad) {
          if (membre) {
            if (admin == false) {
              // Use the sticker pre-generated once at startup instead of
              // downloading + re-encoding a GIF on every single removal.
              const stickerBuf = global._removerStickerBuffer;
              var txt = `
╭───〔 🦵 MEMBER REMOVED 〕───
│
│ 👤 User: @${targetJid.split("@")[0]}
│
│ ✅ Removed from group successfully
│
╰────────────────────`
              if (stickerBuf) zk.sendMessage(dest, { sticker: stickerBuf });
              await zk.groupParticipantsUpdate(dest, [targetJid], "remove");
              zk.sendMessage(dest, { text: txt, mentions: [targetJid] })

            } else { repondre("This member cannot be removed because he is an administrator of the group.") }

          } else { return repondre("This user is not part of the group."); }
        }
        else { return repondre("Sorry, I cannot perform this action because I am not an administrator of the group.") }

      } else { repondre("Reply to a message from the member, or @mention them, to remove."); }
    } else { return repondre("Sorry I cannot perform this action because you are not an administrator of the group .") }
  } catch (e) { repondre("oups " + e) }

});


/** *****fin retirer */

bmbtz({
  nomCom: "del",
  categorie: 'Group',
  reaction: "🧹"
}, async (dest, zk, commandeOptions) => {
  const {
    ms, repondre, verifGroupe,
    auteurMsgRepondu, idBot,
    msgRepondu, verifAdmin, superUser
  } = commandeOptions;

  if (!msgRepondu) return repondre("❗ *Please reply to the message you want to delete.*");

  // Case: If SuperUser deletes their own message
  if (superUser && auteurMsgRepondu === idBot) {
    const key = {
      remoteJid: dest,
      fromMe: true,
      id: ms.message.extendedTextMessage.contextInfo.stanzaId,
    };
    await zk.sendMessage(dest, { delete: key });
    return;
  }

  // Case: Group message deletion by admin
  if (verifGroupe) {
    if (verifAdmin || superUser) {
      try {
        const key = {
          remoteJid: dest,
          id: ms.message.extendedTextMessage.contextInfo.stanzaId,
          fromMe: false,
          participant: ms.message.extendedTextMessage.contextInfo.participant
        };

        // Optional: Send a confirmation before deleting
        await zk.sendMessage(dest, {
          text:
`╭──❰ *MESSAGE DELETION* ❱──╮
│
│ 🗑️ The message will now be deleted.
│ 🔒 Only admins or bot owners can use this command.
│
╰────────────────────────╯`,
          mentions: [auteurMsgRepondu]
        });

        await zk.sendMessage(dest, { delete: key });
      } catch (e) {
        repondre("❌ *Error:* I need *admin rights* to delete this message.");
      }
    } else {
      repondre("⛔ *You must be an administrator to delete messages.*");
    }
  }
});

bmbtz({ nomCom: "info", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;
  if (!verifGroupe) {
    repondre("⚠️ This command is for groups only!");
    return;
  }

  let ppgroup;
  try {
    ppgroup = await zk.profilePictureUrl(dest, 'image');
  } catch {
    ppgroup = conf.IMAGE_MENU;
  }

  const info = await zk.groupMetadata(dest);

  let mess = {
    image: { url: ppgroup },
    caption:
`╭━━━❰ *GROUP INFO PANEL* ❱━━━✦
┃
┃ 🏷️ *Group Name:* ${info.subject}
┃ 🆔 *Group ID:* ${dest}
┃ 📝 *Description:*
┃ ${info.desc?.replace(/\n/g, '\n┃ ') || 'No description available'}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━✦`
  };

  zk.sendMessage(dest, mess, { quoted: ms });
});


 //------------------------------------antilien-------------------------------

 bmbtz({ nomCom: "antilink", categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {
  var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) return repondre("🚫 *This command works in groups only.*");

  if (superUser || verifAdmin) {
    const enetatoui = await verifierEtatJid(dest);
    try {
      if (!arg || !arg[0] || arg === ' ') {
        return repondre(
`╭───❰ *ANTILINK HELP MENU* ❱───╮
│
│ ⚙️ *antilink on* → Activate anti-link
│ ⚙️ *antilink off* → Deactivate anti-link
│ ⚙️ *antilink action/remove* → Remove link silently
│ ⚙️ *antilink action/warn* → Warn user
│ ⚙️ *antilink action/delete* → Delete link only
│
│ 📝 Default action is: *delete*
╰────────────────────────────╯`
        );
      }

      const input = arg.join('').toLowerCase();

      if (arg[0] === 'on') {
        if (enetatoui) {
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ 🔗 Antilink is *already activated* 
╰──────────────────────────╯`
          );
        } else {
          await ajouterOuMettreAJourJid(dest, "oui");
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ✅ Antilink has been *activated*
╰──────────────────────────╯`
          );
        }
      } else if (arg[0] === 'off') {
        if (enetatoui) {
          await ajouterOuMettreAJourJid(dest, "non");
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ❌ Antilink has been *deactivated*
╰──────────────────────────╯`
          );
        } else {
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ℹ️ Antilink was *not active* 
╰──────────────────────────╯`
          );
        }
      } else if (input.startsWith('action/')) {
        let action = input.split("/")[1];
        if (['remove', 'warn', 'delete'].includes(action)) {
          await mettreAJourAction(dest, action);
          repondre(
`╭───❰ *ANTILINK ACTION UPDATED* ❱───╮
│ 🔧 Action settings to: *${action.toUpperCase()}*
╰────────────────────────────────╯`
          );
        } else {
          repondre(
`❌ Invalid action.
✅ Allowed: *remove*, *warn*, *delete*`
          );
        }
      } else {
        repondre(
`❗ Wrong usage.

Try: *antilink on*, *antilink off*, *antilink action/remove* etc.`
        );
      }

    } catch (error) {
      repondre("❌ *Error:* " + error.message || error);
    }

  } else {
    repondre("🚫 *Only group admins or super users can use this command.*");
  }
});

//----------------------------------------------------------------------------

bmbtz({ nomCom: "group", categorie: 'Group' }, async (dest, zk, commandeOptions) => {

  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;

  if (!verifGroupe) {
    return repondre("🚫 *This command is for group use only.*");
  }

  if (!(superUser || verifAdmin)) {
    return repondre("🌚 *Only group admins can use this command.*");
  }

  if (!arg[0]) {
    return repondre(
`📌 *Usage Instructions:*

Type:
- *group open*  → To allow everyone to send messages
- *group close* → To restrict messages to admins only`);
  }

  const option = arg.join(' ').toLowerCase();

  switch (option) {
    case "open":
      await zk.groupSettingUpdate(dest, 'not_announcement');
      repondre(
`╭──❰ *GROUP STATUS UPDATE* ❱──╮
│
│ 🔓 The group has been *opened*.
│ ✉️ All members can now send messages.
│
╰────────────────────────────╯`);
      break;

    case "close":
      await zk.groupSettingUpdate(dest, 'announcement');
      repondre(
`╭──❰ *GROUP STATUS UPDATE* ❱──╮
│
│ 🔐 The group has been *closed*.
│ 👑 Only *admins* can send messages now.
│
╰────────────────────────────╯`);
      break;

    default:
      repondre("❌ *Invalid option.* Use: group open | group close");
  }
});

bmbtz({ nomCom: "left", categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { repondre, verifGroupe, superUser } = commandeOptions;
  if (!verifGroupe) { repondre("order reserved for group only"); return };
  if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
  await repondre('sayonnara') ;
   
  zk.groupLeave(dest)
});

bmbtz({ nomCom: "gname", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("⚠️ This command is for *group admins only*.");
    return;
  }

  if (!arg[0]) {
    repondre("✏️ Please enter the new *group name*.");
    return;
  }

  const nom = arg.join(' ');
  await zk.groupUpdateSubject(dest, nom);

  const msg =
`╭─❰ *GROUP NAME UPDATED* ❱─╮
│
│ 🆕 New Group Name:
│ ${nom.replace(/\n/g, '\n│ ')}
│
╰────────────────────╯`;

  repondre(msg);
});

bmbtz({ nomCom: "gdesc", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("⚠️ This command is for *group admins only*.");
    return;
  }

  if (!arg[0]) {
    repondre("✏️ Please enter the new *group description*.");
    return;
  }

  const nom = arg.join(' ');
  await zk.groupUpdateDescription(dest, nom);

  const msg =
`╭───❰ *GROUP DESCRIPTION UPDATED* ❱───✦
┃
┃ ✅ Description has been changed to:
┃ ${nom.replace(/\n/g, '\n┃ ')}
┃
╰─────────────────────────────✦`;

  repondre(msg);
});

bmbtz({ nomCom: "gpp", categorie: 'Group' }, async (dest, zk, commandeOptions) => {

  const { repondre, msgRepondu, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("order reserved for administrators of the group");
    return;
  }; 
  if (msgRepondu.imageMessage) {
    const pp = await  zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;

    await zk.updateProfilePicture(dest, { url: pp })
                .then( () => {
                    zk.sendMessage(dest,{text:"Group pfp changed"})
                    fs.unlinkSync(pp)
                }).catch(() =>   zk.sendMessage(dest,{text:err})
)
        
  } else {
    repondre('Please mention an image')
  }

});

/////////////
bmbtz({ nomCom: "hidetag", categorie: 'Group', reaction: "🎤" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, verifGroupe, arg, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) return repondre("🚫 *This command is allowed only in groups.*");
  if (!(verifAdmin || superUser)) return repondre("🚀 *This command is for group admins only.*");

  const metadata = await zk.groupMetadata(dest);
  const tag = metadata.participants.map(p => p.id);

  let msg;

  if (msgRepondu) {
    if (msgRepondu.imageMessage) {
      let media = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
      msg = {
        image: { url: media },
        caption: `📢 *Broadcast Message:*\n\n${msgRepondu.imageMessage.caption || ''}`,
        mentions: tag
      };
    } else if (msgRepondu.videoMessage) {
      let media = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
      msg = {
        video: { url: media },
        caption: `🎥 *Video Broadcast:*\n\n${msgRepondu.videoMessage.caption || ''}`,
        mentions: tag
      };
    } else if (msgRepondu.audioMessage) {
      let media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      msg = {
        audio: { url: media },
        mimetype: 'audio/mp4',
        mentions: tag
      };
    } else if (msgRepondu.stickerMessage) {
      let media = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
      let stickerMess = new Sticker(media, {
        pack: 'bmb-tech',
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "transparent",
      });
      const stickerBuffer = await stickerMess.toBuffer();
      msg = {
        sticker: stickerBuffer,
        mentions: tag
      };
    } else {
      msg = {
        text: `📢 *Message:*\n\n${msgRepondu.conversation}`,
        mentions: tag
      };
    }

    zk.sendMessage(dest, msg);

  } else {
    if (!arg || !arg[0]) return repondre("ℹ️ *Enter the text to announce* or reply to a media message.");

    let text =
`╭──❰ *HIDE TAG ANNOUNCEMENT* ❱──╮
│
│ 💬 ${arg.join(' ')}
│
╰────────────────────────────╯`;

    zk.sendMessage(dest, {
      text: text,
      mentions: tag
    });
  }
});
