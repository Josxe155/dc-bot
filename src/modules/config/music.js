module.exports = {

  async toggle(state, guildId) {

    console.log(`🎵 Music → ${state} en ${guildId}`);

    return {
      module: 'music',
      state
    };
  }
};