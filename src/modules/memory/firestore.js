const { db } = require("../firebase");

// =========================
// 📊 COUNTING - GET DATA
// =========================
async function getCounting(channelId) {
  const ref = db.collection("counting").doc(channelId);
  const doc = await ref.get();

  return doc.exists ? doc.data() : { lastNumber: 0 };
}

// =========================
// 📈 COUNTING - UPDATE
// =========================
async function updateCounting(channelId, number) {
  const ref = db.collection("counting").doc(channelId);

  await ref.set(
    {
      lastNumber: number,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

// =========================
// 🔄 COUNTING - RESET
// =========================
async function resetCounting(channelId) {
  const ref = db.collection("counting").doc(channelId);

  await ref.set({
    lastNumber: 0,
    updatedAt: Date.now(),
  });
}

// =========================
// 🧠 EXPECTED NUMBER
// =========================
function getExpectedNumber(lastNumber) {
  return lastNumber + 1;
}

// =========================
// 📦 EXPORTS
// =========================
module.exports = {
  getCounting,
  updateCounting,
  resetCounting,
  getExpectedNumber,
};