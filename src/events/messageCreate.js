const { askNexus } = require('../modules/ai/nexusAI');

// 🔥 función PRO para dividir mensajes
function splitMessage(text, maxLength = 1900) {
  const chunks = [];

  while (text.length > maxLength) {
    let slice = text.slice(0, maxLength);

    const lastBreak = Math.max(
      slice.lastIndexOf("\n"),
      slice.lastIndexOf(". "),
      slice.lastIndexOf(" ")
    );

    if (lastBreak > 0) {
      slice = slice.slice(0, lastBreak + 1);
    }

    chunks.push(slice.trim());
    text = text.slice(slice.length);
  }

  if (text.length > 0) chunks.push(text.trim());

  return chunks;
}

// ⏱️ anti-spam simple
const cooldown = new Map();
function isOnCooldown(userId) {
  const now = Date.now();
  const last = cooldown.get(userId) || 0;

  if (now - last < 3000) return true;

  cooldown.set(userId, now);
  return false;
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const isDM = !message.guild;
    const isMentioned = message.mentions.has(message.client.user);

    // 🔥 detectar "Nexus,"
    const startsWithNexus = /^nexus[\s,:-]/i.test(message.content);

    const shouldRespond = isMentioned || startsWithNexus;

    // =========================
    // 🧠 SERVIDORES
    // =========================
    if (message.guild && shouldRespond) {

      if (isOnCooldown(message.author.id)) return;

      let userInput = message.content;

      // limpiar mención
      userInput = userInput.replace(
        new RegExp(`<@!?${message.client.user.id}>`, "g"),
        ""
      );

      // limpiar "nexus"
      userInput = userInput.replace(/^nexus[\s,:-]*/i, "").trim();

      if (!userInput) {
        const respuestas = [
          "¿Qué necesitas? 🧐",
          "Te escucho 👀",
          "Dime 🤔",
          "Aquí estoy 👋"
        ];

        return message.reply(
          respuestas[Math.floor(Math.random() * respuestas.length)]
        );
      }

      try {
        await message.channel.sendTyping();

        const respuesta = await askNexus(message.author.id, userInput);

        if (!respuesta || typeof respuesta !== "string") {
          return message.reply("❌ No hubo respuesta válida.");
        }

        const partes = splitMessage(respuesta);

        await message.reply(partes[0]);

        for (let i = 1; i < partes.length; i++) {
          await message.channel.send(partes[i]);
        }

      } catch (error) {
        console.error("❌ ERROR IA MENCIÓN:", error);
        message.reply("❌ Error en la IA.");
      }
    }

    // =========================
    // 💬 MD
    // =========================
    if (isDM) {
      try {
        const respuesta = await askNexus(message.author.id, message.content);

        if (!respuesta || typeof respuesta !== "string") {
          return message.reply("❌ Error en la respuesta.");
        }

        const partes = splitMessage(respuesta);

        await message.reply(partes[0]);

        for (let i = 1; i < partes.length; i++) {
          await message.channel.send(partes[i]);
        }

      } catch (err) {
        console.error("❌ ERROR IA MD:", err);
        message.reply("❌ Error en la IA.");
      }
    }
  }
};