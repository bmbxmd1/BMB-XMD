const { bmbtz } = require("../../devbmb/bmbtz");
const { getAllSudoNumbers, isSudoTableNotEmpty } = require("../../lib/sudo");
const conf = require("../../settings");

bmbtz(
  {
    nomCom: "owner",
    categorie: "General",
    reaction: "👑",
  },
  async (dest, client, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;

    const cleanOwner = conf.NUMERO_OWNER.replace(/[^0-9]/g, "");
    const ownerJid = `${cleanOwner}@s.whatsapp.net`;

    /* ================================================= */
    /* OPTION 1 — SEND CONTACT (VIEW CONTACT STYLE)     */
    /* ================================================= */

    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${conf.OWNER_NAME}`,
      "ORG:BMB-XMD;",
      `TEL;type=CELL;type=VOICE;waid=${cleanOwner}:+${cleanOwner}`,
      "END:VCARD",
    ].join("\n");

    await client.sendMessage(
      dest,
      {
        contacts: {
          displayName: conf.OWNER_NAME,
          contacts: [{ vcard }],
        },
      },
      { quoted: ms }
    );

    /* ================================================= */
    /* OPTION 2 — SEND DETAILS + IMAGE + MENTIONS       */
    /* ================================================= */

    let caption = `👑 *BMB-XMD OWNER INFORMATION*\n`;
    caption += `━━━━━━━━━━━━━━━━━━\n`;
    caption += `📛 *Name:* Bmb Tech\n`;
    caption += `📞 *Number:* +254769529791\n`;
    caption += `⚙️ *Role:* Developer & Founder\n`;
    caption += `📦 *Edition:* Bmb Tech bot Version\n\n`;

    const mentionedJids = [ownerJid];

    const hasSudoUsers = await isSudoTableNotEmpty();

    if (hasSudoUsers) {
      caption += `💼 *Other Sudo Users:*\n`;

      const sudoNumbers = await getAllSudoNumbers();

      for (const sudo of sudoNumbers) {
        if (sudo) {
          const cleanSudo = sudo.replace(/[^0-9]/g, "");
          caption += `- @${cleanSudo}\n`;
          mentionedJids.push(`${cleanSudo}@s.whatsapp.net`);
        }
      }
    }

    await client.sendMessage(dest, {
      image: { url: mybotpic() },
      caption: caption,
      mentions: mentionedJids,
    });
  }
);
