require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const loadEvents = require('./src/handlers/eventHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message
  ]
});

// =========================
// 📦 COMMAND LOADER
// =========================
client.commands = new Map();

const commandsPath = path.join(__dirname, 'src', 'commands');

if (!fs.existsSync(commandsPath)) {
  console.log('⚠️ No existe la carpeta src/commands');
} else {
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(folderPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
        } else {
          console.log(`⚠️ Comando inválido: ${file}`);
        }
      } catch (err) {
        console.error(`❌ Error cargando comando ${file}:`, err);
      }
    }
  }

  console.log('📦 Comandos cargados');
}
// =========================
// 🔧 EVENTS
// =========================
try {
  loadEvents(client);
  console.log('✅ Events cargados');
} catch (err) {
  console.error('❌ Error cargando events:', err);
}

// =========================
// ⚡ INTERACTIONS (SLASH COMMANDS)
// =========================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.log('❌ Comando no encontrado:', interaction.commandName);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('❌ Error ejecutando comando:', err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Error ejecutando el comando',
        ephemeral: true
      });
    }
  }
});

// =========================
// 🚀 LOGIN
// =========================
client.login(process.env.TOKEN)
  .then(() => console.log('🤖 Bot conectado'))
  .catch(err => {
    console.error('❌ Error al logear:', err);
    process.exit(1);
  });

// =========================
// 🧯 ERRORES GLOBALES
// =========================
process.on('unhandledRejection', (error) => {
  console.error('🧨 Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

// =========================
// ⚠️ CLIENT ERRORS
// =========================
client.on('error', (error) => {
  console.error('❌ Discord Client Error:', error);
});

client.on('warn', (warn) => {
  console.warn('⚠️ Discord Warning:', warn);
});