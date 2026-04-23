const memory = require('../modules/memory/firebaseMemory');
const { rtdb } = require('../config/firebase');

const COOLDOWN = 60000;
const XP_PER_MESSAGE = 10;
const LEVEL_CHANNEL_ID = "1496236194109849670";

// 📊 Barra de progreso
function createProgressBar(current, total, size = 10) {
  const progress = Math.max(0, Math.min(size, Math.floor((current / total) * size)));
  return "█".repeat(progress) + "░".repeat(size - progress);
}

async function handleXP(message, client) {
  const userId = message.author.id;
  const now = Date.now();

  let userData = await memory.getUser(userId);

  if (!userData) {
    await memory.createUser(message.author);
    userData = await memory.getUser(userId);
  }

  const stats = userData?.stats || {};

  const currentXP = Number(stats.xp) || 0;
  const currentLevel = Number(stats.level) || 0;
  const lastMessageAt = Number(stats.lastMessageAt) || 0;

  // 🚫 cooldown
  if (now - lastMessageAt < COOLDOWN) return;

  const newXP = currentXP + XP_PER_MESSAGE;
  const newLevel = Math.floor(newXP / 100);

  const currentLevelXP = newXP % 100;
  const progressBar = createProgressBar(currentLevelXP, 100);

  // 💾 RTDB update
  await rtdb.ref(`users/${userId}/stats`).update({
    xp: newXP,
    level: newLevel,
    lastMessageAt: now
  });

  // 🔍 DEBUG
  console.log("━━━━━━━━━━━━━━━━━━");
  console.log("⚡ XP SYSTEM");
  console.log("👤", userId);
  console.log("XP:", currentXP, "→", newXP);
  console.log("LVL:", currentLevel, "→", newLevel);
  console.log("━━━━━━━━━━━━━━━━━━");

  // 🎉 LEVEL UP
  if (newLevel > currentLevel) {
    try {
      const channel = await client.channels.fetch(LEVEL_CHANNEL_ID).catch(() => null);

      if (!channel || !channel.isTextBased()) {
        console.log("❌ Canal inválido");
        return;
      }

      const levelMessage =
`🎉 **LEVEL UP!**
━━━━━━━━━━━━━━━━━━
🚀 Usuario: <@${userId}>
🏆 Nivel: ${currentLevel} ➜ ${newLevel}
⚡ XP Total: ${newXP.toLocaleString()}
📊 Progreso: ${currentLevelXP}/100 XP
━━━━━━━━━━━━━━━━━━
🔥 ¡Sigue así!`;

      await channel.send({ content: levelMessage });

      console.log("✅ LEVEL UP ENVIADO (TEXTO PLANO)");

    } catch (err) {
      console.error("❌ Error level:", err);
    }
  }
}

module.exports = { handleXP };