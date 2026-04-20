const { EmbedBuilder } = require('discord.js');

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

// anti-spam
const cooldowns = new Map();
const COOLDOWN = 5000;

function canSend(key) {
  const now = Date.now();
  const last = cooldowns.get(key) || 0;

  if (now - last < COOLDOWN) return false;

  cooldowns.set(key, now);
  return true;
}

function cut(text, max = 1800) {
  if (!text) return 'Sin detalles';
  return String(text).slice(0, max);
}

module.exports = {
  error: async (client, msg, err = null, ctx = {}) => {
    try {
      console.error(`❌ ${msg}`);
      if (err) console.error(err.stack || err);

      // 🔒 HARD FILTER (CLAVE)
      const NEXUS_GUILD_ID = process.env.NEXUS_GUILD_ID;

      if (ctx.guild && ctx.guild.id !== NEXUS_GUILD_ID) {
        return; // 🚫 NO logs de otros servers
      }

      if (!client || !LOG_CHANNEL_ID) return;

      const key = msg;
      if (!canSend(key)) return;

      const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🚨 Error del Bot')
        .addFields(
          { name: '📍 Mensaje', value: cut(msg) },
          { name: '👤 Usuario', value: ctx.user?.tag || 'N/A', inline: true },
          { name: '🌍 Servidor', value: ctx.guild?.name || 'DM', inline: true },
          { name: '💬 Canal', value: ctx.channel?.name || 'DM', inline: true },
          {
            name: '🧠 Error',
            value: `\`\`\`\n${cut(err?.stack || err?.message)}\n\`\`\``
          }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });

    } catch (e) {
      console.error('❌ Logger interno falló:', e.message);
    }
  }
};