const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Muestra estadísticas del bot'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const uptime = process.uptime();
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle('📊 Estadísticas del Bot')
      .setColor(0x5865F2)
      .addFields(
        { name: '⏱️ Uptime', value: `\`${Math.floor(uptime)}s\``, inline: true },
        { name: '🧠 RAM usada', value: `\`${ram} MB\``, inline: true },
        { name: '💾 RAM total', value: `\`${totalRam} GB\``, inline: true },
        { name: '📡 Ping', value: `\`${client.ws.ping} ms\``, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};