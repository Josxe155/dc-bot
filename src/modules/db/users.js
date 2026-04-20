const { db } = require("../../config/firebase");

// 👤 Crear usuario si no existe
async function ensureUser(userId) {
  const ref = db.collection("users").doc(userId);
  const doc = await ref.get();

  if (!doc.exists) {
    await ref.set({
      profile: {
        createdAt: Date.now(),
      },
      messages: [],
      dailyUsage: 0,
      lastReset: Date.now(),
      logs: [],
    });
  }
}

// 💬 Guardar mensaje (FIX REAL)
async function saveMessage(userId, message) {
  const ref = db.collection("users").doc(userId);

  await ref.update({
    messages: db.FieldValue.arrayUnion({
      text: message,
      timestamp: Date.now(),
    }),
  });
}

// 📊 Incrementar uso diario (OPTIMIZADO)
async function incrementUsage(userId) {
  const ref = db.collection("users").doc(userId);

  await ref.update({
    dailyUsage: db.FieldValue.increment(1),
  });
}

module.exports = {
  ensureUser,
  saveMessage,
  incrementUsage,
};