const { ActivityType } = require("discord.js");

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✅ Bot listo como ${client.user.tag}`);

    const activities = [
      {
        name: 'Desarrollado por Josue155._ 🚀',
        type: ActivityType.Custom
      },
      {
        name: `👀 Viendo ${client.guilds.cache.size} servidores`,
        type: ActivityType.Watching
      },
      {
        name: "🎧 Escuchando música",
        type: ActivityType.Listening
      },
      {
        name: "🎮 Jugando Minecraft",
        type: ActivityType.Playing
      },
      {
        name: "🤖 Chat de IA",
        type: ActivityType.Playing
      },
      {
        name: "⚡ Moderando tu Servidor",
        type: ActivityType.Streaming
      }
    ];

    function updatePresence() {
      const random = activities[Math.floor(Math.random() * activities.length)];

      client.user.setPresence({
        status: "dnd", // 🔴 NO MOLESTAR FIJO
        activities: [random]
      });
    }

    // primera carga
    updatePresence();

    // rotación cada 60s
    setInterval(updatePresence, 60000);
  }
};