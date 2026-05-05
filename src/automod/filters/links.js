const addStrike = require('../utils/strikes');

const allowed = ["youtube.com", "discord.com"];

module.exports = async (message) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  const links = message.content.match(regex);

  if (!links) return;

  const allowedLink = allowed.some(domain =>
    message.content.includes(domain)
  );

  if (!allowedLink) {
    await message.delete().catch(() => {});

    await addStrike(message, "Enlace no permitido");
  }
};