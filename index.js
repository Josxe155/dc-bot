require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

// =========================
// 🔧 VALIDACIÓN DE ENV
// =========================
if (!process.env.TOKEN) {
  console.error('❌ TOKEN no definido en .env');
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.warn('⚠️ CLIENT_ID no definido (deploy puede fallar)');
}

// =========================
// 🤖 CLIENT SETUP
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // 👈 necesario para usuarios
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

// =========================
// 📦 COLECCIONES GLOBALES
// =========================
client.commands = new Collection();
client.cooldowns = new Collection();

// =========================
// 📦 COMMAND LOADER (PRO)
// =========================
const loadCommands = () => {
  const commandsPath = path.join(__dirname, 'src', 'commands');

  if (!fs.existsSync(commandsPath)) {
    console.warn('⚠️ No existe src/commands');
    return;
  }

  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);

    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      try {
        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        if (!command.data || !command.execute) {
          console.warn(`⚠️ Comando inválido: ${file}`);
          continue;
        }

        client.commands.set(command.data.name, command);
        console.log(`✅ Comando cargado: ${command.data.name}`);

      } catch (err) {
        console.error(`❌ Error cargando ${file}:`, err);
      }
    }
  }

  console.log(`📦 Total comandos: ${client.commands.size}`);
};

// =========================
// 🔧 EVENT LOADER (PRO)
// =========================
const loadEvents = () => {
  const eventsPath = path.join(__dirname, 'src', 'events');

  if (!fs.existsSync(eventsPath)) {
    console.warn('⚠️ No existe src/events');
    return;
  }

  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(eventsPath, file);

    try {
      delete require.cache[require.resolve(filePath)];

      const event = require(filePath);

      if (!event.name || !event.execute) {
        console.warn(`⚠️ Evento inválido: ${file}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`✅ Evento cargado: ${event.name}`);

    } catch (err) {
      console.error(`❌ Error cargando evento ${file}:`, err);
    }
  }

  console.log(`📦 Eventos cargados`);
};

// =========================
// 🧠 UTILIDADES
// =========================
client.utils = {
  formatTime: (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
};

// =========================
// 🚀 INIT
// =========================
const init = async () => {
  console.log('🚀 Iniciando Nexus Bot...');

  loadCommands();
  loadEvents();

  try {
    await client.login(process.env.TOKEN);
    console.log('🤖 Bot conectado correctamente');
  } catch (err) {
    console.error('❌ Error al conectar:', err);
    process.exit(1);
  }
};

// =========================
// 🧯 ERRORES GLOBALES
// =========================
process.on('unhandledRejection', (err) => {
  console.error('🧨 Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

// =========================
// ⚠️ CLIENT DEBUG
// =========================
client.on('error', (err) => {
  console.error('❌ Discord Client Error:', err);
});

client.on('warn', (warn) => {
  console.warn('⚠️ Discord Warning:', warn);
  
  console.log({
  project: process.env.FIREBASE_PROJECT_ID,
  email: process.env.FIREBASE_CLIENT_EMAIL,
  key: process.env.FIREBASE_PRIVATE_KEY ? "OK" : "MISSING"
});
});

// =========================
// 🚀 START BOT
// =========================
init();