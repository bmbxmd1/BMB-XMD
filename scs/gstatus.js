const { bmbtz } = require("../devbmb/bmbtz");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

async function downloadQuotedMedia(msgRepondu, type) {
  const stream = await downloadContentFromMessage(msgRepondu, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

function extractGroupJid(text) {
  if (!text) return null;
  const idMatch = text.match(/(\d+)@g\.us/);
  if (idMatch) return idMatch[0];
  const linkMatch = text.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
  if (linkMatch) return linkMatch[1]; // resolved via groupGetInviteInfo below
  return null;
}

bmbtz({
  nomCom: "gstatus",
  alias: ["groupstatus", "gstat"],
  reaction: "📤",
  desc: "Post the replied message as a WhatsApp Group Status",
  categorie: "Group"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms, msgRepondu, verifGroupe } = commandeOptions;

  if (!msgRepondu) {
    return repondre("❎ Reply to an image, video, or text message with *.gstatus [caption]*.\n\nIf you're in DM, also give a group link or JID:\n*.gstatus https://chat.whatsapp.com/xxxx caption here*");
  }

  const caption = arg.join(" ").trim();

  try {
    // Work out which group this status should be posted to.
    let targetGroupJid = null;

    if (verifGroupe) {
      // Used from inside a group — post to this same group.
      targetGroupJid = dest;
    } else {
      // Used in DM — need a group link or JID from the arguments.
      const raw = extractGroupJid(caption);
      if (!raw) {
        return repondre("❎ In DM you must include a group link or JID.\n\n*Example:* .gstatus https://chat.whatsapp.com/xxxx My caption");
      }
      if (raw.endsWith("@g.us")) {
        targetGroupJid = raw;
      } else {
        // It's an invite code — resolve it to a real group JID.
        const info = await zk.groupGetInviteInfo(raw);
        targetGroupJid = info.id;
      }
    }

    await zk.sendMessage(dest, { react: { text: "⏳", key: ms.key } });

    const statusContextInfo = {
      isGroupStatus: true,
      statusAttributions: [{ type: 10 }],
      statusAudienceMetadata: { audienceType: "CLOSE_FRIENDS" }
    };

    if (msgRepondu.imageMessage) {
      const buffer = await downloadQuotedMedia(msgRepondu.imageMessage, "image");
      await zk.sendMessage(targetGroupJid, {
        image: buffer,
        caption: caption || msgRepondu.imageMessage.caption || "",
        contextInfo: { ...statusContextInfo, statusSourceType: "IMAGE" }
      });
    } else if (msgRepondu.videoMessage) {
      const buffer = await downloadQuotedMedia(msgRepondu.videoMessage, "video");
      await zk.sendMessage(targetGroupJid, {
        video: buffer,
        caption: caption || msgRepondu.videoMessage.caption || "",
        contextInfo: { ...statusContextInfo, statusSourceType: "VIDEO" }
      });
    } else if (msgRepondu.audioMessage) {
      const buffer = await downloadQuotedMedia(msgRepondu.audioMessage, "audio");
      await zk.sendMessage(targetGroupJid, {
        audio: buffer,
        mimetype: msgRepondu.audioMessage.mimetype || "audio/mpeg",
        ptt: msgRepondu.audioMessage.ptt || false,
        contextInfo: { ...statusContextInfo, statusSourceType: "AUDIO" }
      });
    } else {
      const textContent = caption ||
        msgRepondu.conversation ||
        msgRepondu.extendedTextMessage?.text || "";

      if (!textContent) {
        await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
        return repondre("❎ Couldn't find text, image, video, or audio in the replied message.");
      }

      await zk.sendMessage(targetGroupJid, {
        text: textContent,
        contextInfo: { ...statusContextInfo, statusSourceType: "TEXT" }
      });
    }

    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });
    repondre(`✅ Posted to group status successfully.`);

  } catch (error) {
    console.error("GSTATUS ERROR:", error);
    await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    repondre("❌ *Failed to post group status*\n\n• Make sure the bot is a member of that group\n• Group status may not be supported on your WhatsApp version\n• Try again later.");
  }
});
