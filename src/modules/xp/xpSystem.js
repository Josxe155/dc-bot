const { rtdb } = require('../../config/firebase');

const COOLDOWN = 60000;
const XP_PER_MESSAGE = 10;
const LEVEL_CHANNEL_ID = "1496236194109849670";

// 📊 Barra
function createProgressBar(current, total, size = 10) {
  const progress = Math.floor((current / total) * size);
  return "█".repeat(progress) + "░".repeat(size - progress);
}

// 🎨 Color dinámico
function getLevelColor(level) {
  if (level >= 20) return 0xff0000;
  if (level >= 10) return 0xffd700;
  if (level >= 5) return 0x00bfff;
  return 0x00ff99;
}

async function handleXP(message, client) {
  const userId = message.author.id;
  const now = Date.now();

  const ref = rtdb.ref(`users/${userId}/stats`);

  try {
    // 🔥 USAR TRANSACTION (ANTI BUG / ANTI RACE CONDITION)
    let leveledUp = false;
    let oldLevel = 0;
    let newLevel = 0;
    let newXP = 0;
    let currentLevelXP = 0;

    await ref.transaction((stats) => {

      if (!stats) {
        stats = {
          xp: 0,
          level: 0,
          lastMessageAt: 0
        };
      }

      // 🚫 COOLDOWN
      if (now - (stats.lastMessageAt || 0) < COOLDOWN) {
        return; // ❌ cancela transaction
      }

      oldLevel = stats.level || 0;

      // 🔥 CALCULO
      newXP = (stats.xp || 0) + XP_PER_MESSAGE;
      newLevel = Math.floor(newXP / 100);

      currentLevelXP = newXP % 100;

      leveledUp = newLevel > oldLevel;

      return {
        xp: newXP,
        level: newLevel,
        lastMessageAt: now
      };
    });

    // 🚫 Si no hubo cambio (cooldown)
    if (newXP === 0) return;

    console.log(`⚡ XP → ${userId} | XP: ${newXP} | LVL: ${newLevel}`);

    // 🎉 LEVEL UP
    if (leveledUp) {
      const channel = await client.channels.fetch(LEVEL_CHANNEL_ID).catch(() => null);

      if (!channel?.isTextBased()) {
        console.log("❌ Canal inválido");
        return;
      }

      const progressBar = createProgressBar(currentLevelXP, 100);

      await channel.send({
        content: `🎉 <@${userId}>`,
        embeds: [
          {
            color: getLevelColor(newLevel),
            title: "🚀 LEVEL UP",
            description: `🔥 Has subido a **nivel ${newLevel}**`,
            thumbnail: {
              url: message.author.displayAvatarURL({ dynamic: true })
            },
            fields: [
              {
                name: "🏆 Nivel",
                value: `\`${oldLevel} → ${newLevel}\``,
                inline: true
              },
              {
                name: "✨ XP Total",
                value: `\`${newXP} XP\``,
                inline: true
              },
              {
                name: "📊 Progreso",
                value: `\`${progressBar}\`\n${currentLevelXP}/100 XP`,
              }
            ],
            footer: {
              text: `Usuario: ${message.author.username}`
            },
            timestamp: new Date()
          }
        ]
      });
    }

  } catch (err) {
    console.error("💥 XP SYSTEM ERROR:", err);
  }
}

module.exports = { handleXP };