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

    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return interaction.reply("❌ Aún no tienes XP.");
    }

    const data = doc.data() || {};

    // 🛡️ SAFE DATA
    const xp = safeNumber(data.xp);
    const level = safeNumber(data.level);

    const currentXP = Math.max(0, xp % 100);

    const progress = Math.min(10, Math.floor((currentXP / 100) * 10));

    const bar = "█".repeat(progress) +
                "░".repeat(10 - progress);

    const embed = {
      color: 0x00ff99,
      title: "📊 Tu Nivel",
      description: `<@${userId}>`,
      thumbnail: {
        url: interaction.user.displayAvatarURL()
      },
      fields: [
        {
          name: "🏆 Nivel",
          value: `**${level}**`,
          inline: true
        },
        {
          name: "✨ XP",
          value: `**${xp}**`,
          inline: true
        },
        {
          name: "📈 Progreso",
          value: `\`${bar}\`\n${currentXP}/100 XP`,
          inline: false
        }
      ],
      timestamp: new Date()
    };

    return interaction.reply({ embeds: [embed] });
  }
};