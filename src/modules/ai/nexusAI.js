const Groq = require("groq-sdk");
const softLimit = require("../limits/softLimit");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

// 🎭 PERSONALIDAD MEJORADA PARA VOZ
const SYSTEM_PROMPT = `
Eres Nexus, una inteligencia artificial en Discord.

Reglas:
- Responde en español natural y conversacional
- Frases cortas (ideal para voz)
- No uses markdown ni formato extraño
- No uses listas largas
- Sé claro, útil y directo
- Usa emojis solo si aportan emoción
- Si no sabes algo, dilo honestamente
`;

// ================================
// 🧠 MEMORIA
// ================================
const memory = new Map();

function getMemory(userId) {
  return memory.get(userId) || [];
}

function saveMemory(userId, messages) {
  const clean = messages
    .filter(m => m && m.content)
    .slice(-12);

  memory.set(userId, clean);
}

// ================================
// 🔊 LIMPIAR TEXTO PARA VOZ
// ================================
function cleanForSpeech(text) {
  return text
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/#/g, "")
    .replace(/[_~]/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🤖 FUNCIÓN PRINCIPAL
// ================================
async function askNexus(userId, userMessage) {
  try {
    const limitState = softLimit.check(userId);

    if (limitState.blocked) {
      return "Has alcanzado el límite temporal, intenta más tarde.";
    }

    const history = getMemory(userId);

    const safeHistory = history.slice(-10);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...safeHistory,
      { role: "user", content: userMessage }
    ];

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: limitState.reduced ? 150 : 350
    });

    let text =
      response?.choices?.[0]?.message?.content?.trim()
      || "No pude generar respuesta.";

    // ⚠️ límite Discord
    if (text.length > 1900) {
      text = text.slice(0, 1900) + "…";
    }

    // 🔊 preparar versión voz
    const speechText = cleanForSpeech(text);

    // 🧠 guardar memoria
    saveMemory(userId, [
      ...safeHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: text }
    ]);

    return {
      text,
      speechText // 👈 IMPORTANTE para gTTS
    };

  } catch (error) {
    console.error("❌ NEXUS AI ERROR:", error);
    return {
      text: "Error interno del sistema de IA.",
      speechText: "Error interno del sistema."
    };
  }
}

module.exports = {
  askNexus
};