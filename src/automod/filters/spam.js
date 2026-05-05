const cache = new Map();
const addStrike = require('../utils/strikes');

// ------------------------------
// 🧠 DETECTORES
// ------------------------------

// repetición exacta de palabras
function isRepeating(content) {
  const words = content.trim().split(/\s+/);
  if (words.length < 4) return false;
  return words.every(w => w.toLowerCase() === words[0].toLowerCase());
}

// spam de caracteres (aaaaa, !!!!!)
function isCharSpam(content) {
  return /^(.)\1{4,}$/.test(content.replace(/\s/g, ''));
}

// mensajes duplicados en corto tiempo
function isDuplicate(history, content) {
  return history.slice(-3).includes(content);
}

// score de riesgo
function calculateScore({ flood, repeat, charSpam, duplicate }) {
  let score = 0;
  if (flood) score += 3;
  if (repeat) score += 3;
  if (charSpam) score += 2;
  if (duplicate) score += 2;
  return score;
}

// ------------------------------
// 🚀 MAIN
// ------------------------------
module.exports = async (message, config) => {
  const userId = message.author.id;
  const now = Date.now();

  if (!cache.has(userId)) {
    cache.set(userId, []);
  }

  const data = cache.get(userId);

  // guardar historial de mensajes (últimos 10)
  data.push({
    content: message.content,
    time: now
  });

  // mantener solo últimos 10
  const history = data.slice(-10);
  cache.set(userId, history);

  const interval = config.automod.spam.interval || 5000;
  const max = config.automod.spam.maxMessages || 5;

  // ------------------------------
  // 📊 FLOOD DETECTION
  // ------------------------------
  const recent = history.filter(m => now - m.time < interval);
  const flood = recent.length >= max;

  // ------------------------------
  // 🧠 CONTENT ANALYSIS
  // ------------------------------
  const content = message.content;

  const repeat = isRepeating(content);
  const charSpam = isCharSpam(content);
  const duplicate = isDuplicate(history.map(h => h.content), content);

  // ------------------------------
  // 🎯 SCORE SYSTEM
  // ------------------------------
  const score = calculateScore({
    flood,
    repeat,
    charSpam,
    duplicate
  });

  // ------------------------------
  // 🚨 ACTIONS
  // ------------------------------
  if (score >= 3) {
    await message.delete().catch(() => {});
    await addStrike(message, `Spam detectado (score: ${score})`);
    return;
  }

  // ------------------------------
  // ⚠️ CLEAN FLOOD SOLO
  // ------------------------------
  if (flood) {
    await message.delete().catch(() => {});
    await addStrike(message, "Flood spam detectado");
    return;
  }
};