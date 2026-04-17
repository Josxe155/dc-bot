const play = require('play-dl');

const queue = new Map();

async function playSong(guildId, song, connection, resource, player) {
  const stream = await play.stream(song.url);

  resource = stream.stream;
  player.play(resource);

  player.on('idle', () => {
    const serverQueue = queue.get(guildId);
    if (!serverQueue) return;

    serverQueue.songs.shift();
    if (serverQueue.songs.length > 0) {
      playSong(guildId, serverQueue.songs[0], connection, resource, player);
    } else {
      connection.destroy();
      queue.delete(guildId);
    }
  });
}

module.exports = { queue, playSong };