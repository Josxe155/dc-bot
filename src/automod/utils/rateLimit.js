const cache = new Map();

module.exports = (userId, limit = 5, interval = 5000) => {
  const now = Date.now();

  if (!cache.has(userId)) {
    cache.set(userId, []);
  }

  const timestamps = cache.get(userId);

  timestamps.push(now);

  const filtered = timestamps.filter(t => now - t < interval);
  cache.set(userId, filtered);

  return {
    exceeded: filtered.length >= limit,
    count: filtered.length
  };
};