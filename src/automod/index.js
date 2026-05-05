const { getConfig } = require('../config/guildConfig');

module.exports = async (message) => {
  if (!message.guild) return;

  const config = await getConfig(message.guild.id);

  if (config.automod.spam.enabled) await spam(message, config);
  if (config.automod.caps.enabled) await caps(message, config);
  if (config.automod.links.enabled) await links(message, config);
  if (config.automod.mentions.enabled) await mentions(message, config);
};