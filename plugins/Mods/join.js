const { bmbtz } = require('../../devbmb/bmbtz');

/**
 * join
 *
 * Split out of the old combined mods.js. Added a check for a missing
 * `arg[0]` — the previous version called `.split(...)` on it directly,
 * which would throw if no link was provided at all.
 */
bmbtz({
    nomCom: "join",
    alias: ["joingroup", "groupjoin"],
    categorie: "Mods"
}, async (dest, client, commandeOptions) => {
    const { arg, repondre, superUser } = commandeOptions;

    if (!superUser) {
        repondre("command reserved for the bot owner");
        return;
    }

    if (!arg[0] || !arg[0].includes('https://chat.whatsapp.com/')) {
        repondre("Please provide a valid WhatsApp group invite link.");
        return;
    }

    let result = arg[0].split('https://chat.whatsapp.com/')[1];

    try {
        await client.groupAcceptInvite(result);
        repondre(`Succes`);
    } catch (e) {
        repondre('Unknown error');
    }
});
