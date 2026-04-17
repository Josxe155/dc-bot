const play = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { queue, playSong } = require('../../music/player');

module.exports = {
  data: {
    name: 'play'
  },

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('❌ Entra a un canal de voz primero');
    }

    await interaction.deferReply();

    const result = await play.search(query, { limit: 1 });
    const song = {
      title: result[0].title,
      url: result[0].url
    };

    let serverQueue = queue.get(interaction.guild.id);

    if (!serverQueue) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });

      const player = createAudioPlayer();

      serverQueue = {
        connection,
        player,
        songs: []
      };

      queue.set(interaction.guild.id, serverQueue);
    }

    serverQueue.songs.push(song);

    if (serverQueue.songs.length === 1) {
      playSong(
        interaction.guild.id,
        song,
        serverQueue.connection,
        null,
        serverQueue.player
      );
    }

    interaction.editReply(`🎧 Reproduciendo: **${song.title}**`);
  }
};