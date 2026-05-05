const moderation = require('./moderation');
const welcome = require('./welcome');
const music = require('./music');

module.exports = {
  moderation,
  welcome,
  music,

  async toggle(module, state, guildId) {
    if (this[module]) {
      return this[module].toggle(state, guildId);
    }
  }
};