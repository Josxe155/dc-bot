const { SlashCommandBuilder } = require('discord.js');
const db = require('../../config/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('🎂 Sistema de cumpleaños')
    .addSubcommand(s =>
      s.setName('set')
        .setDescription('Guardar tu cumpleaños')
        .addStringOption(o =>
          o.setName('fecha')
            .setDescription('Formato DD-MM (ej: 05-12)')
            .setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName('edit')
        .setDescription('Editar tu cumpleaños')
        .addStringOption(o =>
          o.setName('fecha')
            .setDescription('Formato DD-MM')
            .setRequired(true)
        )
    )
    .addSubcommand(s =>
      s.setName('remove')
        .setDescription('Eliminar tu cumpleaños')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === 'set' || sub === 'edit') {
      const fecha = interaction.options.getString('fecha');
      await db.ref(`birthdays/${userId}`).set(fecha);

      return interaction.reply({
        content: `🎂 Tu cumpleaños fue guardado como **${fecha}**`,
        ephemeral: true
      });
    }

    if (sub === 'remove') {
      await db.ref(`birthdays/${userId}`).remove();

      return interaction.reply({
        content: `🗑️ Tu cumpleaños fue eliminado`,
        ephemeral: true
      });
    }
  }
};