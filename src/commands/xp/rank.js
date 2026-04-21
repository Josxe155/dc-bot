const { db } = require('../../config/firebase');
const { SlashCommandBuilder } = require('discord.js');

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

    const doc = await db.collection('users').doc(userId).get();

    if (!doc.exists) {
      console.log(`[RANK] Usuario sin data: ${userId}`);
      return interaction.reply("❌ Aún no tienes XP.");
    }

    const data = doc.data() || {};

    // 🔥 DEBUG LOG COMPLETO
    console.log("========== RANK DEBUG ==========");
    console.log("USER:", userId);
    console.log("RAW DATA:", data);
    console.log("XP RAW:", data.xp);
    console.log("LEVEL RAW:", data.level);

    const xp = safeNumber(data.xp);

    // 🔥 fuente única de verdad (IMPORTANTE)
    const level = Math.floor(xp / 100);
    const currentXP = xp % 100;

    const percent = currentXP / 100;

    const filled = Math.max(0, Math.min(10, Math.floor(percent * 10)));
    const empty = 10 - filled;

    const bar =
      "█".repeat(filled) +
      "░".repeat(empty);

    const embed = {
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
      }
    };

    console.log("RANK RESULT:", {
      level,
      xp,
      currentXP,
      filled
    });

    return interaction.reply({ embeds: [embed] });
  }
};