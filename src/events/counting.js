const { Events } = require('discord.js');
const { db } = require('../config/firebase');
// 🔥 CONFIG
const CHANNEL_ID = "1494120329444855888";

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;

    const content = message.content.trim();

    // ❌ no es número
    if (!/^\d+$/.test(content)) {
      await message.react("❌").catch(() => {});
      setTimeout(() => message.delete().catch(() => {}), 1500);
      return;
    }

    const number = Number(content);

    // 📦 Firestore
    const ref = db.collection("counting").doc(CHANNEL_ID);
    const doc = await ref.get();

    const data = doc.exists ? doc.data() : { lastNumber: 0 };

    // 🔥 SI NO EXISTE, LO CREA (SIN RESET POR DÍA)
    if (!doc.exists) {
      await ref.set({
        lastNumber: 0,
        updatedAt: Date.now(),
      });
    }

    const expected = data.lastNumber + 1;

    // ✅ correcto
    if (number === expected) {
      await ref.set(
        {
          lastNumber: number,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      await message.react("✅").catch(() => {});
      return;
    }

    // ❌ incorrecto
    await message.react("❌").catch(() => {});
    setTimeout(() => message.delete().catch(() => {}), 1500);

    // 🔄 SOLO RESET POR ERROR, NO POR TIEMPO
    await ref.set({
      lastNumber: 0,
      updatedAt: Date.now(),
    });

    const msg = await message.channel.send(
      "❌ Número incorrecto. El conteo se reinició a **1**"
    );

    setTimeout(() => msg.delete().catch(() => {}), 3000);
  }
};