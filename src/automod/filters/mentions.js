const addStrike = require('../utils/strikes');

module.exports = async (message) => {
  if (message.mentions.users.size > 4) {
    await message.delete().catch(() => {});
    await addStrike(message, "Demasiadas menciones");
  }
};