const { bmbtz } = require('../../devbmb/bmbtz');

/**
 * kickall
 *
 * Split out of the old combined mods.js (its categorie was already
 * 'Group', so this file lives in plugins/Group/ to match, even though
 * it came from mods.js originally).
 *
 * Fixed: `sleep` used `settingsTimeout(resolve, ms)` — that function
 * doesn't exist in JavaScript (the real one is `setTimeout`), the same
 * typo bug found in boom.js. Every call threw a ReferenceError
 * immediately, so this command never actually removed anyone — it
 * would just silently fail partway through the try block.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

bmbtz({
    nomCom: "kickall",
    alias: ["clearmembers", "removeall"],
    categorie: 'Group',
    reaction: "📣"
}, async (dest, client, commandeOptions) => {
    const { auteurMessage, repondre, verifGroupe, infosGroupe, superUser } = commandeOptions;

    if (!verifGroupe) { repondre("✋🏿 ✋🏿this command is reserved for groups ❌"); return; }

    const metadata = await client.groupMetadata(dest);

    if (superUser || auteurMessage == metadata.owner) {
        repondre('No_admin members will be removed from the group. You have 5 seconds to reclaim your choice by restarting the bot.');
        await sleep(5000);

        let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
        try {
            let users = membresGroupe.filter((member) => !member.admin);

            for (const membre of users) {
                await client.groupParticipantsUpdate(dest, [membre.id], "remove");
                await sleep(500);
            }
        } catch (e) {
            repondre("I need administration rights");
        }
    } else {
        repondre("Order reserved for the group owner for security reasons");
        return;
    }
});
