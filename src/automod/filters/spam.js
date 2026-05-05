const cache = new Map();
const addStrike = require('../utils/strikes');

module.exports = async (message, config) => {
  const userId = message.author.id;

  if (!cache.has(userId)) {
    cache.set(userId, []);
  }

  const timestamps = cache.get(userId);
  const now = Date.now();

  timestamps.push(now);

  // ⏱ usar config
  const interval = config.automod.spam.interval;
  const max = config.automod.spam.maxMessages;

  const filtered = timestamps.filter(t => now - t < interval);
  cache.set(userId, filtered);

  if (filtered.length >= max) {
    await message.delete().catch(() => {});
    await addStrike(message, "Spam detectado");
  }
};