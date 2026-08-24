const { bmbtz } = require("../../devbmb/bmbtz");

bmbtz({ nomCom: "gname", alias: ["setgroupname", "groupname"], categorie: 'Group' }, async (dest, client, commandeOptions) => {
  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("⚠️ This command is for *group admins only*.");
    return;
  }

  if (!arg[0]) {
    repondre("✏️ Please enter the new *group name*.");
    return;
  }

  const nom = arg.join(' ');
  await client.groupUpdateSubject(dest, nom);

  const msg =
`╭─❰ *GROUP NAME UPDATED* ❱─╮
│
│ 🆕 New Group Name:
│ ${nom.replace(/\n/g, '\n│ ')}
│
╰────────────────────╯`;

  repondre(msg);
});
