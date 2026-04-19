const { askNexus } = require('../modules/ai/nexusAI');
const { textToSpeech } = require('../modules/ai/tts');
const log = require('../utils/logger');
const fs = require('fs');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {

    if (message.author.bot) return;

    const isDM = !message.guild;
    const NEXUS_GUILD_ID = process.env.NEXUS_GUILD_ID;

    let content = message.content?.trim();
    if (!content) return;

    // =========================
    // 📩 LOG GENERAL
    // =========================
    await log(client, `📩 ${message.author.tag}: ${content}`);

    // =========================
    // 💬 DM → IA AUTOMÁTICA
    // =========================
    if (isDM) {
      try {
        await message.channel.sendTyping();

        const wantsAudio = detectAudioRequest(content);
        const reply = await askNexus(message.author.id, content);

        await log(client, `🤖 DM Reply: ${reply}`);

        if (wantsAudio) {
          return sendAudioReply(message, reply, client);
        }

        await message.reply(reply);

      } catch (err) {
        console.error('💥 Error en DM:', err);

        await log(client, `💥 ERROR DM:
${err.stack || err.message}`);

        message.reply('❌ Error con IA');
      }

      return;
    }

    // =========================
    // 🌍 FILTRO SERVIDOR
    // =========================
    if (message.guild.id !== NEXUS_GUILD_ID) {
      await log(client, `⛔ Ignorado (otro server): ${message.guild.id}`);
      return;
    }

    const mention1 = `<@${client.user.id}>`;
    const mention2 = `<@!${client.user.id}>`;

    const isMention =
      content.includes(mention1) ||
      content.includes(mention2);

    const isDirectCall =
      content.toLowerCase().startsWith('nexus');

    if (!isMention && !isDirectCall) {
      await log(client, `❌ No activado`);
      return;
    }

    // limpiar texto
    content = content
      .replace(mention1, '')
      .replace(mention2, '')
      .replace(/^nexus/i, '')
      .trim();

    await log(client, `🎯 Activado: ${content}`);

    if (!content) {
      return message.reply('👋 ¿Qué necesitas?');
    }

    try {
      await message.channel.sendTyping();

      const wantsAudio = detectAudioRequest(content);
      const reply = await askNexus(message.author.id, content);

      await log(client, `🤖 Reply: ${reply}`);

      if (wantsAudio) {
        return sendAudioReply(message, reply, client);
      }

      await message.reply(reply);

    } catch (err) {
      console.error('💥 Error en servidor:', err);

      await log(client, `💥 ERROR SERVER:
${err.stack || err.message}`);

      message.reply('❌ Error con IA');
    }
  }
};

// =========================
// 🧠 DETECTOR DE AUDIO
// =========================
function detectAudioRequest(text) {
  const triggers = [
    'audio',
    'voz',
    'háblame',
    'hablame',
    'dilo en voz',
    'responde en audio'
  ];

  const lower = text.toLowerCase();
  return triggers.some(t => lower.includes(t));
}

// =========================
// 🔊 AUDIO + LOGS
// =========================
async function sendAudioReply(message, text, client) {
  try {
    const fileName = `voice-${Date.now()}.mp3`;
    const filePath = await textToSpeech(text, fileName);

    await message.reply({
      content: '🔊 Respuesta en audio:',
      files: [filePath]
    });

    await log(client, `🔊 Audio enviado`);

    setTimeout(() => {
      fs.unlink(filePath, () => {});
    }, 5000);

  } catch (err) {
    console.error('💥 Error TTS:', err);

    await log(client, `💥 ERROR TTS:
${err.stack || err.message}`);

    await message.reply(text);
  }
}