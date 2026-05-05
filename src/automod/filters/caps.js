const addStrike = require('../utils/strikes');

module.exports = async (message) => {
  const content = message.content;
  if (!content) return;

  const isCaps = content === content.toUpperCase();
  const length = content.length;

  if (isCaps && length > 8) {
    await message.delete().catch(() => {});

    await message.channel.send({
      content: `⚠️ ${message.author}, evita usar mayúsculas.`,
    });

    await addStrike(message, "Uso excesivo de mayúsculas");
  }
};