module.exports = (message, config) => {
  const content = message.content?.trim();
  if (!content) return null;

  const words = content.split(/\s+/);

  let score = 0;

  // -------------------------
  // 🔁 repetición de palabra
  // -------------------------
  const first = words[0]?.toLowerCase();
  const allSame = words.length > 3 && words.every(w => w.toLowerCase() === first);

  if (allSame) score += 3;

  // -------------------------
  // 🔁 repetición de bloques "tu tu"
  // -------------------------
  const pattern = words.slice(0, 2).join(" ").toLowerCase();
  const full = content.toLowerCase();

  if (pattern && full.split(pattern).length > 5) {
    score += 3;
  }

  // -------------------------
  // 📣 mention spam
  // -------------------------
  const mentions = (content.match(/<@!?\\d+>/g) || []).length;

  if (mentions >= 5) {
    score += 4;
  }

  // -------------------------
  // ⚡ decisión
  // -------------------------
  if (score >= 3) {
    return {
      points: score,
      reason: "Spam combinado (repetición + mentions)"
    };
  }

  return null;
};