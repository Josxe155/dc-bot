const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✅ Bot listo como ${client.user.tag}`);

    const updatePresence = () => {

      const ping = client.ws.ping;

      // 👥 total usuarios
      const users = client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      // 🌍 total servidores
      const servers = client.guilds.cache.size;

      // 🧠 Estados dinámicos según rendimiento
      let status = 'online'; // 🟢 online

      if (ping > 200) status = 'idle'; // 🌙 idle (lag medio)
      if (ping > 350) status = 'dnd';  // 🔴 dnd (lag alto)

      const activities = [
        {
          name: `👀 Vigilando ${users.toLocaleString()} usuarios`,
          type: ActivityType.Watching
        },
        {
          name: `🌍 Viendo ${servers} servidores`,
          type: ActivityType.Watching
        },
        {
          name: `🎧 /help`,
          type: ActivityType.Listening
        }
      ];

      const random = activities[Math.floor(Math.random() * activities.length)];

      client.user.setPresence({
        activities: [random],
        status: status // 👈 aquí entra tu sistema dinámico
      });

      console.log(`🔄 Presence → ${random.name} | Estado: ${status}`);
    };

    updatePresence();
    setInterval(updatePresence, 60000);
  }
};