process.env.FFMPEG_PATH = require('ffmpeg-static');

const { Events, ChannelType } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType
} = require('@discordjs/voice');

const play = require('play-dl');
const prism = require('prism-media');

// 🔥 CONFIG
const CHANNEL_ID = "1498877260592054312";
const YOUTUBE_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk";

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log("🎧 AFK 24/7 iniciado");

    let connection;
    const player = createAudioPlayer();

    async function connect() {
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);

        // 🔍 DEBUG
        console.log("Canal encontrado:", channel?.id, "Tipo:", channel?.type);

        if (!channel || channel.type !== ChannelType.GuildVoice) {
          console.log("❌ Canal inválido (no es de voz o no existe)");
          return;
        }

        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: true
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 15000);

        console.log("🔊 Conectado correctamente");
        connection.subscribe(player);

        // 🔁 Reconexión sólida
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          console.log("⚠️ Desconectado...");

          try {
            await entersState(connection, VoiceConnectionStatus.Connecting, 5000);
          } catch {
            console.log("🔁 Reconectando desde cero...");
            connection.destroy();
            setTimeout(connect, 3000);
          }
        });

      } catch (err) {
        console.log("❌ Error al conectar:", err.message);
        setTimeout(connect, 5000);
      }
    }

    async function playLive() {
      try {
        // 🔥 MÉTODO MÁS ESTABLE
        const stream = await play.stream(YOUTUBE_URL, {
          quality: 2
        });

        const ffmpeg = new prism.FFmpeg({
          args: [
            '-reconnect', '1',
            '-reconnect_streamed', '1',
            '-reconnect_delay_max', '5',
            '-i', stream.stream,
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2'
          ]
        });

        const resource = createAudioResource(ffmpeg, {
          inputType: StreamType.Raw,
          inlineVolume: true
        });

        resource.volume.setVolume(0.7);

        player.play(resource);

        console.log("🎧 Reproduciendo 24/7 OK");
      } catch (err) {
        console.log("❌ Error stream:", err.message);
        setTimeout(playLive, 7000);
      }
    }

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("🔄 Reiniciando stream...");
      setTimeout(playLive, 3000);
    });

    player.on('error', (err) => {
      console.log("❌ Player error:", err.message);
      setTimeout(playLive, 5000);
    });

    // 🚀 START
    await connect();
    await playLive();
  }
};