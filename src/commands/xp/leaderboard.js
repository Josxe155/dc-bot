const { db } = require('../../config/firebase');
const { SlashCommandBuilder } = require('discord.js');

const safeNumber = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

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
      const data = doc.data() || {};

      const xp = safeNumber(data.xp);

      description += `**${i}.** <@${doc.id}> — ${xp} XP\n`;
      i++;
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