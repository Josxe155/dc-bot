const admin = require("firebase-admin");
const path = require("path");

// 🔑 Service Account Key (descargada de Firebase Console)
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };