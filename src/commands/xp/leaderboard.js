const { db } = require('../../config/firebase');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top usuarios con más XP'),

  async execute(interaction) {
    const snapshot = await db.collection('users')
      .orderBy('xp', 'desc')
      .limit(10)
      .get();

    if (snapshot.empty) {
      return interaction.reply("❌ No hay datos.");
    }

    let description = "";
    let i = 1;

    snapshot.forEach(doc => {
      const data = doc.data();
      description += `**${i}.** <@${doc.id}> — ${data.xp} XP\n`;
      i++;
    });

    const embed = {
      color: 0xffd700,
      title: "🏆 Leaderboard",
      description
    };

    return interaction.reply({ embeds: [embed] });
  }
};