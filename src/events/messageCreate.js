const { askNexus } = require('../modules/ai/nexusAI');
const { textToSpeech } = require('../modules/ai/tts');
const fs = require('fs');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {

    // ❌ ignorar bots
    if (message.author.bot) return;

    const isDM = !message.guild;
    const NEXUS_GUILD_ID = process.env.NEXUS_GUILD_ID;

    let content = message.content.trim();

    // =========================
    // 💬 DM → IA AUTOMÁTICA
    // =========================
    if (isDM) {

      console.log(`📩 DM [${message.author.tag}]: ${content}`);
      if (!content) return;

      try {
        await message.channel.sendTyping();

        const wantsAudio = detectAudioRequest(content);

        const reply = await askNexus(message.author.id, content);

        if (wantsAudio) {
          return sendAudioReply(message, reply);
        }

        await message.reply(reply);

      } catch (err) {
        console.error('💥 Error en DM:', err);
        message.reply('❌ Error con IA');
      }

      return;
    }

    // =========================
    // 🌍 SERVIDOR NEXUS
    // =========================
    if (message.guild.id !== NEXUS_GUILD_ID) return;

    if (!message.mentions.has(client.user)) return;

    // limpiar mención
    content = content
      .replace(`<@${client.user.id}>`, '')
      .replace(`<@!${client.user.id}>`, '')
      .trim();

    console.log(`💬 Nexus [${message.author.tag}]: ${content}`);

    if (!content) {
      return message.reply('👋 ¿Qué necesitas?');
    }

    try {
      await message.channel.sendTyping();

      const wantsAudio = detectAudioRequest(content);

      const reply = await askNexus(message.author.id, content);

      if (wantsAudio) {
        return sendAudioReply(message, reply);
      }

      await message.reply(reply);

    } catch (err) {
      console.error('💥 Error en servidor:', err);
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
// 🔊 ENVIAR AUDIO
// =========================
async function sendAudioReply(message, text) {
  try {
    const filePath = await textToSpeech(text, `voice-${Date.now()}.mp3`);

    await message.reply({
      content: '🔊 Respuesta en audio:',
      files: [filePath]
    });

    // 🧹 borrar archivo
    fs.unlink(filePath, () => {});

  } catch (err) {
    console.error('💥 Error TTS:', err);
    await message.reply(text);
  }
}