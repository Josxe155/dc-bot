module.exports = {

  async toggle(state, guildId) {

    console.log(`👋 Welcome → ${state} en ${guildId}`);

    return {
      module: 'welcome',
      state
    };
  }
};