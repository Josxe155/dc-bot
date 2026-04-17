const { Groq } = require('groq-sdk');

const softLimit = require('../limits/softLimit'); 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🧠 Modelo principal
const MODEL = "llama-3.3-70b-versatile";

// 🎭 Personalidad del sistema
const SYSTEM_PROMPT = `
Eres Nexus, una inteligencia artificial integrada en un bot de Discord.

Reglas:
- Responde en español claro y natural
- Sé directo y útil
- No inventes datos
- No seas excesivamente largo
- Usa emojis moderadamente
- Si no sabes algo, dilo claramente
`;

// ================================
// 🧠 MEMORIA LOCAL SIMPLE
// ================================
const memory = new Map();

async function getMemory(userId) {
  return memory.get(userId) || [];
}

async function saveMemory(userId, messages) {
  memory.set(userId, messages.slice(-10)); // límite simple
}

async function saveMemory(userId, messages) {
  const limited = messages.slice(-12);

  try {
    if (firestore?.saveMessage) {
      const last = limited[limited.length - 1];
      if (last) await firestore.saveMessage(userId, last);
      return;
    }
  } catch (e) {
    console.warn("Firestore no disponible, usando memoria local");
  }

  memory.set(userId, limited);
}

// ================================
// 🤖 FUNCIÓN PRINCIPAL IA
// ================================
async function askNexus(userId, userMessage) {
  try {
    // 🧠 obtener historial
    const history = await getMemory(userId);

    // construir mensajes
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage }
    ];

    // ⚡ llamada a Groq
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const text =
      response?.choices?.[0]?.message?.content?.trim()
      || "No se pudo generar respuesta.";

    // 🧠 actualizar memoria
    const updatedHistory = [
      ...history,
      { role: "user", content: userMessage },
      { role: "assistant", content: text }
    ];

    await saveMemory(userId, updatedHistory);

    return text;

  } catch (error) {
    console.error("❌ NEXUS AI ERROR:", error);
    return "❌ Error interno del sistema de IA.";
  }
}

module.exports = {
  askNexus
};