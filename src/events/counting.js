const { Events } = require('discord.js');

// 🔥 CONFIG
const CHANNEL_ID = "1494120329444855888"; // cambia esto
let currentNumber = 0;

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;

    const content = message.content.trim();

    // ❌ No es número puro
    if (!/^\d+$/.test(content)) {
      await message.react("❌").catch(() => {});
      setTimeout(() => message.delete().catch(() => {}), 1500);
      return;
    }

    const number = Number(content);
    const expected = currentNumber + 1;

    // ✅ Correcto
    if (number === expected) {
      currentNumber++;
      await message.react("✅").catch(() => {});
      return;
    }

    // ❌ Incorrecto
    await message.react("❌").catch(() => {});
    setTimeout(() => message.delete().catch(() => {}), 1500);

    currentNumber = 0;

    const msg = await message.channel.send(
      "❌ Número incorrecto. El conteo se reinicia a **1**"
    );

    setTimeout(() => msg.delete().catch(() => {}), 3000);
  }
};