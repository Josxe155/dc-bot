module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {

    // ❌ Ignorar lo que no sea slash command
    if (!interaction.isChatInputCommand()) return;

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

      // ⚡ ejecutar comando
      await command.execute(interaction, client);

      const time = Date.now() - start;
      console.log(`✅ /${commandName} ejecutado en ${time}ms`);

    } catch (error) {
      console.error(`💥 Error en /${commandName}:`, error);

      // 🧠 Manejo inteligente de respuestas
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
  }
};