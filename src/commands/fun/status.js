const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Estado general del bot'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const servers = client.guilds.cache.size;
    const users = client.users.cache.size;
    const ping = client.ws.ping;

    const status =
      ping < 100 ? '🟢 Estable' :
      ping < 200 ? '🟡 Moderado' :
      '🔴 Inestable';

    const embed = new EmbedBuilder()
      .setTitle('🟢 Estado del Bot')
      .setColor(0x57F287)
      .addFields(
        { name: '🌍 Servidores', value: `\`${servers}\``, inline: true },
        { name: '👥 Usuarios', value: `\`${users}\``, inline: true },
        { name: '📡 Ping', value: `\`${ping} ms\``, inline: true },
        { name: '📊 Estado', value: status, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};