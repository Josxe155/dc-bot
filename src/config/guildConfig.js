const db = require('./firebase');

const cache = new Map();

// =========================
// ⚙️ CONFIG POR DEFECTO
// =========================
const DEFAULT_CONFIG = {
  automod: {
    caps: {
      enabled: true,
      minLength: 8
    },
    links: {
      enabled: true,
      whitelist: ["youtube.com", "discord.com"]
    },
    spam: {
      enabled: true,
      maxMessages: 5,
      interval: 5000
    },
    mentions: {
      enabled: true,
      max: 4
    }
  }
};

// =========================
// 🧠 GET CONFIG
// =========================
async function getConfig(guildId) {
  if (cache.has(guildId)) {
    return cache.get(guildId);
  }

  const ref = rtdb.ref(`guilds/${guildId}`);
  const snap = await ref.get();

  let data;

  if (!snap.exists()) {
    data = DEFAULT_CONFIG;
    await ref.set(data);
    console.log(`🆕 Config creada para guild: ${guildId}`);
  } else {
    data = snap.val();
  }

  cache.set(guildId, data);
  return data;
}

// =========================
// 🔧 UPDATE CONFIG (MERGE)
// =========================
async function updateConfig(guildId, newData) {
  const ref = rtdb.ref(`guilds/${guildId}`);

  await ref.update(newData);

  const snap = await ref.get();
  const updated = snap.val();

  cache.set(guildId, updated);

  return updated;
}

// =========================
// ♻️ RESET CONFIG
// =========================
async function resetConfig(guildId) {
  const ref = rtdb.ref(`guilds/${guildId}`);

  await ref.set(DEFAULT_CONFIG);
  cache.set(guildId, DEFAULT_CONFIG);
}

// =========================
// 📦 EXPORTS
// =========================
module.exports = {
  getConfig,
  updateConfig,
  resetConfig,
  cache
};