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
      return interaction.reply("❌ Aún no tienes XP.");
    }

    const data = doc.data() || {};

    const xp = safeNumber(data.xp);
    const level = safeNumber(data.level);

    // 🔥 XP dentro del nivel actual (más claro)
    const levelXP = xp - (level * 100);
    const currentXP = Math.max(0, levelXP);

    const percent = currentXP / 100;

    const filled = Math.floor(percent * 10);
    const empty = 10 - filled;

    const bar =
      "█".repeat(filled) +
      "░".repeat(empty);

    return interaction.reply({
      embeds: [{
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
      }]
    });
  }
};