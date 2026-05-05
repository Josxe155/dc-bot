const { SlashCommandBuilder } = require('discord.js');
const { rtdb } = require('../../config/firebase');

function isValidDate(date) {
  // formato DD-MM
  return /^([0-2]\d|3[0-1])-(0\d|1[0-2])$/.test(date);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('🎂 Sistema de cumpleaños Nexus')
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
    )
    .addSubcommand(s =>
      s.setName('view')
        .setDescription('Ver tu cumpleaños guardado')
    ),

  async execute(interaction) {
    try {
      const sub = interaction.options.getSubcommand();
      const userId = interaction.user.id;

      const ref = db.ref(`birthdays/${userId}`);

      // =========================
      // ➕ SET / EDIT
      // =========================
      if (sub === 'set' || sub === 'edit') {
        const fecha = interaction.options.getString('fecha');

        if (!isValidDate(fecha)) {
          return interaction.reply({
            content: '❌ Formato inválido. Usa **DD-MM** (ej: 05-12)',
            ephemeral: true
          });
        }

        await ref.set(fecha);

        return interaction.reply({
          content: `🎂 Tu cumpleaños fue guardado como **${fecha}**`,
          ephemeral: true
        });
      }

      // =========================
      // 🗑 REMOVE
      // =========================
      if (sub === 'remove') {
        await ref.remove();

        return interaction.reply({
          content: '🗑️ Tu cumpleaños fue eliminado correctamente',
          ephemeral: true
        });
      }

      // =========================
      // 👀 VIEW
      // =========================
      if (sub === 'view') {
        const snap = await ref.get();
        const data = snap.val();

        if (!data) {
          return interaction.reply({
            content: '❌ No tienes cumpleaños registrado',
            ephemeral: true
          });
        }

        return interaction.reply({
          content: `🎂 Tu cumpleaños es: **${data}**`,
          ephemeral: true
        });
      }

    } catch (err) {
      console.error('🔥 Birthday command error:', err);

      return interaction.reply({
        content: '❌ Error interno en el sistema de cumpleaños',
        ephemeral: true
      });
    }
  }
};