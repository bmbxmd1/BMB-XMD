const { bmbtz } = require('../../devbmb/bmbtz');

bmbtz({
    nomCom: "crew",
    alias: ["newgroup", "creategroup"],
    categorie: "Mods"
}, async (dest, client, commandeOptions) => {
    const { arg, superUser, auteurMessage, auteurMsgRepondu, msgRepondu, repondre } = commandeOptions;

    if (!superUser) { repondre("only modds can use this command"); return };

    if (!arg[0]) { repondre('Please enter the name of the group to create'); return };
    if (!msgRepondu) { repondre('Please mention a member added '); return; }

    const name = arg.join(" ");

    const group = await client.groupCreate(name, [auteurMessage, auteurMsgRepondu]);
    console.log("created group with id: " + group.gid);
    client.sendMessage(group.id, { text: `Bienvenue dans ${name}` });
});
