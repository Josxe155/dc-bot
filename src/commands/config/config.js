const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Panel de configuración del servidor'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Panel de Configuración')
      .setDescription(`
🧩 Bienvenido al panel tipo ProBot

Selecciona una categoría para configurar el sistema del servidor:

🛡️ Moderación
👋 Bienvenidas
🎵 Música
      `)
      .setColor('#5865F2')
      .setFooter({ text: `Servidor: ${interaction.guild.name}` });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('config_main')
      .setPlaceholder('Selecciona una categoría')
      .addOptions([
        {
          label: 'Moderación',
          description: 'Sistema de moderación avanzado',
          value: 'moderation',
          emoji: '🛡️'
        },
        {
          label: 'Bienvenidas',
          description: 'Mensajes de bienvenida',
          value: 'welcome',
          emoji: '👋'
        },
        {
          label: 'Música',
          description: 'Sistema de música',
          value: 'music',
          emoji: '🎵'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};