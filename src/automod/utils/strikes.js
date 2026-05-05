const memory = require('../../modules/memory/firebaseMemory');

module.exports = async (message, reason) => {
  const userId = message.author.id;

  let userData = await memory.getUser(userId);
  userData.strikes = (userData.strikes || 0) + 1;

  await memory.saveUser(userId, userData);

  // castigos progresivos
  if (userData.strikes === 3) {
    await message.member.timeout(60 * 1000, reason).catch(() => {});
  }

  if (userData.strikes === 5) {
    await message.member.kick(reason).catch(() => {});
  }

  if (userData.strikes >= 7) {
    await message.member.ban({ reason }).catch(() => {});
  }
};