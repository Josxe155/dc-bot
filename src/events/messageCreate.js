const { askNexus } = require('../modules/ai/nexusAI');
const { textToSpeech } = require('../modules/ai/tts');
const log = require('../utils/logger');
const fs = require('fs');

// 🧠 FIREBASE MEMORY
const memory = require('../modules/memory/firebaseMemory');

// 🔥 XP SYSTEM REAL
const { handleXP } = require('../modules/xp/xpSystem');

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {

    if (message.author.bot) return;

    const isDM = !message.guild;
    const NEXUS_GUILD_ID = process.env.NEXUS_GUILD_ID;

    const contentRaw = message.content?.trim();
    if (!contentRaw) return;

    const userId = message.author.id;
    const lower = contentRaw.toLowerCase();

    // =========================
    // 🧠 FIREBASE MEMORY + XP
    // =========================
    try {
      let userData = await memory.getUser(userId);

      if (!userData) {
        await memory.createUser(message.author);
      }

      // 💬 guardar mensaje
      await memory.pushMessage(userId, contentRaw, "user");

      // 🔥 XP SYSTEM (EL BUENO)
      await handleXP(message, client);

      // ⏱ last seen
      await memory.updateLastSeen(userId);

    } catch (err) {
      console.error('🔥 Firebase Memory error:', err);
    }

    // =========================
    // 💬 DM → IA
    // =========================
    if (isDM) {
      return handleAI(message, client, userId, contentRaw);
    }

    // =========================
    // 🌍 SOLO SERVIDOR NEXUS
    // =========================
    if (message.guild.id !== NEXUS_GUILD_ID) return;

    const isMention = message.mentions.has(client.user.id);
    const isDirectCall = lower.startsWith('nexus ') || lower === 'nexus';

    let isReplyToBot = false;

    if (message.reference?.messageId) {
      try {
        const ref = await message.channel.messages.fetch(message.reference.messageId);
        isReplyToBot = ref.author.id === client.user.id;
      } catch {}
    }

    if (!isMention && !isDirectCall && !isReplyToBot) return;

    let content = contentRaw;

    if (!isReplyToBot) {
      content = content
        .replace(/<@!?(\d+)>/g, '')
        .replace(/^nexus/i, '')
        .trim();
    }

    if (!content) return message.reply('👋 ¿Qué necesitas?');

    return handleAI(message, client, userId, content);
  }
};

// =========================
// 🧠 IA CORE
// =========================
async function handleAI(message, client, userId, content) {
  try {
    await message.channel.sendTyping();

    const wantsAudio = detectAudioRequest(content);

    const ai = await askNexus(userId, content);
    const safeText = normalizeText(ai?.text);

    if (wantsAudio) {
      await sendAudioReply(message, ai?.speechText || safeText);
      await memory.pushMessage(userId, safeText, "assistant");
      return;
    }

    const reply = await message.reply(safeText);

    await memory.pushMessage(userId, safeText, "assistant");

    return reply;

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

  return triggers.some(t => text.toLowerCase().includes(t));
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