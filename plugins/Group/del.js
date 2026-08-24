const { bmbtz } = require("../../devbmb/bmbtz");

bmbtz({
  nomCom: "del",
  alias: ["delete", "clear"],
  categorie: 'Group',
  reaction: "🧹"
}, async (dest, client, commandeOptions) => {
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
    await client.sendMessage(dest, { delete: key });
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
        await client.sendMessage(dest, {
          text:
`╭──❰ *MESSAGE DELETION* ❱──╮
│
│ 🗑️ The message will now be deleted.
│ 🔒 Only admins or bot owners can use this command.
│
╰────────────────────────╯`,
          mentions: [auteurMsgRepondu]
        });

        await client.sendMessage(dest, { delete: key });
      } catch (e) {
        repondre("❌ *Error:* I need *admin rights* to delete this message.");
      }
    } else {
      repondre("⛔ *You must be an administrator to delete messages.*");
    }
  }
});
