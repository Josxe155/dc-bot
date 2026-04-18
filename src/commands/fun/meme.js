const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Envía un meme básico'),

  async execute(interaction) {
    const memes = [
      '😂 Cuando funciona a la primera',
      '💀 Cuando rompe en producción',
      '🚀 Deploy y rezar',
      '🤡 "Solo era un cambio pequeño"'
    ];

    const random = memes[Math.floor(Math.random() * memes.length)];

    await interaction.reply(random);
  }
};