const usage = new Map();

// límites por día
const LIMITS = {
  low: 20,
  medium: 50,
  high: 100,
};

function getLevel(count) {
  if (count <= LIMITS.low) return 'low';
  if (count <= LIMITS.medium) return 'medium';
  if (count <= LIMITS.high) return 'high';
  return 'blocked';
}

async function check(userId) {
  const today = new Date().toDateString();

  let data = usage.get(userId);

  if (!data || data.date !== today) {
    data = { count: 0, date: today };
  }

  data.count++;

  usage.set(userId, data);

  const level = getLevel(data.count);

  return {
    count: data.count,
    level,
    blocked: level === 'blocked',
  };
}

module.exports = {
  check,
};