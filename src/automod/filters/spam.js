const cache = new Map();
const addStrike = require('../utils/strikes');

module.exports = async (message) => {
  const userId = message.author.id;

  if (!cache.has(userId)) {
    cache.set(userId, []);
  }

  const timestamps = cache.get(userId);
  const now = Date.now();

  timestamps.push(now);

  const recent = timestamps.filter(t => now - t < 5000);
  cache.set(userId, recent);

  if (recent.length > 5) {
    await message.delete().catch(() => {});
    await addStrike(message, "Spam");
  }
};