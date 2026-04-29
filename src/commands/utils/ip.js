const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ip')
    .setDescription('Muestra la IP y puerto del servidor'),

  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#00ffaa')
        .setTitle('🌐・Conexión al Servidor')
        .setDescription('🚀 **Copia la IP y entra a jugar**')
        .addFields(
          {
            name: '🖥️・Java Edition',
            value: '```nexusmc.servegame.net:24729```',
            inline: true
          },
          {
            name: '📱・Bedrock Edition',
            value: '```nexusmc.servegame.net```\nPuerto: `24729`',
            inline: true
          },
          {
            name: '🧩・Versiones',
            value: 'Compatible desde **1.8 → 1.21.11+** ⚡',
            inline: false
          },
          {
            name: '📡・Estado',
            value: '🟢 Online 24/7',
            inline: false
          }
        )
        .setFooter({ text: 'Java & Bedrock compatibles 🎮' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error al mostrar la IP', ephemeral: true });
    }
  }
};