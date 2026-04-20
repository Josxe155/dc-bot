const { db } = require("../../config/firebase");

// 🔹 Crear usuario si no existe
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

// 🔹 Guardar mensaje en historial
async function saveMessage(userId, message) {
  const ref = db.collection("users").doc(userId);

  await ref.update({
    messages: admin.firestore.FieldValue.arrayUnion({
      text: message,
      timestamp: Date.now(),
    }),
  });
}

// 🔹 Incrementar uso diario
async function incrementUsage(userId) {
  const ref = db.collection("users").doc(userId);

  await ref.update({
    dailyUsage: admin.firestore.FieldValue.increment(1),
  });
}

// 🔹 Reset diario (lógica externa)
async function resetUsage(userId) {
  const ref = db.collection("users").doc(userId);

  await ref.update({
    dailyUsage: 0,
    lastReset: Date.now(),
  });
}

module.exports = {
  ensureUser,
  saveMessage,
  incrementUsage,
  resetUsage,
};