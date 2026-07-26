const { exec } = require("child_process");
const { bmbtz } = require("../devbmb/bmbtz");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require('../lib/antilien');
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require('../lib/antibot');
const { search, download } = require('aptoide-scraper');
const fs = require('fs-extra');
const conf = require("../settings");
const { default: axios } = require("axios");
const { getBinaryNodeChild, getBinaryNodeChildren } = require("@whiskeysockets/baileys").default;


// ADD COMMAND
bmbtz({
  nomCom: 'add',
  categorie: "Group",
  reaction: '🪄'
}, async (jid, sock, ctx) => {
  let {
    repondre,
    verifAdmin,
    msgRepondu,
    infosGroupe,
    auteurMsgRepondu,
    verifGroupe,
    auteurMessage,
    superUser,
    idBot,
    arg
  } = ctx;

  if (!verifGroupe) return repondre("*This command works in groups only!*");
  if (!superUser) return repondre("You are too weak to do that");
  if (!verifAdmin) return repondre("You are not an admin here!");

  let groupMetadata;
  try {
    groupMetadata = await sock.groupMetadata(jid);
  } catch {
    return repondre("Failed to fetch group metadata.");
  }

  const participants = groupMetadata.participants;
  if (!arg[0]) return repondre("Provide number to be added. Example:\nadd 255XXXXX457");

  const numbersInput = arg.join(" ");
  const existingMembers = participants.map(p => p.id);
  let validNumbers = [];
  let alreadyInGroup = [];

  try {
    const checkNumbers = await Promise.all(
      numbersInput.split(',')
        .map(num => num.replace(/[^0-9]/g, ''))
        .filter(num => num.length > 4 && num.length < 14)
        .map(async num => [num, await sock.onWhatsApp(num + "@s.whatsapp.net")])
    );

    checkNumbers.forEach(([number, exists]) => {
      const jidNumber = number + "@s.whatsapp.net";
      if (existingMembers.includes(jidNumber)) {
        alreadyInGroup.push(jidNumber);
      } else if (exists[0]?.exists) {
        validNumbers.push(number + "@s.whatsapp.net");
      }
    });

  } catch {
    return repondre("Error validating phone numbers.");
  }

  for (const user of alreadyInGroup) {
    repondre(`That user is already in this group!`);
  }

  let addResult;
  try {
    if (validNumbers.length > 0) {
      addResult = await sock.query({
        tag: 'iq',
        attrs: { type: 'settings', xmlns: "w:g2", to: jid },
        content: validNumbers.map(vnum => ({
          tag: "add",
          attrs: {},
          content: [{ tag: "participant", attrs: { jid: vnum } }]
        }))
      });

      for (const num of validNumbers) {
        repondre(`Successfully added @${num.split('@')[0]}`);
      }
    }
  } catch {
    return repondre("Failed to add user to the group!");
  }

  let groupPic;
  try {
    groupPic = await sock.profilePictureUrl(jid, "image").catch(() =>
      "https://i.ibb.co/n6rw805/694affc7ca5a5fb0cb58c2b4533f962d.jpg"
    );
  } catch {
    groupPic = "https://i.ibb.co/n6rw805/694affc7ca5a5fb0cb58c2b4533f962d.jpg";
  }

  const failedAdds = addResult?.content?.find(c => c.tag === "add")
    ?.content?.filter(c => c.attrs.error == 403);

  let inviteCode;
  try {
    inviteCode = await sock.groupInviteCode(jid);
  } catch {
    return repondre("Failed to generate group invite code.");
  }

  for (const fail of failedAdds || []) {
    const userJid = fail.attrs.jid;
    repondre(`I cannot add @${userJid.split('@')[0]} due to privacy settings, sending invite link instead.`);
    await sock.sendMessage(userJid, {
      image: { url: groupPic },
      caption: `You have been invited to join the group ${groupMetadata.subject}:\n\nhttps://chat.whatsapp.com/${inviteCode}\n\n*POWERED BY B.M.B-TECH*`
    }, { quoted: msgRepondu });
  }
});


// REJECT COMMAND
bmbtz({
  nomCom: "reject",
  aliases: ["rejectall", "rej", "reject-all"],
  categorie: "Group",
  reaction: '😇'
}, async (jid, sock, ctx) => {
  const { repondre, verifGroupe, verifAdmin } = ctx;
  if (!verifGroupe) return repondre("This command works in groups only");
  if (!verifAdmin) return repondre("You are not an admin here!");

  const pending = await sock.groupRequestParticipantsList(jid);
  if (pending.length === 0) return repondre("There are no pending join requests for this group.");

  for (const p of pending) {
    await sock.groupRequestParticipantsUpdate(jid, [p.jid], "reject");
  }
  repondre("All pending join requests have been rejected.");
});


// APPROVE COMMAND
bmbtz({
  nomCom: 'approve',
  aliases: ["approve-all", "accept"],
  categorie: "Group",
  reaction: '🔎'
}, async (jid, sock, ctx) => {
  const { repondre, verifGroupe, verifAdmin } = ctx;
  if (!verifGroupe) return repondre("This command works in groups only");
  if (!verifAdmin) return repondre("You are not an admin here!");

  const pending = await sock.groupRequestParticipantsList(jid);
  if (pending.length === 0) return repondre("There are no pending join requests.");

  for (const p of pending) {
    await sock.groupRequestParticipantsUpdate(jid, [p.jid], 'approve');
  }
  repondre("All pending participants have been approved to join.");
});


// VCF COMMAND
bmbtz({
  nomCom: "vcf",
  aliases: ["savecontact", "savecontacts"],
  categorie: "Group",
  reaction: '♻️'
}, async (jid, sock, ctx) => {
  const { repondre, verifGroupe, verifAdmin, ms } = ctx;
  const fs = require('fs');
  if (!verifAdmin) return repondre("You are not an admin here!");
  if (!verifGroupe) return repondre("This command works in groups only");

  try {
    let metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;
    let vcardData = '';

    for (let member of participants) {
      let number = member.id.split('@')[0];
      let name = member.name || member.notify || `[B.M.B-TECH] +${number}`;
      vcardData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD\n`;
    }

    repondre(`A moment, *B.M.B-TECH* is compiling ${participants.length} contacts into a vcf...`);
    fs.writeFileSync("./contacts.vcf", vcardData.trim());

    await sock.sendMessage(jid, {
      document: fs.readFileSync("./contacts.vcf"),
      mimetype: "text/vcard",
      fileName: `${metadata.subject}.vcf`,
      caption: `VCF for ${metadata.subject}\nTotal Contacts: ${participants.length}\n*THANKS FOR USING B.M.B-TECH*`
    }, { ephemeralExpiration: 86400, quoted: ms });

    fs.unlinkSync('./contacts.vcf');

  } catch (err) {
    console.error("Error while creating or sending VCF:", err);
    repondre("An error occurred while creating or sending the VCF. Please try again.");
  }
});


// INVITE COMMAND
bmbtz({
  nomCom: 'invite',
  aliases: ["link"],
  categorie: 'Group',
  reaction: '🪄'
}, async (jid, sock, ctx) => {
  const { repondre, nomGroupe, nomAuteurMessage, verifGroupe } = ctx;
  if (!verifGroupe) return repondre("*This command works in groups only!*");

  try {
    const code = await sock.groupInviteCode(jid);
    repondre(`Hello ${nomAuteurMessage}, here is the group link of ${nomGroupe}:\n\nClick Here To Join: https://chat.whatsapp.com/${code}`);
  } catch (err) {
    console.error("Error fetching group invite link:", err);
    repondre("An error occurred while fetching the group invite link. Please try again.");
  }
});


// REVOKE COMMAND
bmbtz({
  nomCom: 'revoke',
  categorie: 'Group'
}, async (jid, sock, ctx) => {
  const { repondre, verifGroupe, verifAdmin } = ctx;
  if (!verifAdmin) return repondre("for admins.");
  if (!verifGroupe) return repondre("This command is only allowed in groups.");

  await sock.groupRevokeInvite(jid);
  repondre("Group link revoked.");
});
