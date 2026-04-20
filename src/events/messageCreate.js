const { askNexus } = require('../modules/ai/nexusAI');
const { textToSpeech } = require('../modules/ai/tts');
const log = require('../utils/logger');
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
      try {
        await message.channel.sendTyping();

        const wantsAudio = detectAudioRequest(content);
        const ai = await askNexus(message.author.id, content);

        const safeText = normalizeText(ai?.text);

        if (wantsAudio) {
          return sendAudioReply(message, ai?.speechText || safeText);
        }

        return message.reply(safeText);

      } catch (err) {
        console.error('💥 Error en DM:', err);
        await safeLog(client, `💥 ERROR DM:\n${err.stack || err.message}`);
        return message.reply('❌ Error con IA');
      }
    }

    // =========================
    // 🌍 SOLO SERVIDOR NEXUS
    // =========================
    if (!message.guild || message.guild.id !== NEXUS_GUILD_ID) return;

    const mention1 = `<@${client.user.id}>`;
    const mention2 = `<@!${client.user.id}>`;

    const lower = content.toLowerCase();

    const isMention =
      content.includes(mention1) ||
      content.includes(mention2);

    const isDirectCall =
      lower.startsWith('nexus ') || lower === 'nexus';

    // =========================
    // 🔥 DETECTAR REPLY AL BOT
    // =========================
    let isReplyToBot = false;

    if (message.reference?.messageId) {
      try {
        const referenced = await message.channel.messages.fetch(message.reference.messageId);

        if (referenced.author.id === client.user.id) {
          isReplyToBot = true;
        }
      } catch (err) {
        console.error('Error leyendo reply:', err);
      }
    }

    // ❌ si no cumple nada → ignorar
    if (!isMention && !isDirectCall && !isReplyToBot) return;

    // =========================
    // 🧼 LIMPIAR TEXTO
    // =========================
    if (!isReplyToBot) {
      content = content
        .replace(mention1, '')
        .replace(mention2, '')
        .replace(/^nexus/i, '')
        .trim();
    }

    if (!content) {
      return message.reply('👋 ¿Qué necesitas?');
    }

    try {
      await message.channel.sendTyping();

      const wantsAudio = detectAudioRequest(content);
      const ai = await askNexus(message.author.id, content);

      const safeText = normalizeText(ai?.text);

      if (wantsAudio) {
        return sendAudioReply(message, ai?.speechText || safeText);
      }

      return message.reply(safeText);

    } catch (err) {
      console.error('💥 Error en servidor:', err);
      await safeLog(client, `💥 ERROR SERVER:\n${err.stack || err.message}`);
      return message.reply('❌ Error con IA');
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
// 🧼 NORMALIZAR TEXTO
// =========================
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return '🤖 No tengo respuesta ahora mismo.';
  }

  const clean = text.trim();

  if (clean.length === 0) {
    return '🤖 No tengo respuesta ahora mismo.';
  }

  return clean.length > 1900
    ? clean.slice(0, 1900) + '…'
    : clean;
}

// =========================
// 🔊 AUDIO
// =========================
async function sendAudioReply(message, text) {
  try {
    const safe = normalizeText(text);

    const fileName = `voice-${Date.now()}.mp3`;
    const filePath = await textToSpeech(safe, fileName);

    await message.reply({
      content: '🔊 Respuesta en audio:',
      files: [filePath]
    });

    // 🧹 limpiar archivo
    setTimeout(() => {
      fs.unlink(filePath, () => {});
    }, 5000);

  } catch (err) {
    console.error('💥 Error TTS:', err);
    return message.reply(normalizeText(text));
  }
}

// =========================
// 📡 LOG SOLO ERRORES
// =========================
async function safeLog(client, msg) {
  try {
    if (!process.env.LOG_CHANNEL_ID) return;
    await log(client, msg);
  } catch {}
}