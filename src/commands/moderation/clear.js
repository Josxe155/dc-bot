const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Elimina mensajes')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de mensajes')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('cantidad');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '❌ Debe ser entre 1 y 100',
        ephemeral: true
      });
    }

    await interaction.channel.bulkDelete(amount, true);

    interaction.reply({
      content: `🧹 ${amount} mensajes eliminados`,
      ephemeral: true
    });
  }
};