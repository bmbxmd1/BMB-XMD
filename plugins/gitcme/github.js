const { bmbtz } = require("../../devbmb/bmbtz");
const axios = require('axios');

const newsletterContext = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363382023564830@newsletter",
      newsletterName: "𝙱.𝙼.𝙱-𝚇𝙼𝙳",
      serverMessageId: 1
    }
  }
};

//--------
async function githubstalk(user) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.github.com/users/' + user)
      .then(({ data }) => {
        let info = {
          username: data.login,
          name: data.name,
          bio: data.bio,
          id: data.id,
          nodeId: data.node_id,
          profile_pic: data.avatar_url,
          html_url: data.html_url,
          type: data.type,
          admin: data.site_admin,
          company: data.company,
          blog: data.blog,
          location: data.location,
          email: data.email,
          public_repo: data.public_repos,
          public_gists: data.public_gists,
          followers: data.followers,
          following: data.following,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        resolve(info);
      })
      .catch(err => reject(err));
  });
}

bmbtz(
  {
    nomCom: 'github',
    alias: ['githubstalk'],
    categorie: 'gitcme',
    reaction: '👨‍💻'
  },

  async (dest, client, { ms, arg, repondre }) => {
    if (!arg[0]) return await repondre("Username is missing", newsletterContext);

    try {
      const { username, following, followers, type, bio, company, blog, location, email, public_repo, public_gists, profile_pic, created_at, updated_at, html_url, name, id } = await githubstalk(arg.join(' '));

      const info = `*── 「 GITHUB USER INFO 」 ──*

🔖 *Nickname :* ${name}
🔖 *Username :* ${username}
🚩 *Id :* ${id}
✨ *Bio :* ${bio}
🏢 *Company :* ${company}
📍 *Location :* ${location}
📧 *Email :* ${email}
📰 *Blog :* ${blog}
🔐 *Public Gists :* https://gist.github.com/${username}/
💕 *Followers :* ${followers}
👉 *Following :* ${following}
🔄 *Updated At :* ${updated_at}
🧩 *Created At :* ${created_at}
👤 *Profile :* ${html_url}`;

      await client.sendMessage(dest, {
        image: { url: profile_pic },
        caption: info,
        ...newsletterContext
      }, { quoted: ms });

    } catch (err) {
      console.error(err);
      await repondre("Something went wrong: check username", newsletterContext);
    }
  }
);
