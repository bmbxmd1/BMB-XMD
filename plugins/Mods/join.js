const { bmbtz } = require('../../devbmb/bmbtz');

/**
 * join
 *
 * Enhanced error reporting: the previous catch block just said
 * "Unknown error" for every failure, which hid the actual reason
 * (expired/invalid link, already a member, group full, revoked
 * invite, etc). Now logs and surfaces the real WhatsApp error detail.
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
        console.log('[join] groupAcceptInvite failed:', e?.message || e);
        const statusCode = e?.output?.statusCode;
        let reason = 'Unknown error.';
        if (statusCode === 401 || statusCode === 403) reason = 'This invite link is no longer valid, or I was removed/banned from this group before.';
        else if (statusCode === 404) reason = 'This invite link is invalid or has expired.';
        else if (statusCode === 409) reason = 'I am already a member of this group.';
        else if (e?.message) reason = e.message;
        repondre(`Failed to join: ${reason}`);
    }
});
