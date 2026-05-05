const cache = new Map();

module.exports = (userId, cooldownMs) => {
  const now = Date.now();

  if (cache.has(userId)) {
    const last = cache.get(userId);

    if (now - last < cooldownMs) {
      return false; // en cooldown
    }
  }

  cache.set(userId, now);
  return true;
};