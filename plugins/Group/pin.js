const { bmbtz } = require('../../devbmb/bmbtz');

/**
 * pin / unpin
 *
 * Pins (or unpins) the message the command is replying to. BMB-TECH's
 * commandeOptions doesn't expose the quoted stanzaId directly (only
 * the quoted content via msgRepondu and its author via auteurMsgRepondu),
 * so this reads it straight off the raw message (reponse.ms).
 */
function registerPinCommand(nomCom, isUnpin) {
    bmbtz({
        nomCom,
        categorie: 'Group',
        reaction: '📌'
    }, async (dest, client, reponse) => {
        const { repondre, verifGroupe, verifAdmin, superUser, ms } = reponse;

        if (!verifGroupe) {
            return repondre('🚫 *This command is for group use only.*');
        }
        if (!(verifAdmin || superUser)) {
            return repondre('Sorry, only group admins can use this command.');
        }

        const contextInfo = ms?.message?.extendedTextMessage?.contextInfo;
        const stanzaId = contextInfo?.stanzaId;
        const participant = contextInfo?.participant;

        if (!stanzaId) {
            return repondre(`Quote a message to ${isUnpin ? 'unpin' : 'pin'} it.`);
        }

        if (typeof client.pinMessage !== 'function') {
            return repondre('Pin is not supported by this Baileys build.');
        }

        const messageKey = {
            id: stanzaId,
            remoteJid: dest,
            participant,
        };

        try {
            await client.pinMessage(dest, messageKey, isUnpin ? 0 : 1);
            return repondre(`📌 Message ${isUnpin ? 'unpinned' : 'pinned'} successfully.`);
        } catch (e) {
            const msg = (e.message || e).toString();
            if (msg.includes('forbidden') || msg.includes('not-authorized') || msg.includes('403')) {
                return repondre('Failed to pin. Make sure I\'m an admin.');
            }
            return repondre('Pin failed: ' + msg.slice(0, 80));
        }
    });
}

registerPinCommand('pin', false);
registerPinCommand('unpin', true);
