const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const configModules = require('../modules/config');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {

    // =========================
    // 📩 SLASH COMMANDS
    // =========================
    if (interaction.isChatInputCommand()) {

      const { commandName, user } = interaction;

      console.log(`📩 [${user.tag}] → /${commandName}`);

      const command = client.commands.get(commandName);

      if (!command) {
        console.warn(`⚠️ Comando no encontrado: ${commandName}`);
        return;
      }

      const start = Date.now();

      try {
        console.log('🚀 Ejecutando comando...');

        await command.execute(interaction, client);

        const time = Date.now() - start;
        console.log(`✅ /${commandName} ejecutado en ${time}ms`);

      } catch (error) {
        console.error(`💥 Error en /${commandName}:`, error);

        try {
          const payload = {
            content: '❌ Error ejecutando el comando',
            ephemeral: true
          };

          if (interaction.deferred) {
            await interaction.editReply(payload);
          } else if (interaction.replied) {
            await interaction.followUp(payload);
          } else {
            await interaction.reply(payload);
          }

        } catch (replyError) {
          console.error('❌ Error enviando respuesta de error:', replyError);
        }
      }

      return;
    }

    // =========================
    // 🧩 CONFIG MENU
    // =========================
    if (interaction.isStringSelectMenu()) {

      if (interaction.customId === 'config_menu') {

        const value = interaction.values[0];

        let embed = new EmbedBuilder().setColor('#2b2d31');

        if (value === 'moderation') {
          embed
            .setTitle('🛡️ Moderación')
            .setDescription('Configuración del sistema de moderación.');
        }

        if (value === 'welcome') {
          embed
            .setTitle('👋 Bienvenidas')
            .setDescription('Configuración de mensajes de bienvenida.');
        }

        if (value === 'music') {
          embed
            .setTitle('🎵 Música')
            .setDescription('Configuración del sistema de música.');
        }

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`toggle_${value}_on`)
            .setLabel('Activar')
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId(`toggle_${value}_off`)
            .setLabel('Desactivar')
            .setStyle(ButtonStyle.Danger),

          // 🔙 BOTÓN PROBOT STYLE
          new ButtonBuilder()
            .setCustomId('config_back')
            .setLabel('Volver')
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({
          embeds: [embed],
          components: [buttons]
        });
      }
    }

    // =========================
    // 🔘 BOTONES (TOGGLES + BACK)
    // =========================
    if (interaction.isButton()) {

      const id = interaction.customId;

      // =========================
      // 🔁 BACK TO MENU (PROBOT UX)
      // =========================
      if (id === 'config_back') {

        const embed = new EmbedBuilder()
          .setTitle('⚙️ Panel de Configuración')
          .setDescription(`
Selecciona una categoría:

🛡️ Moderación  
👋 Bienvenidas  
🎵 Música
          `)
          .setColor('#5865F2');

        const menu = new ActionRowBuilder().addComponents(
          new require('discord.js').StringSelectMenuBuilder()
            .setCustomId('config_menu')
            .setPlaceholder('Selecciona una opción')
            .addOptions([
              { label: 'Moderación', value: 'moderation', emoji: '🛡️' },
              { label: 'Bienvenidas', value: 'welcome', emoji: '👋' },
              { label: 'Música', value: 'music', emoji: '🎵' }
            ])
        );

        return interaction.update({
          embeds: [embed],
          components: [menu]
        });
      }

      // =========================
      // 🔘 TOGGLES
      // =========================
     if (id.startsWith('toggle_')) {

  const parts = id.split('_');
  const module = parts[1];
  const state = parts[2];

  const result = await configModules.toggle(
    module,
    state,
    interaction.guildId
  );

  return interaction.reply({
    content: `⚙️ **${result.module}** ahora está **${result.state.toUpperCase()}**`,
    ephemeral: true
  });
}
    }
  }
};