const { SlashCommandBuilder } = require('discord.js');
const db = require('../../config/firebase').rtdb;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top usuarios con más XP'),

  async execute(interaction) {
    const snapshot = await db.ref('users').get();

    if (!snapshot.exists()) {
      return interaction.reply("❌ No hay datos.");
    }

    const users = snapshot.val();

    const sorted = Object.entries(users)
      .map(([id, data]) => ({
        id,
        xp: Number(data?.stats?.xp || 0)
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    let description = "";

    sorted.forEach((user, i) => {
      description += `**${i + 1}.** <@${user.id}> — ${user.xp} XP\n`;
    });

    return interaction.reply({
      embeds: [
        {
          color: 0xffd700,
          title: "🏆 Leaderboard",
          description
        }
      ]
    });
  }
};