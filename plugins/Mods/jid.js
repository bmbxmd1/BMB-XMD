const { bmbtz } = require('../../devbmb/bmbtz');

/**
 * jid
 *
 * Split out of the old combined mods.js. Fixed: `jid = dest` /
 * `jid = auteurMsgRepondu` had no `let`/`const` — that silently
 * created an implicit global variable, which works by accident in a
 * single-file script but is a real hazard shared across the whole
 * process once split into its own module scope. Declared properly now.
 */
bmbtz({
    nomCom: "jid",
    alias: ["getjid", "myjid"],
    categorie: "Mods"
}, async (dest, client, commandeOptions) => {
    const { ms, repondre, msgRepondu, superUser, auteurMsgRepondu } = commandeOptions;

    if (!superUser) {
        repondre("command reserved for the bot owner");
        return;
    }

    let jid;
    if (!msgRepondu) {
        jid = dest;
    } else {
        jid = auteurMsgRepondu;
    }

    client.sendMessage(dest, { text: jid }, { quoted: ms });
});
