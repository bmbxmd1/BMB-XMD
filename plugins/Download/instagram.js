const { bmbtz } = require('../../devbmb/bmbtz');
const axios = require('axios');
const fs = require('fs-extra');
const { sendMessage, repondre } = require(__dirname + "/../../devbmb/context");
const { igdl } = require('ruhend-scraper');
const conf = require(__dirname + "/../../settings");
const getFBInfo = require("@xaviabot/fb-downloader");

function commonContextInfo() {
  try {
    return {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363382023564830@newsletter",
        newsletterName: "Bmb Tech Updates",
        serverMessageId: Math.floor(100000 + Math.random() * 900000),
      },
    };
  } catch (error) {
    console.error(`Error in commonContextInfo: ${error.message}`);
    return {};
  }
}

function formatViews(views) {
  if (typeof views === 'number') {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }
  return views;
}

// FACEBOOK
bmbtz({
  nomCom: "facebook1",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, client, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(client, dest, ms, 'Please provide a Facebook video URL!');
  }

  const fbUrl = arg[0].trim();
  if (!fbUrl.includes('https://') || !fbUrl.includes('facebook.com')) {
    return repondre(client, dest, ms, "Please provide a valid Facebook video URL.");
  }

  try {
    const videoData = await getFBInfo(fbUrl);

    if (!videoData || !videoData.sd) {
      return repondre(client, dest, ms, "Could not retrieve video information. The link may be invalid or private.");
    }

    const caption = `
╭━━━[ 📥 Facebook Downloader ]━━━╮
┃ 📝 Title: ${videoData.title || 'No title available'}
┃
┃ 🔢 Reply with:
┃   1️⃣ SD Quality
┃   2️⃣ HD Quality
┃   3️⃣ Audio Only
┃   4️⃣ As Document
┃   5️⃣ As Voice Message
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    const message = await client.sendMessage(dest, {
      image: { url: videoData.thumbnail || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4', '5'].includes(responseText)) {
          return await client.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-5.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await client.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await client.sendMessage(dest, {
              video: { url: videoData.sd },
              caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            if (videoData.hd) {
              await client.sendMessage(dest, {
                video: { url: videoData.hd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            } else {
              await client.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent,
                contextInfo: commonContextInfo()
              });
              await client.sendMessage(dest, {
                video: { url: videoData.sd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            }
            break;

          case '3':
            await client.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Audio`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await client.sendMessage(dest, {
              document: { url: videoData.sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Facebook'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Video Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '5':
            await client.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Voice Message`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await client.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await client.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    client.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      client.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Facebook download error:", error);
    repondre(client, dest, ms, `Failed to download video. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

// TWITTER
bmbtz({
  nomCom: "twitter",
  aliases: ["twitdl", "twitterdl", "tw", "xdl"],
  categorie: "Download",
  reaction: "🐦"
}, async (dest, client, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(client, dest, ms, 'Please provide a Twitter video URL!');
  }

  const tweetUrl = arg[0].trim();
  if (!tweetUrl.includes('https://') || !tweetUrl.includes('twitter.com')) {
    return repondre(client, dest, ms, "Please provide a valid Twitter URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(tweetUrl)}`;
    const response = await axios.get(apiUrl);
    const tweetData = response.data;

    if (!tweetData.status || !tweetData.result) {
      return repondre(client, dest, ms, "Could not retrieve video information. The tweet may be private or not contain media.");
    }

    const videoInfo = tweetData.result;

    const caption = `
╭━━━[ 🐦 Twitter Downloader ]━━━╮
┃ 📝 Description: ${videoInfo.desc || 'No description available'}
┃
┃ 🔢 Reply with:
┃   1️⃣ SD Quality (480p)
┃   2️⃣ HD Quality (720p)
┃   3️⃣ Audio Only
┃   4️⃣ As Document
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    const message = await client.sendMessage(dest, {
      image: { url: videoInfo.thumb || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await client.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await client.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await client.sendMessage(dest, {
              video: { url: videoInfo.video_sd },
              caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            if (videoInfo.video_hd) {
              await client.sendMessage(dest, {
                video: { url: videoInfo.video_hd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            } else {
              await client.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent,
                contextInfo: commonContextInfo()
              });
              await client.sendMessage(dest, {
                video: { url: videoInfo.video_sd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            }
            break;

          case '3':
            await client.sendMessage(dest, {
              audio: { url: videoInfo.audio },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Audio`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await client.sendMessage(dest, {
              document: { url: videoInfo.video_sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Twitter'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Video Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await client.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await client.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    client.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      client.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Twitter download error:", error);
    repondre(client, dest, ms, `Failed to download tweet. Error: ${error.message}\nYou can try with another link or check if the tweet is public.`);
  }
});

// INSTAGRAM
bmbtz({
  nomCom: "instagram",
  aliases: ["igdl", "insta", "ig"],
  categorie: "Download",
  reaction: "📸"
}, async (dest, client, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(client, dest, ms, 'Please provide an Instagram URL!');
  }

  const igUrl = arg[0].trim();
  if (!igUrl.includes('https://') || !igUrl.includes('instagram.com')) {
    return repondre(client, dest, ms, "Please provide a valid Instagram URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/instagramdl?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.downloadUrl) {
      return repondre(client, dest, ms, "Could not retrieve video. The post may be private or unavailable.");
    }

    const downloadUrl = data.result.downloadUrl;
    const isVideo = data.result.type === 'mp4';

    const caption = `
╭━━━[ 📸 Instagram Downloader ]━━━╮
┃ 📝 Media Type: ${isVideo ? 'Video' : 'Unknown'}
┃
┃ 🔢 Reply with:
┃   1️⃣ Video
┃   2️⃣ Video as Document
┃   3️⃣ Audio Only
┃   4️⃣ Audio as Document
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    const message = await client.sendMessage(dest, {
      image: { url: conf.URL || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await client.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await client.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await client.sendMessage(dest, {
              video: { url: downloadUrl },
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            await client.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '3':
            await client.sendMessage(dest, {
              audio: { url: downloadUrl },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await client.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await client.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await client.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    client.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      client.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Instagram download error:", error);
    repondre(client, dest, ms, `Failed to download Instagram media. Error: ${error.message}\nYou can try with another link or check if the post is public.`);
  }
});

// TIKTOK
bmbtz({
  nomCom: "tiktok4",
  aliases: ["ttdl", "tiktokdl", "tt"],
  categorie: "Download",
  reaction: "🎵"
}, async (dest, client, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(client, dest, ms, 'Please provide a TikTok URL!');
  }

  const tiktokUrl = arg[0].trim();
  if (!tiktokUrl.includes('https://') || !(tiktokUrl.includes('tiktok.com') || tiktokUrl.includes('vt.tiktok.com'))) {
    return repondre(client, dest, ms, "Please provide a valid TikTok URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(tiktokUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result) {
      return repondre(client, dest, ms, "Could not retrieve video. The TikTok may be private or unavailable.");
    }

    const videoInfo = data.result;

    const caption = `
╭━━━[ 🎵 TikTok Downloader ]━━━╮
┃ 📝 Title: ${videoInfo.title || 'No title'}
┃ 🏷️ Caption: ${videoInfo.caption || 'No caption'}
┃
┃ 🔢 Reply with:
┃   1️⃣ Video (No Watermark)
┃   2️⃣ Video as Document
┃   3️⃣ Audio Only
┃   4️⃣ Audio as Document
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    const message = await client.sendMessage(dest, {
      image: { url: videoInfo.thumbnail || conf.URL || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await client.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await client.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await client.sendMessage(dest, {
              video: { url: videoInfo.nowm },
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video (No Watermark)\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            await client.sendMessage(dest, {
              document: { url: videoInfo.nowm },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '3':
            await client.sendMessage(dest, {
              audio: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await client.sendMessage(dest, {
              document: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await client.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await client.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    client.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      client.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("TikTok download error:", error);
    repondre(client, dest, ms, `Failed to download TikTok. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

// MEDIAFIRE
bmbtz({
  nomCom: "mediafire",
  aliases: ["mfire", "mfdl", "mediafiredl"],
  categorie: "Download",
  reaction: "📦"
}, async (dest, client, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(client, dest, ms, 'Please provide a MediaFire URL!');
  }

  const mediafireUrl = arg[0].trim();
  if (!mediafireUrl.includes('https://') || !mediafireUrl.includes('mediafire.com')) {
    return repondre(client, dest, ms, "Please provide a valid MediaFire URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/mfire?url=${encodeURIComponent(mediafireUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.dl_link) {
      return repondre(client, dest, ms, "Could not retrieve file. The link may be invalid or the file unavailable.");
    }

    const fileInfo = data.result;

    const fileInfoMessage = `
╭━━━[ 📦 MediaFire Downloader ]━━━╮
┃ 📄 File Name: ${fileInfo.fileName}
┃ 🗂️ File Type: ${fileInfo.fileType}
┃ 📏 File Size: ${fileInfo.size}
┃ 📆 Upload Date: ${fileInfo.date}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
⏬ Downloading file...`;

    await client.sendMessage(dest, {
      text: fileInfoMessage,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    await client.sendMessage(dest, {
      document: {
        url: fileInfo.dl_link
      },
      mimetype: fileInfo.fileType,
      fileName: fileInfo.fileName,
      caption: `*${conf.BOT || 'MediaFire Downloader'}*\nHere's your requested file: ${fileInfo.fileName}`,
      contextInfo: commonContextInfo()
    });

  } catch (error) {
    console.error("MediaFire download error:", error);
    repondre(client, dest, ms, `Failed to download file. Error: ${error.message}\nPlease check the link and try again.`);
  }
});

// HENTAIVID
bmbtz({
  nomCom: "xx",
  aliases: ["hvid", "hentaidl", "hv"],
  categorie: "download",
  reaction: "🔞"
}, async (dest, client, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    const apiUrl = 'https://apis-keith.vercel.app/dl/hentaivid';
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || data.result.length === 0) {
      return repondre(client, dest, ms, "Could not retrieve videos. Please try again later.");
    }

    const videos = data.result.slice(0, 8);

    let caption = `╭━━━[ 🔞 Hentai Downloader ]━━━╮\n`;
    caption += `┃ Available videos (1-8):\n`;
    caption += `┃━━━━━━━━━━━━━━━━━━━━━━━\n`;

    videos.forEach((video, index) => {
      caption += `┃ ${index + 1}. ${video.title}\n`;
      caption += `┃   🏷️ ${video.category}\n`;
      caption += `┃   👁️ ${video.views_count} views | 🔗 ${video.share_count} shares\n`;
      caption += `┃━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    caption += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n`;
    caption += `\nReply with a number (1-8) to download that video.`;

    const message = await client.sendMessage(dest, {
      text: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        const selectedNum = parseInt(responseText);
        if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > videos.length) {
          return await client.sendMessage(dest, {
            text: `Invalid selection. Please reply with a number between 1-${videos.length}.`,
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        const selectedVideo = videos[selectedNum - 1];

        await client.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        await client.sendMessage(dest, {
          video: { url: selectedVideo.media.video_url },
          caption: `*${selectedVideo.title}*\nCategory: ${selectedVideo.category}\nViews: ${selectedVideo.views_count} | Shares: ${selectedVideo.share_count}`,
          contextInfo: commonContextInfo()
        }, { quoted: messageContent });

        await client.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await client.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    client.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      client.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Hentai video download error:", error);
    repondre(client, dest, ms, `Failed to fetch videos. Error: ${error.message}`);
  }
});