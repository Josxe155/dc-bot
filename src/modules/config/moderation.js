module.exports = {

  async toggle(state, guildId) {

    console.log(`🛡️ Moderation → ${state} en ${guildId}`);

    // 💾 FUTURO DB
    // await db.set(`${guildId}.moderation`, state);

    return {
      module: 'moderation',
      state
    };
  }
};