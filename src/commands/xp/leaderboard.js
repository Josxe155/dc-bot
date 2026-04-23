const { rtdb } = require('../../config/firebase');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top usuarios con más XP'),

  async execute(interaction) {
    await interaction.deferReply(); // 🔥 evita errores si tarda

    const snapshot = await rtdb.ref('users').get();

    if (!snapshot.exists()) {
      return interaction.editReply("❌ No hay datos.");
    }

    const users = snapshot.val();

    const sorted = Object.entries(users)
      .map(([id, data]) => ({
        id,
        xp: Number(data?.stats?.xp) || 0,
        level: Number(data?.stats?.level) || 0
      }))
      .filter(u => u.xp > 0) // 🔥 evita basura
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.editReply("❌ No hay usuarios con XP.");
    }

    // 🏆 MEDALLAS
    const medals = ["🥇", "🥈", "🥉"];

    let description = "";

    sorted.forEach((user, index) => {
      const medal = medals[index] || `**${index + 1}.**`;

      description += `${medal} <@${user.id}>\n` +
                     `└ ✨ \`${user.xp} XP\` • 🏆 Nivel ${user.level}\n\n`;
    });

    const embed = {
      color: 0xffd700,
      title: "🏆 Leaderboard Global",
      description,
      footer: {
        text: `Solicitado por ${interaction.user.username}`
      },
      timestamp: new Date()
    };

    return interaction.editReply({ embeds: [embed] });
  }
};