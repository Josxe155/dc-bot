const admin = require("firebase-admin");

// =========================
// 🔥 INIT FIREBASE (RTDB)
// =========================
const firebaseConfig = require("../../config/firebase");

if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

const db = admin.database();

// =========================
// 🧠 OBTENER USUARIO
// =========================
async function getUser(userId) {
  const snap = await db.ref(`users/${userId}`).get();
  return snap.exists() ? snap.val() : null;
}

// =========================
// 🧠 CREAR USUARIO (ROBUSTO)
// =========================
async function createUser(user) {
  const ref = db.ref(`users/${user.id}`);
  const snap = await ref.get();

  if (snap.exists()) {
    const data = snap.val();

    if (!data.stats) {
      await ref.child("stats").set({
        xp: 0,
        level: 0,
        lastMessageAt: 0
      });
      console.log("🛠️ stats reparado:", user.id);
    }

    return data;
  }

  const baseData = {
    profile: {
      username: user.username,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    },

    stats: {
      xp: 0,
      level: 0,
      lastMessageAt: 0
    },

    moderation: {
      warns: 0,
    },

    memory: {
      recentMessages: [],
    },

    logs: [],
  };

  await ref.set(baseData);
  console.log("✅ usuario creado:", user.id);

  return baseData;
}

// =========================
// 🔥 ASEGURAR STATS
// =========================
async function ensureStats(userId) {
  const ref = db.ref(`users/${userId}/stats`);
  const snap = await ref.get();

  if (!snap.exists()) {
    await ref.set({
      xp: 0,
      level: 0,
      lastMessageAt: 0
    });

    console.log("🛠️ stats creado:", userId);
  }
}

// =========================
// 💬 GUARDAR MENSAJE
// =========================
async function pushMessage(userId, message) {
  const ref = db.ref(`users/${userId}/memory/recentMessages`);

  const snap = await ref.get();
  let messages = snap.val() || [];

  messages.push({
    content: message,
    timestamp: Date.now(),
  });

  if (messages.length > 10) {
    messages = messages.slice(-10);
  }

  await ref.set(messages);
}

// =========================
// 🚀 XP SYSTEM WRAPPER (MEJORADO)
// =========================
// 👉 AHORA YA NO DEPENDE DE PASAR xpSystem
async function addXP(message, client) {
  try {
    // Import dinámico para evitar circular dependencies
    const xpSystem = require("../xp/xpSystem");

    if (!xpSystem || !xpSystem.handleXP) {
      console.warn("⚠️ xpSystem no disponible");
      return;
    }

    await xpSystem.handleXP(message, client);

  } catch (err) {
    console.error("💥 Error en addXP:", err);
  }
}

// =========================
// ⏱ LAST SEEN
// =========================
async function updateLastSeen(userId) {
  await db.ref(`users/${userId}/profile`).update({
    lastSeen: Date.now(),
  });
}

// =========================
// 📡 LOGS
// =========================
async function addLog(userId, type, data = {}) {
  const ref = db.ref(`users/${userId}/logs`);

  const snap = await ref.get();
  let logs = snap.val() || [];

  logs.push({
    type,
    data,
    timestamp: Date.now(),
  });

  if (logs.length > 20) {
    logs = logs.slice(-20);
  }

  await ref.set(logs);
}

// =========================
// 🧠 HELPERS
// =========================
async function getRecentMessages(userId) {
  const snap = await db.ref(`users/${userId}/memory/recentMessages`).get();
  return snap.val() || [];
}

async function getStats(userId) {
  const snap = await db.ref(`users/${userId}/stats`).get();
  return snap.val() || { xp: 0, level: 0, lastMessageAt: 0 };
}

async function getProfile(userId) {
  const snap = await db.ref(`users/${userId}/profile`).get();
  return snap.val() || null;
}

// =========================
// 📦 EXPORTS
// =========================
module.exports = {
  getUser,
  createUser,
  ensureStats,
  pushMessage,
  addXP, // ✅ limpio y usable
  updateLastSeen,
  addLog,
  getRecentMessages,
  getStats,
  getProfile,
};