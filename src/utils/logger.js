module.exports = async function log(client, content) {
  try {
    const channel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);

    if (!channel) return console.log("❌ Canal de logs no encontrado");

    await channel.send(`🧾 ${content}`);
  } catch (err) {
    console.error("❌ Error enviando log:", err.message);
  }
};