const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Reclama tu recompensa diaria'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = db.getUser(userId);

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24h

    if (now - user.lastDaily < cooldown) {
      const remaining = Math.ceil((cooldown - (now - user.lastDaily)) / 1000 / 60);

      return interaction.reply({
        content: `⏳ Ya reclamaste. Intenta en ${remaining} min`,
        ephemeral: true
      });
    }

    const reward = Math.floor(Math.random() * 200) + 100;

    db.updateUser(userId, {
      money: user.money + reward,
      lastDaily: now
    });

    const embed = new EmbedBuilder()
      .setTitle('🎁 Daily Reward')
      .setDescription(`Ganaste **${reward} monedas** 💰`)
      .setColor(0x57F287);

    await interaction.reply({ embeds: [embed] });
  }
};