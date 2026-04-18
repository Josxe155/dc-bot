const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Ver tu dinero'),

  async execute(interaction) {
    const user = db.getUser(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle('💰 Balance')
      .setDescription(`Tienes **${user.money} monedas**`)
      .setColor(0xFFD700);

    await interaction.reply({ embeds: [embed] });
  }
};