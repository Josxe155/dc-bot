const { Events, ChannelType } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');

const play = require('play-dl');

// 🔥 CONFIG
const CHANNEL_ID = "1494120329810022531";
const YOUTUBE_URL = "https://www.youtube.com/live/mKCieTImjvU";

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log("🎧 Sistema AFK 24/7 iniciado");

    let connection;
    const player = createAudioPlayer();

    async function connect() {
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel || channel.type !== ChannelType.GuildVoice) {
        console.log("❌ Canal inválido");
        return;
      }

      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      console.log("🔊 Conectado al canal AFK");

      // 🔁 Reconexión si se cae
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        console.log("⚠️ Desconectado, intentando reconectar...");

        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5000),
          ]);

          console.log("🔁 Reconectado correctamente");
        } catch {
          console.log("❌ No se pudo reconectar, reiniciando conexión...");
          connect();
        }
      });

      connection.subscribe(player);
    }

    async function playLive() {
      try {
        const stream = await play.stream(YOUTUBE_URL);

        const resource = createAudioResource(stream.stream, {
          inputType: stream.type,
        });

        player.play(resource);
        console.log("🎧 Reproduciendo live...");
      } catch (err) {
        console.log("❌ Error en stream, reintentando...");
        setTimeout(playLive, 5000);
      }
    }

    // 🔁 Si el stream se detiene
    player.on(AudioPlayerStatus.Idle, () => {
      console.log("🔄 Stream detenido, reiniciando...");
      setTimeout(playLive, 3000);
    });

    // 🚀 INICIO
    await connect();
    await playLive();
  }
};