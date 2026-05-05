module.exports = (message, config) => {
  const content = message.content?.trim();
  if (!content) return null;

  const words = content.split(/\s+/);

  // 🔥 ignorar mensajes muy cortos
  if (words.length < 4) return null;

  // ----------------------------
  // 🔁 1. repetición de palabra
  // ej: "tu tu tu tu"
  // ----------------------------
  const first = words[0].toLowerCase();
  const allSameWord = words.every(w => w.toLowerCase() === first);

  if (allSameWord) {
    return {
      points: 3,
      reason: "Repetición de palabra detectada"
    };
  }

  // ----------------------------
  // 🔁 2. repetición de frase exacta
  // ej: "hola hola hola hola"
  // ----------------------------
  const normalized = content.toLowerCase();
  const chunks = normalized.split(" ");

  const isRepeatedPhrase =
    chunks.length >= 6 &&
    chunks.every(c => c === chunks[0]);

  if (isRepeatedPhrase) {
    return {
      points: 3,
      reason: "Spam de repetición de frase"
    };
  }

  // ----------------------------
  // 🔁 3. repetición de patrón corto
  // ej: "tu tu tu"
  // ----------------------------
  const pattern = words.slice(0, 2).join(" ").toLowerCase();
  const repeatedPattern = words.join(" ").toLowerCase();

  if (
    pattern &&
    repeatedPattern.split(pattern).length > 4
  ) {
    return {
      points: 2,
      reason: "Patrón repetitivo detectado"
    };
  }

  return null;
};