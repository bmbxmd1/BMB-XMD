const { bmbtz } = require("../../devbmb/bmbtz");
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid, recupererActionJid } = require("../../lib/antilien");

/**
 * antilink
 *
 * Fixed a real bug while splitting this out: `recupererActionJid` was
 * used (to show the current action in the help menu) but never
 * imported from lib/antilien.js — calling `.antilink` with no
 * arguments would throw a ReferenceError every time.
 */
bmbtz({ nomCom: "antilink", alias: ["antilinks"], categorie: 'Group', reaction: "🔗" }, async (dest, client, commandeOptions) => {
  var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) return repondre("🚫 *This command works in groups only.*");

  if (superUser || verifAdmin) {
    const enetatoui = await verifierEtatJid(dest);
    try {
      if (!arg || !arg[0]) {
        const currentAction = await recupererActionJid(dest);
        return repondre(
`╭───❰ *ANTILINK HELP MENU* ❱───╮
│
│ Status: ${enetatoui ? 'ON ✅' : 'OFF ❌'}
│ Action: ${currentAction.toUpperCase()}
│
│ ⚙️ *antilink on* → Activate anti-link
│ ⚙️ *antilink off* → Deactivate anti-link
│ ⚙️ *antilink delete* → Delete link only
│ ⚙️ *antilink warn* → Delete + warn (kicks after limit)
│ ⚙️ *antilink remove* → Delete + kick immediately
│
│ 📝 Default action is: *delete*
╰────────────────────────────╯`
        );
      }

      const sub = arg[0].toLowerCase();

      if (sub === 'on') {
        if (enetatoui) {
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ 🔗 Antilink is *already activated* 
╰──────────────────────────╯`
          );
        } else {
          await ajouterOuMettreAJourJid(dest, "oui");
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ✅ Antilink has been *activated*
╰──────────────────────────╯`
          );
        }
      } else if (sub === 'off') {
        if (enetatoui) {
          await ajouterOuMettreAJourJid(dest, "non");
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ❌ Antilink has been *deactivated*
╰──────────────────────────╯`
          );
        } else {
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ℹ️ Antilink was *not active* 
╰──────────────────────────╯`
          );
        }
      } else if (['remove', 'warn', 'delete'].includes(sub)) {
        await mettreAJourAction(dest, sub);
        if (!enetatoui) {
          await ajouterOuMettreAJourJid(dest, "oui");
        }
        repondre(
`╭───❰ *ANTILINK ACTION UPDATED* ❱───╮
│ 🔧 Action set to: *${sub.toUpperCase()}*
│ Status: ON ✅
╰────────────────────────────────╯`
        );
      } else {
        repondre(
`❗ Wrong usage.

Try: *antilink on*, *antilink off*, *antilink delete*, *antilink warn*, *antilink remove*.`
        );
      }

    } catch (error) {
      repondre("❌ *Error:* " + (error.message || error));
    }

  } else {
    repondre("🚫 *Only group admins or super users can use this command.*");
  }
});
