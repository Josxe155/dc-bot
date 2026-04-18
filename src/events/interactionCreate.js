module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    if (!interaction.isChatInputCommand()) return;

    console.log(`📩 Comando recibido: ${interaction.commandName}`);

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.log('❌ Comando no encontrado');
      return;
    }

    try {
      console.log('🚀 Ejecutando...');
      await command.execute(interaction, client);
      console.log('✅ Ejecutado');
    } catch (error) {
      console.error('💥 Error:', error);

      // ⚠️ manejo correcto del reply
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ Error ejecutando el comando',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ Error ejecutando el comando',
          ephemeral: true
        });
      }
    }
  }
};