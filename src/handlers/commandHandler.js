const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();

  const foldersPath = path.join(__dirname, '../commands');
  const folders = fs.readdirSync(foldersPath);

  for (const folder of folders) {
    const commandFiles = fs
      .readdirSync(path.join(foldersPath, folder))
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      
      if (!command.data || !command.execute) {
        console.log(`⚠️ Comando inválido: ${file}`);
        continue;
      }

      client.commands.set(command.data.name, command);
      console.log(`✅ Comando cargado: ${command.data.name}`);
    }
  }
};