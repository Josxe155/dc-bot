const admin = require("firebase-admin");

// =========================
// 🔥 INIT FIREBASE (RTDB)
// =========================
const firebaseConfig = require("../../config/firebase");

function initFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp(firebaseConfig);
  }
}

initFirebase();

const db = admin.database();

// =========================
// 🧠 OBTENER USUARIO
// =========================
async function getUser(userId) {
  const snap = await db.ref(`users/${userId}`).get();
  return snap.exists() ? snap.val() : null;
}

// =========================
// 🧠 CREAR USUARIO (FIXED)
// =========================
async function createUser(user) {
  const ref = db.ref(`users/${user.id}`);

  const snap = await ref.get();

  // 🚫 SI YA EXISTE → NO HACER NADA
  if (snap.exists()) return snap.val();

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
  return baseData;
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
// 🚫 DESACTIVADO (NO USAR)
// =========================
async function addXP() {
  console.warn("⚠️ NO uses addXP de memory, usa xpSystem");
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
  pushMessage,
  addXP, // ⚠️ no usar
  updateLastSeen,
  addLog,
  getRecentMessages,
  getStats,
  getProfile,
};