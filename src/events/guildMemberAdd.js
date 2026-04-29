const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    try {
      // 📌 Canal de bienvenida (pon tu ID)
      const channelId = '1494120329084276871';
      const channel = await member.guild.channels.fetch(channelId);

      if (!channel) return;

      // 🎨 Crear embed
      const embed = new EmbedBuilder()
        .setTitle('🎉 Nuevo miembro!')
        .setDescription(`👋 Bienvenido ${member} a **${member.guild.name}**`)
        .setColor('#00C3FF')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '📜 Reglas', value: 'Lee <#1494120329084276872>', inline: true },
          { name: '💬 Chat', value: 'Habla en <#1494120329252179986>', inline: true }
        )
        .setFooter({ text: `Miembro #${member.guild.memberCount}` })
        .setTimestamp();

      // 🚀 Enviar mensaje
      await channel.send({
        content: `✨ Bienvenido ${member}`,
        embeds: [embed]
      });

    } catch (err) {
      console.error('❌ Error en welcome:', err);
    }
  }
};