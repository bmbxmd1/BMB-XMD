const { bmbtz } = require("../../devbmb/bmbtz");
const pkg = require("@whiskeysockets/baileys");
const { generateWAMessageFromContent, proto } = pkg;
const fs = require("fs-extra");
const path = require("path");

bmbtz({
  nomCom: "getcmd",
  categorie: "Download",
  reaction: "📂",
  desc: "Get command file information and code"
}, async (dest, client, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    return repondre(`❌ Usage: .getcmd <command-name>\n\nExample: .getcmd npm`);
  }

  const cmdName = arg[0].toLowerCase().trim();
  const commandsFolder = path.join(__dirname, "../scs");

  try {
    await client.sendMessage(dest, {
      react: { text: "⏳", key: ms.key }
    });

    const files = fs.readdirSync(commandsFolder);
    let foundFile = null;
    let filePath = null;
    let fullContent = "";

    for (const file of files) {
      if (file.endsWith('.js')) {
        const fileContent = fs.readFileSync(path.join(commandsFolder, file), 'utf8');
        
        if (fileContent.includes(`nomCom: "${cmdName}"`) || 
            fileContent.includes(`nomCom: '${cmdName}'`) ||
            fileContent.includes(`name: "${cmdName}"`) ||
            fileContent.includes(`name: '${cmdName}'`)) {
          foundFile = file;
          filePath = path.join(commandsFolder, file);
          fullContent = fileContent;
          break;
        }
      }
    }

    if (!foundFile) {
      await repondre(`❌ Command "${cmdName}" not found!`);
      return;
    }

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const fileSizeKB = (stats.size / 1024).toFixed(1);
    const fileLines = fullContent.split('\n').length;

    let category = "Unknown";
    const categoryMatch = fullContent.match(/categorie:\s*["']([^"']+)["']/i) || 
                         fullContent.match(/category:\s*["']([^"']+)["']/i);
    if (categoryMatch) {
      category = categoryMatch[1];
    }

    const fullMessage = `📂 COMMAND FILE
│
├─ 📄 File: ${foundFile}
├─ 📂 Category: ${category}
├─ 📊 Size: ${fileSize} chars (${fileSizeKB} KB)
├─ 📝 Lines: ${fileLines}
│
└─ © Powered By B.M.B-TECH

💻 Javascript Code
\`\`\`javascript
${fullContent}
\`\`\`

📎 File attached above ↑`;

    await client.sendMessage(dest, {
      document: fs.readFileSync(filePath),
      mimetype: 'application/javascript',
      fileName: foundFile,
      caption: `📎 ${foundFile} • ${fileSizeKB} KB • JS`
    }, { quoted: ms });

    const buttons = [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "📋 COPY CODE",
          copy_code: fullContent
        })
      }
    ];

    const viewOnceMessage = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage:
            proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: fullMessage
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "© B.M.B-TECH"
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: "",
                subtitle: "",
                hasMediaAttachment: false
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons
                })
            })
        }
      }
    };

    const waMsg = generateWAMessageFromContent(
      dest,
      viewOnceMessage,
      {}
    );

    await client.relayMessage(dest, waMsg.message, {
      messageId: waMsg.key.id
    });

    await client.sendMessage(dest, {
      react: { text: "✅", key: ms.key }
    });

  } catch (error) {
    console.error("GetCmd Error:", error);
    await repondre(`❌ Error: ${error.message}`);
  }
});
