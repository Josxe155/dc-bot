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

    let content = message.content?.trim();
    if (!content) return;

    // =========================
    // 💬 DM → IA AUTOMÁTICA
    // =========================
    if (isDM) {
      console.log(`📩 DM [${message.author.tag}]: ${content}`);

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
    // 🌍 SOLO SERVIDOR NEXUS
    // =========================
    if (message.guild.id !== NEXUS_GUILD_ID) return;

    const mention1 = `<@${client.user.id}>`;
    const mention2 = `<@!${client.user.id}>`;

    const isMention =
      content.includes(mention1) ||
      content.includes(mention2);

    const isDirectCall =
      content.toLowerCase().startsWith('nexus');

    // ❌ si no es mención ni "nexus"
    if (!isMention && !isDirectCall) return;

    // limpiar texto
    content = content
      .replace(mention1, '')
      .replace(mention2, '')
      .replace(/^nexus/i, '')
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
    const fileName = `voice-${Date.now()}.mp3`;
    const filePath = await textToSpeech(text, fileName);

    await message.reply({
      content: '🔊 Respuesta en audio:',
      files: [filePath]
    });

    // 🧹 borrar archivo después
    setTimeout(() => {
      fs.unlink(filePath, () => {});
    }, 5000);

  } catch (err) {
    console.error('💥 Error TTS:', err);
    await message.reply(text);
  }
}