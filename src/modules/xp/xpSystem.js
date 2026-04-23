const memory = require('../modules/memory/firebaseMemory');
const { rtdb } = require('../config/firebase');

const COOLDOWN = 60000;
const XP_PER_MESSAGE = 10;
const LEVEL_CHANNEL_ID = "1496236194109849670";

// 📊 Barra de progreso
function createProgressBar(current, total, size = 10) {
  const progress = Math.floor((current / total) * size);
  return "█".repeat(progress) + "░".repeat(size - progress);
}

// 🎨 Color por nivel
function getLevelColor(level) {
  if (level >= 20) return 0xff0000;
  if (level >= 10) return 0xffd700;
  if (level >= 5) return 0x00bfff;
  return 0x00ff99;
}

async function handleXP(message, client) {
  const userId = message.author.id;
  const now = Date.now();

  // 🧠 USER DATA
  let userData = await memory.getUser(userId);

  if (!userData) {
    await memory.createUser(message.author);
    userData = await memory.getUser(userId);
  }

  const stats = userData.stats || {};

  const currentXP = Number(stats.xp) || 0;
  const currentLevel = Number(stats.level) || 0;
  const lastMessageAt = Number(stats.lastMessageAt) || 0;

  // 🚫 COOLDOWN
  if (now - lastMessageAt < COOLDOWN) return;

  // 🔥 CALCULAR XP
  const newXP = currentXP + XP_PER_MESSAGE;
  const newLevel = Math.floor(newXP / 100);

  const currentLevelXP = newXP % 100;
  const progressBar = createProgressBar(currentLevelXP, 100);

  // 💾 GUARDAR (RTDB)
  await rtdb.ref(`users/${userId}/stats`).update({
    xp: newXP,
    level: newLevel,
    lastMessageAt: now
  });

  // 🎉 LEVEL UP
  if (newLevel > currentLevel) {
    try {
      const channel = await client.channels.fetch(LEVEL_CHANNEL_ID);
      if (!channel || !channel.isTextBased()) return;

      const embed = {
        color: getLevelColor(newLevel),
        author: {
          name: message.author.username,
          icon_url: message.author.displayAvatarURL()
        },
        title: "🎉 LEVEL UP!",
        description: `🚀 <@${userId}> subió de nivel`,
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
        thumbnail: {
          url: message.author.displayAvatarURL()
        },
        timestamp: new Date()
      };

      await channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("❌ Error canal level:", err);
    }
  }
}

module.exports = { handleXP };