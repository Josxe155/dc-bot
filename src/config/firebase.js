const admin = require("firebase-admin");

let firebaseApp;

// =========================
// 🔥 INIT FIREBASE SAFE
// =========================
function initFirebase() {
  if (firebaseApp) return firebaseApp;

  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("❌ Missing FIREBASE_PROJECT_ID");
  }

  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("❌ Missing FIREBASE_CLIENT_EMAIL");
  }

  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("❌ Missing FIREBASE_PRIVATE_KEY");
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DB_URL,
  });

  return firebaseApp;
}

initFirebase();

// =========================
// ✅ SOLO RTDB
// =========================
const rtdb = admin.database();

module.exports = {
  admin,
  rtdb
};