// music/queue.js
const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      connection: null,
      player: null,
      songs: [],
      playing: false
    });
  }
  return queues.get(guildId);
}

module.exports = { getQueue };