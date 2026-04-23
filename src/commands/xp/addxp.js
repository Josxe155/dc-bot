const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { rtdb } = require('../../config/firebase');

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

    const ref = rtdb.ref(`users/${user.id}/stats`);
    const snap = await ref.get();

    let stats = snap.val();

    if (!stats) {
      stats = {
        xp: 0,
        level: 0,
        lastMessageAt: 0
      };
    }

    // 🔥 sumar XP directamente
    const newXP = (stats.xp || 0) + xpToAdd;
    const newLevel = Math.floor(newXP / 100);

    await ref.set({
      xp: newXP,
      level: newLevel,
      lastMessageAt: stats.lastMessageAt || Date.now()
    });

    return interaction.reply({
      content: `✅ Se añadieron **${xpToAdd} XP** a <@${user.id}>`,
      ephemeral: true
    });
  }
};