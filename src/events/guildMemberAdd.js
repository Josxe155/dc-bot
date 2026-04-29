const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    try {
      const channelId = '1494120329084276871';
      const channel = await member.guild.channels.fetch(channelId);

      if (!channel) return;

      // 🎭 AUTO ROL
const roleId = '1494120328048410630'; // usuarios
const botRoleId = '1494120328048410629'; // bots

const targetRoleId = member.user.bot ? botRoleId : roleId;
const role = await member.guild.roles.fetch(targetRoleId);

if (!role) {
  console.log('❌ Rol no encontrado');
} else {
  await member.roles.add(role);
  console.log(`✅ Rol dado a ${member.user.tag}`);
}

      // 🎨 EMBED
      const embed = new EmbedBuilder()
        .setTitle('🎉 Nuevo miembro!')
        .setDescription(`👋 Bienvenido ${member} a **${member.guild.name}**`)
        .setColor('#00C3FF')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
  {
    name: '📜・Reglas',
    value: 'Revisa <#1494120329084276872> para evitar sanciones ⚠️',
    inline: true
  },
  {
    name: '💬・Chat',
    value: 'Únete a la conversación en <#1494120329252179986> 🗨️',
    inline: true
  },
  {
    name: '🎮・Servidor Minecraft',
    value: 'Tenemos servidor **Java & Bedrock 24/7** 🚀\nConéctate aquí: <#1496325402514428025>',
    inline: false
  }
)
        .setFooter({ text: `Ya somos ${member.guild.memberCount} miembros👥!` })
        .setTimestamp();

      await channel.send({
        content: `✨ Bienvenido ${member}`,
        embeds: [embed]
      });

    } catch (err) {
      console.error('❌ Error en welcome:', err);
    }
  }
};