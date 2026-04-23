const { rtdb } = require('../../config/firebase');

const COOLDOWN = 60000;
const XP_PER_MESSAGE = 10;
const LEVEL_CHANNEL_ID = "1496236194109849670";

// 📊 Barra
function createProgressBar(current, total, size = 10) {
  const progress = Math.floor((current / total) * size);
  return "█".repeat(progress) + "░".repeat(size - progress);
}

// 🎨 Color
function getLevelColor(level) {
  if (level >= 20) return 0xff0000;
  if (level >= 10) return 0xffd700;
  if (level >= 5) return 0x00bfff;
  return 0x00ff99;
}

async function handleXP(message, client) {
  try {
    const userId = message.author.id;
    const now = Date.now();

    const ref = rtdb.ref(`users/${userId}/stats`);

    let snapshot = await ref.get();

    // 🔥 SI NO EXISTE → CREAR
    if (!snapshot.exists()) {
      await ref.set({
        xp: 0,
        level: 0,
        lastMessageAt: 0
      });

      snapshot = await ref.get();
    }

    const stats = snapshot.val();

    const currentXP = Number(stats.xp) || 0;
    const currentLevel = Number(stats.level) || 0;
    const lastMessageAt = Number(stats.lastMessageAt) || 0;

    // 🚫 COOLDOWN
    if (now - lastMessageAt < COOLDOWN) return;

    // 🔥 CALCULO
    const newXP = currentXP + XP_PER_MESSAGE;
    const newLevel = Math.floor(newXP / 100);

    const currentLevelXP = newXP % 100;
    const progressBar = createProgressBar(currentLevelXP, 100);

    // 💾 GUARDAR
    await ref.update({
      xp: newXP,
      level: newLevel,
      lastMessageAt: now
    });

    console.log("✅ XP OK:", userId, newXP, newLevel);
    console.log("📍 PATH:", `users/${userId}/stats`);

    // 🎉 LEVEL UP
    if (newLevel > currentLevel) {
      const channel = await client.channels.fetch(LEVEL_CHANNEL_ID);

      if (!channel || !channel.isTextBased()) {
        console.log("❌ Canal inválido");
        return;
      }

      await channel.send({
        content: `🎉 <@${userId}> subió a nivel **${newLevel}**`,
        embeds: [{
          color: getLevelColor(newLevel),
          title: "🚀 LEVEL UP",
          description: `🔥 ¡Nuevo nivel desbloqueado!`,
          thumbnail: {
            url: message.author.displayAvatarURL()
          },
          fields: [
            {
              name: "🏆 Nivel",
              value: `**${currentLevel} → ${newLevel}**`,
              inline: true
            },
            {
              name: "✨ XP Total",
              value: `**${newXP} XP**`,
              inline: true
            },
            {
              name: "📊 Progreso",
              value: `\`${progressBar}\`\n${currentLevelXP}/100 XP`
            }
          ],
          footer: {
            text: "Sigue activo para subir más niveles ⚡"
          },
          timestamp: new Date()
        }]
      });
    }

  } catch (err) {
    console.error("💥 XP SYSTEM ERROR:", err);
  }
}

module.exports = { handleXP };