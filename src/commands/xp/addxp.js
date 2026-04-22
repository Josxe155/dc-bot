const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const memory = require('../../modules/memory/firebaseMemory');

const LEVEL_CHANNEL_ID = "1496236194109849670";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Dar XP a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('xp')
        .setDescription('Cantidad de XP')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const xpToAdd = interaction.options.getInteger('xp');

    // 🧠 asegurar usuario
    let userData = await memory.getUser(user.id);
    if (!userData) {
      await memory.createUser(user);
      userData = await memory.getUser(user.id);
    }

    const oldLevel = Number(userData?.stats?.level) || 0;

    // 🔥 usar tu sistema REAL
    const result = await memory.addXP(user.id, xpToAdd);

    const newLevel = result.level;

    // 🎉 LEVEL UP
    if (newLevel > oldLevel) {
      try {
        const channel = await interaction.client.channels.fetch(LEVEL_CHANNEL_ID);

        if (channel) {
          await channel.send(
            `🎉 <@${user.id}> ha subido a **nivel ${newLevel}** 🚀`
          );
        }
      } catch (err) {
        console.error("LEVEL UP CHANNEL ERROR:", err);
      }
    }

    return interaction.reply(
      `✅ Se añadieron **${xpToAdd} XP** a <@${user.id}>`
    );
  }
};