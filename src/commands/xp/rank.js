const { SlashCommandBuilder } = require('discord.js');
const memory = require('../../modules/memory/firebaseMemory');

const safeNumber = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Ver tu nivel y XP'),

  async execute(interaction) {
    const userId = interaction.user.id;

    // 🔥 OBTENER DESDE RTDB (FUENTE REAL)
    const stats = await memory.getStats(userId);

    if (!stats) {
      console.log(`[RANK] Usuario sin stats: ${userId}`);
      return interaction.reply("❌ Aún no tienes XP.");
    }

    // 🔥 DEBUG LIMPIO
    console.log("========== RANK DEBUG ==========");
    console.log("USER:", userId);
    console.log("STATS RAW:", stats);

    const xp = safeNumber(stats.xp);

    // 🔥 ÚNICA VERDAD
    const level = Math.floor(xp / 100);
    const currentXP = xp % 100;

    const percent = currentXP / 100;

    const filled = Math.max(0, Math.min(10, Math.floor(percent * 10)));
    const empty = 10 - filled;

    const bar =
      "█".repeat(filled) +
      "░".repeat(empty);

    // 🔥 DEBUG RESULTADO
    console.log("RANK RESULT:", {
      xp,
      level,
      currentXP,
      filled
    });

    return interaction.reply({
      embeds: [
        {
          color: 0x00ff99,
          title: "📊 Tu Nivel",
          description: `<@${userId}>`,
          fields: [
            {
              name: "🏆 Nivel",
              value: `**${level}**`,
              inline: true
            },
            {
              name: "✨ XP Total",
              value: `**${xp}**`,
              inline: true
            },
            {
              name: "📈 Progreso",
              value: `\`${bar}\`\n${currentXP}/100 XP`,
              inline: false
            }
          ],
          thumbnail: {
            url: interaction.user.displayAvatarURL()
          },
          timestamp: new Date()
        }
      ]
    });
  }
};