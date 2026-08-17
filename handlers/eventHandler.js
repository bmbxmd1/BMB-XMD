"use strict";
/**
 * eventHandler.js
 *
 * Handles group-participants.update events: welcome, goodbye,
 * anti-promote, and anti-demote. Moved here out of index.js (which
 * previously had this logic inline) so index.js only wires up the
 * event listener and delegates the actual work here — matching how
 * NOVA-XMD splits this into handlers/eventHandler.js's groupEvents()
 * function, called from its index.js the same way.
 *
 * This is a structural move only — the behavior (custom text support,
 * fallback profile picture, mention formatting, super-user bypass for
 * anti-promote/anti-demote) is unchanged from what index.js did before.
 */
const { recupevents } = require('../lib/welcome');

/**
 * @param {import('@whiskeysockets/baileys').WASocket} client
 * @param {{ id: string, participants: string[], action: string, author?: string }} group
 */
async function groupEvents(client, group) {
    console.log('Group participants update triggered:', group);

    try {
        const metadata = await client.groupMetadata(group.id);
        const membres = group.participants;
        const groupName = metadata.subject || "Group";
        const groupDesc = metadata.desc || "no group information";

        // date and time
        const now = new Date();
        const date = now.toLocaleDateString('en-GB');
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        // 🟢 WELCOME
        if (group.action === 'add' && (await recupevents(group.id, "welcome")) === 'on') {
            let ppuser;
            try {
                ppuser = await client.profilePictureUrl(membres[0], 'image');
            } catch (error) {
                ppuser = 'https://files.catbox.moe/f9jxiv.jpg';
            }

            const customWelcome = await recupevents(group.id, "welcometext");
            let msg;
            if (customWelcome && customWelcome !== 'non') {
                msg = customWelcome
                    .replace(/{user}/g, `@${membres[0].split("@")[0]}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{desc}/g, groupDesc)
                    .replace(/{date}/g, date)
                    .replace(/{time}/g, time)
                    .replace(/{count}/g, String(metadata.participants?.length || ''));
            } else {
                msg = `
╭───────────────────────━⊷
║𝗕.𝗠.𝗕-𝗧𝗘𝗖𝗛 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗚𝗥𝗢𝗨𝗣
║════════════════════════
║ɢʀᴏᴜᴘ ɴᴀᴍᴇ ${groupName}
║════════════════════════
║ᴅᴀᴛᴇ ʜᴇ ᴊᴏɪɴᴇᴅ ${date}
║════════════════════════
║ᴛʜᴇ ᴛɪᴍᴇ ʜᴇ ᴇɴᴛᴇʀᴇᴅ ${time}
║════════════════════════
║ Bmb web bmbtech.zone.id
║════════════════════════
║ ${groupDesc}
╰──────────────────────━⊷`;
            }

            await client.sendMessage(group.id, {
                image: { url: ppuser },
                caption: msg,
                mentions: membres
            });

            console.log('✅ Welcome message sent.');
        }

        // 🔴 GOODBYE
        else if (group.action === 'remove' && (await recupevents(group.id, "goodbye")) === 'on') {
            let ppuser;
            try {
                ppuser = await client.profilePictureUrl(membres[0], 'image');
            } catch (error) {
                ppuser = 'https://files.catbox.moe/f9jxiv.jpg';
            }

            const customGoodbye = await recupevents(group.id, "goodbyetext");
            let msg;
            if (customGoodbye && customGoodbye !== 'non') {
                msg = customGoodbye
                    .replace(/{user}/g, `@${membres[0].split("@")[0]}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{desc}/g, groupDesc)
                    .replace(/{date}/g, date)
                    .replace(/{time}/g, time)
                    .replace(/{count}/g, String(metadata.participants?.length || ''));
            } else {
                msg = `
╭─────────────────────────━⊷
║ɢᴏᴏᴅʙʏᴇ👋 @${membres[0].split("@")[0]}
║════════════════════════
║ᴛʜᴇ ᴛɪᴍᴇ ʜᴇ ʟᴇғᴛ ${time}
║════════════════════════
║ᴅᴀᴛᴇ ɪs ᴏᴜᴛ ${date}
║════════════════════════
║Bmb web bmbtech.zone.id
╰──────────────────────────━⊷`;
            }

            await client.sendMessage(group.id, {
                image: { url: ppuser },
                caption: msg,
                mentions: membres
            });

            console.log('✅ Goodbye message sent.');
        }

        // 🛑 ANTI-PROMOTE
        else if (group.action === 'promote' && (await recupevents(group.id, "antipromote")) === 'on') {
            if (
                group.author === metadata.owner ||
                group.author === client.user.id ||
                group.author === group.participants[0]
            ) {
                console.log('SuperUser detected, no action taken.');
                return;
            }

            await client.groupParticipantsUpdate(group.id, [group.author, group.participants[0]], "demote");

            await client.sendMessage(group.id, {
                text: `🚫 @${group.author.split("@")[0]} has violated the anti-promotion rule. Both @${group.author.split("@")[0]} and @${group.participants[0].split("@")[0]} have been removed from administrative rights.`,
                mentions: [group.author, group.participants[0]]
            });

            console.log('❌ Anti-promotion action executed.');
        }

        // 🟡 ANTI-DEMOTE
        else if (group.action === 'demote' && (await recupevents(group.id, "antidemote")) === 'on') {
            if (
                group.author === metadata.owner ||
                group.author === client.user.id ||
                group.author === group.participants[0]
            ) {
                console.log('SuperUser detected, no action taken.');
                return;
            }

            await client.groupParticipantsUpdate(group.id, [group.author], "demote");
            await client.groupParticipantsUpdate(group.id, [group.participants[0]], "promote");

            await client.sendMessage(group.id, {
                text: `🚫 @${group.author.split("@")[0]} has violated the anti-demotion rule by removing @${group.participants[0].split("@")[0]}. Consequently, he has been stripped of administrative rights.`,
                mentions: [group.author, group.participants[0]]
            });

            console.log('❌ Anti-demotion action executed.');
        }

    } catch (e) {
        console.error('❌ Error handling group participants update:', e);
    }
}

module.exports = { groupEvents };
