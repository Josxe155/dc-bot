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
  const snapshot = await db.ref(`users/${userId}`).get();
  return snapshot.exists() ? snapshot.val() : null;
}

// =========================
// 🧠 CREAR USUARIO
// =========================
async function createUser(user) {
  const ref = db.ref(`users/${user.id}`);

  const baseData = {
    profile: {
      username: user.username,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    },

    stats: {
      xp: 0,
      level: 1,
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

  const snapshot = await ref.get();
  let messages = snapshot.val() || [];

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
// 📊 XP SYSTEM (FIXED)
// =========================
async function addXP(userId, amount = 5) {
  const ref = db.ref(`users/${userId}/stats`);

  const snapshot = await ref.get();
  const stats = snapshot.val() || { xp: 0, level: 1 };

  const currentXP = Number(stats.xp) || 0;
  const currentLevel = Number(stats.level) || 1;
  const add = Number(amount) || 0;

  const xp = currentXP + add;
  const level = Math.floor(xp / 100);

  await ref.update({
    xp,
    level
  });

  return { xp, level };
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

  const snapshot = await ref.get();
  let logs = snapshot.val() || [];

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
  const snapshot = await db
    .ref(`users/${userId}/memory/recentMessages`)
    .get();

  return snapshot.val() || [];
}

async function getStats(userId) {
  const snapshot = await db.ref(`users/${userId}/stats`).get();
  return snapshot.val() || { xp: 0, level: 1 };
}

async function getProfile(userId) {
  const snapshot = await db.ref(`users/${userId}/profile`).get();
  return snapshot.val() || null;
}

// =========================
// 📦 EXPORTS
// =========================
module.exports = {
  getUser,
  createUser,
  pushMessage,
  addXP,
  updateLastSeen,
  addLog,
  getRecentMessages,
  getStats,
  getProfile,
};