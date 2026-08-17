const { bmbtz } = require('../../devbmb/bmbtz');
const { attribuerUnevaleur } = require('../../lib/welcome');

async function events(nomCom) {
bmbtz({
    nomCom: nomCom,
    categorie: 'Group'
}, async (dest, client, commandeOptions) => {

    const { arg, repondre, superUser, verifAdmin } = commandeOptions;

    if (verifAdmin || superUser) {

        // Hakuna argument
        if (!arg[0] || arg.join(' ') === ' ') {
            return repondre(
`╭───〔 ${nomCom.toUpperCase()} 〕───
│
│ ▶ ${nomCom} on
│    Activate feature
│
│ ▶ ${nomCom} off
│    Deactivate feature
│
╰──────────────`
            );
        }

        // on / off
        if (arg[0] === 'on' || arg[0] === 'off') {

            await attribuerUnevaleur(dest, nomCom, arg[0]);

            return repondre(
`╭───〔 SUCCESS 〕───
│
│ Feature : ${nomCom}
│ Status  : ${arg[0].toUpperCase()}
│
╰──────────────`
            );
        }

        // Argument mbaya
        return repondre(
`╭───〔 ERROR 〕───
│
│ Invalid option
│ Use only:
│ • on
│ • off
│
╰──────────────`
        );

    } else {
        return repondre(
`╭───〔 ACCESS DENIED 〕───
│
│ Admin only command
│
╰──────────────`
        );
    }
});
}

// Group features
events('welcome');
events('goodbye');
events('antipromote');
events('antidemote');
