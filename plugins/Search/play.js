const { bmbtz } = require("../../devbmb/bmbtz");
const axios = require('axios');
const yts = require('yt-search');

const BASE_URL = 'https://noobs-api.top';

const BOT_NAME = 'B.M.B-TECH'; // Change as you want
const NEWSLETTER_JID = '120363382023564830@newsletter';
const NEWSLETTER_NAME = 'Bmb Tech Info';

const buildCaption = (type, video) => {
  const banner = type === "video" ? `${BOT_NAME} VIDEO PLAYER` : `${BOT_NAME} SONG PLAYER`;
  return (
    `*${banner}*\n\n` +
    `╭───────────────◆\n` +
    `│⿻ *Title:* ${video.title}\n` +
    `│⿻ *Duration:* ${video.timestamp}\n` +
    `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
    `│⿻ *Uploaded:* ${video.ago}\n` +
    `│⿻ *Channel:* ${video.author.name}\n` +
    `╰────────────────◆\n\n` +
    `🔗 ${video.url}`
  );
};
// getContextInfo now takes query and botName, and includes body and title
const getContextInfo = (query = '', botName = BOT_NAME) => ({
  forwardingScore: 1,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: NEWSLETTER_JID,
    newsletterName: NEWSLETTER_NAME,
    serverMessageId: -1
  },
  // Added fields as requested
  body: query ? `Requested song: ${query}` : undefined,
  title: botName
}); 

const buildDownloadingCaption = () => (
  `*${BOT_NAME}*\n\n` +
  `⏬ Downloading your request...`
);

// PLAY COMMAND (audio)
bmbtz(
  { nomCom: "play", categorie: "Search", reaction: "🎵" },
  async (origineMessage, client, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const query = arg.join(' ');
    if (!query)
      return client.sendMessage(
        origineMessage,
        { text: 'Please provide a song name or keyword.', contextInfo: getContextInfo() },
        { quoted: ms }
      );

    try {
      const search = await yts(query);
      const video = search.videos[0];

      if (!video)
        return client.sendMessage(
          origineMessage,
          { text: 'No results found for your query.', contextInfo: getContextInfo() },
          { quoted: ms }
        );

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.mp3`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.downloadLink)
        return client.sendMessage(
          origineMessage,
          { text: 'Failed to retrieve the MP3 download link.', contextInfo: getContextInfo() },
          { quoted: ms }
        );

// Send caption with thumbnail first, ensure renderSmallThumbnail: true
      await client.sendMessage(
        origineMessage,
        {
          image: { url: video.thumbnail, renderSmallThumbnail: true },
          caption: buildCaption('audio', video),
          contextInfo: getContextInfo(query)
        },
        { quoted: ms }
      );

      // Send downloading message
      await client.sendMessage(
        origineMessage,
        {
          text: buildDownloadingCaption(),
          contextInfo: getContextInfo()
        },
        { quoted: ms }
      );

      // Send mp3 with body and title, and include image with renderSmallThumbnail
      await client.sendMessage(
        origineMessage,
        {
          audio: { url: data.downloadLink },
          mimetype: 'audio/mpeg',
          fileName,
          title: BOT_NAME,
          body: `Requested song :${query}`,
          image: { url: video.thumbnail, renderSmallThumbnail: true }, 
          contextInfo: getContextInfo() 
        },
        { quoted: ms }
      );

    } catch (err) {
      console.error('[PLAY] Error:', err);
      await client.sendMessage(
        origineMessage,
        { text: 'An error occurred while processing your request.', contextInfo: getContextInfo() },
        { quoted: ms }
      );
    }
  }
);

// SONG COMMAND (audio as document)
bmbtz(
  { nomCom: "song", categorie: "Search", reaction: "🎶" },
  async (origineMessage, client, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const query = arg.join(' ');
    if (!query)
      return client.sendMessage(
        origineMessage,
        { text: 'Please provide a song name or keyword.', contextInfo: getContextInfo() },
        { quoted: ms }
      );

    try {
      const search = await yts(query);
      const video = search.videos[0];

      if (!video)
        return client.sendMessage(
          origineMessage,
          { text: 'No results found for your query.', contextInfo: getContextInfo() },
          { quoted: ms }
        );

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.mp3`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.downloadLink)
        return client.sendMessage(
          origineMessage,
          { text: 'Failed to retrieve the MP3 download link.', contextInfo: getContextInfo() },
          { quoted: ms }
        );

      // Send caption with thumbnail first
      await client.sendMessage(
        origineMessage,
        {
          image: { url: video.thumbnail },
          caption: buildCaption('song', video),
          contextInfo: getContextInfo()
        },
        { quoted: ms }
      );

      // Send downloading message
      await client.sendMessage(
        origineMessage,
        {
          text: buildDownloadingCaption(),
          contextInfo: getContextInfo()
        },
        { quoted: ms }
      );

      // Send mp3 as document
      await client.sendMessage(
        origineMessage,
        {
          document: { url: data.downloadLink },
          mimetype: 'audio/mpeg',
          fileName
        },
        { quoted: ms }
      );

    } catch (err) {
      console.error('[SONG] Error:', err);
      await client.sendMessage(
        origineMessage,
        { text: 'An error occurred while processing your request.', contextInfo: getContextInfo() },
        { quoted: ms }
      );
    }
  }
);

// VIDEO COMMAND (mp4)
bmbtz(
  { nomCom: "video", categorie: "Search", reaction: "🎬" },
  async (origineMessage, client, commandeOptions) => {
    const { ms, arg } = commandeOptions;
    const query = arg.join(' ');
    if (!query)
      return client.sendMessage(
        origineMessage,
        { text: 'Please provide a video name or keyword.', contextInfo: getContextInfo() },
        { quoted: ms }
      );

    try {
      const search = await yts(query);
      const video = search.videos[0];

      if (!video)
        return client.sendMessage(
          origineMessage,
          { text: 'No results found for your query.', contextInfo: getContextInfo() },
          { quoted: ms }
        );

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.mp4`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp4`;

      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.downloadLink)
        return client.sendMessage(
          origineMessage,
          { text: 'Failed to retrieve the MP4 download link.', contextInfo: getContextInfo() },
          { quoted: ms }
        );

      // Send caption with thumbnail first
      await client.sendMessage(
        origineMessage,
        {
          image: { url: video.thumbnail },
          caption: buildCaption('video', video),
          contextInfo: getContextInfo()
        },
        { quoted: ms }
      );

      // Send downloading message
      await client.sendMessage(
        origineMessage,
        {
          text: buildDownloadingCaption(),
          contextInfo: getContextInfo()
        },
        { quoted: ms }
      );

      // Send video
      await client.sendMessage(
        origineMessage,
        {
          video: { url: data.downloadLink },
          mimetype: 'video/mp4',
          fileName
        },
        { quoted: ms }
      );

    } catch (err) {
      console.error('[VIDEO] Error:', err);
      await client.sendMessage(
        origineMessage,
        { text: 'An error occurred while processing your request.', contextInfo: getContextInfo() },
        { quoted: ms }
      );
    }
  }
); 
