const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '../events');

  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    const event = require(filePath);

    if (!event.name || !event.execute) {
      console.log(`⚠️ Evento inválido: ${file}`);
      continue;
    }

    const wrapper = async (...args) => {
      try {
        await event.execute(...args, client);
      } catch (err) {
        console.error(`❌ Error en evento (${event.name}):`, err);
      }
    };

    if (event.once) {
      client.once(event.name, wrapper);
    } else {
      client.on(event.name, wrapper);
    }

    console.log(`✅ Evento cargado: ${event.name}`);
  }
};