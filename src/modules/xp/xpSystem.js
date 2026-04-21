const db = require('../db/firestore');

const COOLDOWN = 60000;
const XP_PER_MESSAGE = 10;
const LEVEL_CHANNEL_ID = "1496236194109849670";

function calculateLevel(xp) {
  return Math.floor(xp / 100);
}

// 📊 Barra de progreso
function createProgressBar(current, total, size = 10) {
  const progress = Math.floor((current / total) * size);
  const empty = size - progress;

  return "█".repeat(progress) + "░".repeat(empty);
}

// 🎨 Color por nivel
function getLevelColor(level) {
  if (level >= 20) return 0xff0000; // rojo pro
  if (level >= 10) return 0xffd700; // dorado
  if (level >= 5) return 0x00bfff;  // azul
  return 0x00ff99; // verde base
}

async function handleXP(message, client) {
  const userId = message.author.id;
  const now = Date.now();

  const userRef = db.collection('users').doc(userId);
  const doc = await userRef.get();

  let data = {
    xp: 0,
    level: 0,
    lastMessageAt: 0
  };

  if (doc.exists) data = doc.data();

  // 🚫 Cooldown
  if (now - data.lastMessageAt < COOLDOWN) return;

  const newXP = data.xp + XP_PER_MESSAGE;
  const oldLevel = data.level;
  const newLevel = calculateLevel(newXP);

  // 📊 Progreso dentro del nivel
  const currentLevelXP = newXP % 100;
  const progressBar = createProgressBar(currentLevelXP, 100);

  await userRef.set({
    xp: newXP,
    level: newLevel,
    lastMessageAt: now,
    updatedAt: now
  }, { merge: true });

  // 🎉 LEVEL UP
  if (newLevel > oldLevel) {
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
        description: `🚀 **<@${userId}> ha subido de nivel**`,
        thumbnail: {
          url: message.author.displayAvatarURL()
        },
        fields: [
          {
            name: "🏆 Nivel",
            value: `**${oldLevel} → ${newLevel}**`,
            inline: true
          },
          {
            name: "✨ XP Total",
            value: `**${newXP} XP**`,
            inline: true
          },
          {
            name: "📊 Progreso",
            value: `\`${progressBar}\`\n${currentLevelXP}/100 XP`,
            inline: false
          }
        ],
        footer: {
          text: "Sigue hablando para subir más niveles 🔥"
        },
        timestamp: new Date()
      };

      await channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Error canal nivel:", err);
    }
  }
}

module.exports = { handleXP };