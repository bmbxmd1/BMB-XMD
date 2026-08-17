const { bmbtz } = require('../../devbmb/bmbtz');
const axios = require("axios")
let { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("../../lib/banUser");
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("../../lib/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} = require("../../lib/onlyAdmin");
const {removeSudoNumber,addSudoNumber,issudo} = require("../../lib/sudo");
//const conf = require("../../settings");
//const fs = require('fs');
const sleep =  (ms) =>{
  return new Promise((resolve) =>{ settingsTimeout (resolve, ms)})
  
  } ;


  bmbtz({ nomCom: "telesticker", categorie: "Mods" }, async (dest, client, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage, superUser } = commandeOptions;
  
    if (!superUser) {
      repondre('Only Mods can use this command'); return;
    }
    //const apikey = conf.APILOLHUMAIN
  
   // if (apikey === null || apikey === 'null') { repondre('Veillez vérifier votre apikey ou si vous en avez pas , veiller crée un compte sur api.lolhuman.xyz et vous en procurer une.'); return; };
  
    if (!arg[0]) {
      repondre("put a telegram sticker link ");
      return;
    }
  
    let lien = arg.join(' ');
  
    let name = lien.split('/addstickers/')[1] ;
  
    let api = 'https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=' + encodeURIComponent(packname) ;
  
    try {
  
      let stickers = await axios.get(api) ;
  
      let type = null ;
  
      if (stickers.data.result.is_animated === true ||stickers.data.result.is_video === true  ) {
  
          type = 'animated sticker'
      } else {
        type = 'not animated sticker'
      }
  
      let msg = `   bmb-tech-stickers-dl
      
  *Name :* ${stickers.data.result.name}
  *Type :* ${type} 
  *Length :* ${(stickers.data.result.stickers).length}
  
      Downloading...`
  
      await  repondre(msg) ;
  
       for ( let i = 0 ; i < (stickers.data.result.stickers).length ; i++ ) {
  
          let file = await axios.get(`https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${stickers.data.result.stickers[i].file_id}`) ;
  
          let buffer = await axios({
            method: 'get',  // Utilisez 'get' pour télécharger le fichier
            url:`https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/${file.data.result.file_path}` ,
            responseType: 'arraybuffer',  // Définissez le type de réponse sur 'stream' pour gérer un flux de données
          })
  
  
          const sticker = new Sticker(buffer.data, {
            pack: nomAuteurMessage,
            author: "bmbtech",
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 50,
            background: '#000000'
          });
    
          const stickerBuffer = await sticker.toBuffer(); // Convertit l'autocollant en tampon (Buffer)
    
          await client.sendMessage(
            dest,
            {
              sticker: stickerBuffer, // Utilisez le tampon (Buffer) directement dans l'objet de message
            },
            { quoted: ms }
          ); 
       }
  
    } catch (e) {
      repondre("we got an error \n", e);
    }
  });

bmbtz({ nomCom: "crew", categorie: "Mods" }, async (dest, client, commandeOptions) => {
  const { ms, repondre, arg, auteurMessage, superUser, auteurMsgRepondu, msgRepondu } = commandeOptions;

  if (!superUser) { repondre("only modds can use this command"); return };

  if (!arg[0]) { repondre('Please enter the name of the group to create'); return };
  if (!msgRepondu) { repondre('Please mention a member added '); return; }

  const name = arg.join(" ")

  const group = await client.groupCreate(name, [auteurMessage, auteurMsgRepondu])
  console.log("created group with id: " + group.gid)
  client.sendMessage(group.id, { text: `Bienvenue dans ${name}` })

});

bmbtz({ nomCom: "left", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;
  if (!verifGroupe) { repondre("group only"); return };
  if (!superUser) {
    repondre("order reserved for the owner");
    return;
  }

  await client.groupLeave(dest)
});

bmbtz({ nomCom: "join", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;

  if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
  let result = arg[0].split('https://chat.whatsapp.com/')[1] ;
 await client.groupAcceptInvite(result) ;
  
      repondre(`Succes`).catch((e)=>{
  repondre('Unknown error')
})

})


bmbtz({ nomCom: "jid", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage,auteurMsgRepondu } = commandeOptions;

         if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
              if(!msgRepondu) {
                jid = dest
              } else {
                jid = auteurMsgRepondu
              } ;
   client.sendMessage(dest,{text : jid },{quoted:ms});

        }) ;

  

bmbtz({ nomCom: "block", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage,auteurMsgRepondu } = commandeOptions;

         if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
             
              if(!msgRepondu) { 
                if(verifGroupe) {
                  repondre('Be sure to mention the person to block'); return
                } ;
                jid = dest

                 await client.updateBlockStatus(jid, "block")
    .then( repondre('succes')) 
              } else {
                jid = auteurMsgRepondu
             await client.updateBlockStatus(jid, "block")
    .then( repondre('succes'))   } ;

  });

bmbtz({ nomCom: "unblock", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage,auteurMsgRepondu } = commandeOptions;

         if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
              if(!msgRepondu) { 
                if(verifGroupe) {
                  repondre('Please mention the person to be unlocked'); return
                } ;
                jid = dest

                 await client.updateBlockStatus(jid, "unblock")
    .then( repondre('succes')) 
              } else {
                jid = auteurMsgRepondu
             await client.updateBlockStatus(jid, "unblock")
    .then( repondre('succes'))   } ;
  
    });

bmbtz({ nomCom: "kickall", categorie: 'Group', reaction: "📣" }, async (dest, client, commandeOptions) => {

  const { auteurMessage ,ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser,prefixe } = commandeOptions

  const metadata = await client.groupMetadata(dest) ;
 

  if (!verifGroupe) { repondre("✋🏿 ✋🏿this command is reserved for groups ❌"); return; }
  if (superUser || auteurMessage == metadata.owner) { 
  
   repondre('No_admin members will be removed from the group. You have 5 seconds to reclaim your choice by restarting the bot.') ;
   await sleep(5000)
  let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
try {
  let users = membresGroupe.filter((member) => !member.admin)

  for (const membre of users) {

    

   
    
await client.groupParticipantsUpdate(
        dest, 
        [membre.id],
        "remove" 
    ) 
    await sleep(500)
    
  }  
} catch (e) {repondre("I need administration rights")} } else {
  repondre("Order reserved for the group owner for security reasons"); return
}
});


bmbtz({ nomCom: "save", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { repondre , msgRepondu , superUser, auteurMessage } = commandeOptions;
  
    if ( superUser) { 
  
      if(msgRepondu) {

        console.log(msgRepondu) ;

        let msg ;
  
        if (msgRepondu.imageMessage) {
  
          
  
       let media  = await client.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;
       // console.log(msgRepondu) ;
       msg = {
  
         image : { url : media } ,
         caption : msgRepondu.imageMessage.caption,
         
       }
      
  
        } else if (msgRepondu.videoMessage) {
  
          let media  = await client.downloadAndSaveMediaMessage(msgRepondu.videoMessage) ;
  
          msg = {
  
            video : { url : media } ,
            caption : msgRepondu.videoMessage.caption,
            
          }
  
        } else if (msgRepondu.audioMessage) {
      
          let media  = await client.downloadAndSaveMediaMessage(msgRepondu.audioMessage) ;
         
          msg = {
     
            audio : { url : media } ,
            mimetype:'audio/mp4',
             }     
          
        } else if (msgRepondu.stickerMessage) {
  
      
          let media  = await client.downloadAndSaveMediaMessage(msgRepondu.stickerMessage)
  
          let stickerMess = new Sticker(media, {
            pack: 'B.M.B-TECH',
            type: StickerTypes.CROPPED,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
          });
          const stickerBuffer2 = await stickerMess.toBuffer();
         
          msg = { sticker: stickerBuffer2}
  
  
        }  else {
            msg = {
               text : msgRepondu.conversation,
            }
        }
  
      client.sendMessage(auteurMessage,msg)
  
      } else { repondre('Mention the message that you want to save') }
  
  } else {
    repondre('only mods can use this command')
  }
  

  })
;
