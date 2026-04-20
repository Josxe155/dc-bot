const { askNexus } = require('../modules/ai/nexusAI');
const { textToSpeech } = require('../modules/ai/tts');
const log = require('../utils/logger');
const fs = require('fs');

// 🧠 FIRESTORE
const {
  ensureUser,
  saveMessage,
  incrementUsage
} = require('../modules/db/users');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {

    if (message.author.bot) return;

    const isDM = !message.guild;
    const NEXUS_GUILD_ID = process.env.NEXUS_GUILD_ID;

    let content = message.content?.trim();
    if (!content) return;

    const userId = message.author.id;

    const lower = content.toLowerCase();

    // =========================
    // ☁️ FIRESTORE (SIEMPRE)
    // =========================
    try {
      await ensureUser(userId);
      await saveMessage(userId, content);
      await incrementUsage(userId);
    } catch (err) {
      console.error('🔥 Firestore error:', err);
    }

    // =========================
    // 💬 DM → IA
    // =========================
    if (isDM) {
      return handleAI(message, client, userId, content);
    }

    // =========================
    // 🌍 SOLO SERVIDOR NEXUS
    // =========================
    if (message.guild.id !== NEXUS_GUILD_ID) return;

    // 🔥 MENCIONES ROBUSTAS (FIX REAL)
    const isMention = message.mentions.has(client.user.id);

    const isDirectCall =
      lower.startsWith('nexus ') || lower === 'nexus';

    // 🔥 REPLY CHECK
    let isReplyToBot = false;

    if (message.reference?.messageId) {
      try {
        const ref = await message.channel.messages.fetch(message.reference.messageId);
        isReplyToBot = ref.author.id === client.user.id;
      } catch {}
    }

    // ❌ ignorar si no activa nada
    if (!isMention && !isDirectCall && !isReplyToBot) return;

    // 🧼 limpiar input correctamente
    if (!isReplyToBot) {
      content = content
        .replace(/<@!?(\d+)>/g, '') // 🔥 FIX UNIVERSAL MENCIONES
        .replace(/^nexus/i, '')
        .trim();
    }

    if (!content) return message.reply('👋 ¿Qué necesitas?');

    return handleAI(message, client, userId, content);
  }
};

// =========================
// 🧠 IA CORE (REUTILIZABLE)
// =========================
async function handleAI(message, client, userId, content) {
  try {
    await message.channel.sendTyping();

    const wantsAudio = detectAudioRequest(content);
    const ai = await askNexus(userId, content);

    const safeText = normalizeText(ai?.text);

    if (wantsAudio) {
      return sendAudioReply(message, ai?.speechText || safeText);
    }

    return message.reply(safeText);

  } catch (err) {
    console.error('💥 AI ERROR:', err);
    await safeLog(client, `💥 ERROR AI:\n${err.stack || err.message}`);
    return message.reply('❌ Error con IA');
  }
}

// =========================
// 🧠 DETECTOR AUDIO
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

    setTimeout(() => {
      fs.unlink(filePath, () => {});
    }, 5000);

  } catch (err) {
    console.error('💥 TTS ERROR:', err);
    return message.reply(normalizeText(text));
  }
}

// =========================
// 📡 LOG SEGURO
// =========================
async function safeLog(client, msg) {
  try {
    if (!process.env.LOG_CHANNEL_ID) return;
    await log(client, msg);
  } catch {}
}