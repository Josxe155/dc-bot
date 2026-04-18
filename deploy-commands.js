require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];

// 📂 Ruta base
const foldersPath = path.join(__dirname, 'src/commands');

// 🔍 Leer subcarpetas
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);

  // ⚠️ evitar errores si no es carpeta
  if (!fs.lstatSync(commandsPath).isDirectory()) continue;

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);

      if (!command.data || !command.execute) {
        console.log(`⚠️ Comando inválido: ${file}`);
        continue;
      }

      commands.push(command.data.toJSON());
      console.log(`✅ Cargado: ${command.data.name}`);
    } catch (err) {
      console.log(`❌ Error cargando ${file}:`, err.message);
    }
  }
}

// 🔐 Validaciones importantes
if (!process.env.TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ Faltan variables de entorno (TOKEN / CLIENT_ID)');
  process.exit(1);
}

// ⚙️ REST
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 🚀 Deploy
(async () => {
  try {
    console.log('\n🔄 Iniciando registro de slash commands...\n');

    // 🧠 GLOBAL (puede tardar hasta 1h en actualizar)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`\n🌍 ${commands.length} comandos globales registrados`);

    // ⚡ OPCIONAL: GUILD (instantáneo para testing)
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );

      console.log(`⚡ Comandos registrados en guild (modo dev)`);
    }

  } catch (error) {
    console.error('\n❌ Error registrando comandos:\n', error);
  }
})();