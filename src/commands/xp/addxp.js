const { db } = require('../../config/firebase');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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

    const userRef = db.collection('users').doc(user.id);
    const doc = await userRef.get();

    const data = doc.exists ? (doc.data() || {}) : {};

    // 🛡️ FIX ANTI NaN
    const currentXP = Number(data.xp);
    const currentLevel = Number(data.level);

    const safeXP = isNaN(currentXP) ? 0 : currentXP;
    const safeLevel = isNaN(currentLevel) ? 0 : currentLevel;

    const addXP = Number(xpToAdd);

    const newXP = safeXP + (isNaN(addXP) ? 0 : addXP);
    const newLevel = Math.floor(newXP / 100);

    await userRef.set({
      xp: newXP,
      level: newLevel,
      updatedAt: Date.now()
    }, { merge: true });

    return interaction.reply(
      `✅ Se añadieron **${addXP} XP** a <@${user.id}>`
    );
  }
};