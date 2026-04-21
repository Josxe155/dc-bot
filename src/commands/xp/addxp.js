const db = require('../../config/firebase');
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

    let data = { xp: 0, level: 0 };
    if (doc.exists) data = doc.data();

    const newXP = data.xp + xpToAdd;
    const newLevel = Math.floor(newXP / 100);

    await userRef.set({
      xp: newXP,
      level: newLevel,
      updatedAt: Date.now()
    }, { merge: true });

    return interaction.reply(`✅ Se añadieron **${xpToAdd} XP** a <@${user.id}>`);
  }
};