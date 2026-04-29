const { Events } = require('discord.js');
const {
  countingData,
  getNextNumber,
  increment,
  reset
} = require('./countingState');

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    if (message.channel.id !== countingData.channelId) return;

    const content = message.content.trim();
    const number = parseInt(content);

    // ❌ No es número
    if (isNaN(number)) {
      await message.react("❌").catch(() => {});
      setTimeout(() => message.delete().catch(() => {}), 1500);
      return;
    }

    const expected = getNextNumber();

    // ✅ Correcto
    if (number === expected) {
      increment();
      await message.react("✅").catch(() => {});
      return;
    }

    // ❌ Incorrecto
    await message.react("❌").catch(() => {});
    setTimeout(() => message.delete().catch(() => {}), 1500);

    reset();
    await message.channel.send("❌ Número incorrecto. El conteo se reinicia a **1**");
  }
};