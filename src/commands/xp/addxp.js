const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { rtdb } = require('../../config/firebase');

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

    const ref = rtdb.ref(`users/${user.id}/stats`);
    const snap = await ref.get();

    const stats = snap.val() || {
      xp: 0,
      level: 0,
      lastMessageAt: Date.now()
    };

    // 🔥 NUEVOS VALORES
    const oldXP = Number(stats.xp) || 0;
    const oldLevel = Number(stats.level) || 0;

    const newXP = oldXP + xpToAdd;
    const newLevel = Math.floor(newXP / 100);

    // 💾 guardar en RTDB
    await ref.update({
      xp: newXP,
      level: newLevel,
      lastMessageAt: Date.now()
    });

    // 🔥 LOG EN CONSOLA (DEBUG)
    console.log("━━━━━━━━━━━━━━━━━━");
    console.log("⚡ ADDXP EJECUTADO");
    console.log("👤 User:", user.id);
    console.log("📊 XP:", oldXP, "→", newXP);
    console.log("🏆 Level:", oldLevel, "→", newLevel);
    console.log("━━━━━━━━━━━━━━━━━━");

    // 🎉 LEVEL UP (MENSAJE SOLO AQUÍ)
    if (newLevel > oldLevel) {
      try {
        const channel = await interaction.client.channels.fetch(LEVEL_CHANNEL_ID).catch(() => null);

        if (channel?.isTextBased()) {
          await channel.send({
            content: `🎉 <@${user.id}> ha subido a nivel **${newLevel}** 🚀`
          });
        }
      } catch (err) {
        console.error("❌ Error enviando level up:", err);
      }
    }

    return interaction.reply({
      content: `✅ Se añadieron **${xpToAdd} XP** a <@${user.id}>`,
      ephemeral: true
    });
  }
};