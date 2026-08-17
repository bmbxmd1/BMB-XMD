const { bmbtz } = require("../../devbmb/bmbtz");
const os = require("os");
const { ButtonV2 } = require("../../lib/buttonBuilder");
const conf = require("../../settings");

/**
 * Formats uptime seconds into a human-readable "1h 16m 37s" string
 */
function runtime(seconds) {
  seconds = Number(seconds);
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  var hDisplay = h > 0 ? h + "h " : "";
  var mDisplay = m > 0 ? m + "m " : "";
  var sDisplay = s + "s";
  return (hDisplay + mDisplay + sDisplay).trim();
}

bmbtz({
  nomCom: "ping",
  desc: "Check bot speed and status.",
  categorie: "General",
  reaction: "⚡"
}, async (dest, client, reponse) => {
  const { ms } = reponse;
  const start = new Date().getTime();

  try {
    const end = new Date().getTime();
    const ping = Math.max(end - start, 1) / 1000; // avoid showing 0ms
    const uptime = runtime(process.uptime());

    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
    const freeRam = (os.freemem() / 1024 / 1024).toFixed(2);
    const usedRam = (totalRam - freeRam).toFixed(2);

    const now = new Date();
    const serverTime = now.toLocaleString("en-US", {
      timeZone: "Africa/Nairobi",
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const hour = Number(now.toLocaleString("en-US", { timeZone: "Africa/Nairobi", hour: "numeric", hour12: false }));
    const greeting = hour >= 5 && hour < 12 ? "Good morning"
      : hour >= 12 && hour < 18 ? "Good afternoon"
      : hour >= 18 && hour < 22 ? "Good evening"
      : "Good night";

    const prefixe = conf.PREFIXE || ".";

    const statusMsg = `📌 *PING*
━━━━━━━━━━━━━━━━
${greeting}, Bmb Tech
Prefix : ${prefixe}
𝐋𝐚𝐭𝐞𝐧𝐜𝐲 : ${ping.toFixed(4)}ms
𝐒𝐞𝐫𝐯𝐞𝐫 𝐓𝐢𝐦𝐞 : ${serverTime}
𝐔𝐩𝐭𝐢𝐦𝐞 : ${uptime}
𝐌𝐞𝐦𝐨𝐫𝐲 : ${usedRam}/${totalRam} MB
𝐍𝐨𝐝𝐞𝐉𝐒 : ${process.version}
𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : ${process.platform === "linux" ? "Linux" : process.platform}
━━━━━━━━━━━━━━━━
© bmb tech`;

    await client.sendMessage(dest, { text: statusMsg }, { quoted: ms });

    // Quick-nav buttons (styled after NOVA-XMD's fullmenu.js)
    try {
      const btnV2 = new ButtonV2(client);
      btnV2
        .setBody(`📌 *QUICK NAV*\n━━━━━━━━━━━━━━━━\nTap a button below\n━━━━━━━━━━━━━━━━\n© bmb tech`)
        .setFooter("> © BMB TECH")
        .addButton("📜 Menu", `${prefixe}menu`)
        .addButton("👑 Owner", `${prefixe}owner`);
      await btnV2.send(dest, { mentions: [reponse.auteurMessage] });
    } catch (btnErr) {
      // Buttons are best-effort (not every client/device renders them);
      // the ping status above has already been delivered either way.
      console.log("Ping buttons could not be sent:", btnErr?.message || btnErr);
    }

  } catch (error) {
    console.error("Ping Command Error:", error);
    await client.sendMessage(dest, { text: "An error occurred while executing the ping command." }, { quoted: ms });
  }
});
