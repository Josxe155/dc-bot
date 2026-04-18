const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Muestra la latencia del bot'),

  async execute(interaction, client) {
    const start = Date.now();

    await interaction.deferReply();

    const end = Date.now();

    const apiLatency = client.ws.ping;
    const responseTime = end - start;

    const status =
      apiLatency < 100 ? '🟢 Excelente' :
      apiLatency < 200 ? '🟡 Normal' :
      '🔴 Lento';

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x00AE86)
      .addFields(
        { name: '📡 Latencia API', value: `\`${apiLatency} ms\``, inline: true },
        { name: '⚡ Tiempo de respuesta', value: `\`${responseTime} ms\``, inline: true },
        { name: '📊 Estado', value: status, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
