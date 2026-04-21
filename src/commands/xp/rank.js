const { db } = require('../../config/firebase');
const { SlashCommandBuilder } = require('discord.js');

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

    // 🧠 FIX IMPORTANTE: evitar NaN
    const xp = Number(data.xp ?? 0);
    const level = Number(data.level ?? 0);

    const currentXP = xp % 100;

    const progress = Math.floor((currentXP / 100) * 10);

    const bar = "█".repeat(Math.max(0, progress)) +
                "░".repeat(Math.max(0, 10 - progress));

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