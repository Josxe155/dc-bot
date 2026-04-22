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
// 📊 XP SYSTEM (FIX PRO LEVEL UP)
// =========================
async function addXP(userId, amount = 5) {
  const ref = db.ref(`users/${userId}/stats`);

  const snap = await ref.get();
  const stats = snap.val() || { xp: 0, level: 1 };

  const currentXP = Number(stats.xp) || 0;
  const currentLevel = Number(stats.level) || 1;
  const add = Number(amount) || 0;

  const newXP = currentXP + add;
  const newLevel = Math.floor(newXP / 100);

  const leveledUp = newLevel > currentLevel;

  await ref.update({
    xp: newXP,
    level: newLevel
  });

  return {
    xp: newXP,
    level: newLevel,
    oldLevel: currentLevel,
    leveledUp
  };
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
  return snap.val() || { xp: 0, level: 1 };
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
  addXP,
  updateLastSeen,
  addLog,
  getRecentMessages,
  getStats,
  getProfile,
};