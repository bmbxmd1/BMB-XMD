const {bmbtz} = require("../../devbmb/bmbtz");
const conf = require("../../settings");



bmbtz(
  {
    nomCom: 'boom',
    categorie: 'Mods',
    reaction: '😈',
  }, 

  

  async (dest,client, commandeOptions) => {
    const {ms,arg,repondre,superUser} = commandeOptions;
    const limit = conf.BOOM_MESSAGE_LIMIT;

    if (!superUser) {
      repondre('You are not authorised to use this  command !!!');
      return;
    } else{
          if (!arg[0] || !arg[1] || arg[0] < 0){
            repondre(`
error wrong format
> try: ${conf.PREFIXE}boom 10 hey `);
              return;
          } else if (parseInt(arg[0]) > limit) {
            repondre(`can't send over ${limit} maessages`)
            return;
            } else {
            const tasks = []

            for (let i = 0 ; i < parseInt(arg[0]); i++){
              tasks.push(
                new Promise((resolve) => {
                  settingsTimeout(function() {
                    repondre(arg.slice(1).join(" "));
                    resolve();
                  }, 1000 * i);
                })
              )
            }

            await Promise.all(tasks)
            return;
            }
    }
  }
);
