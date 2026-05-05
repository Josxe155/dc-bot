module.exports = {
  isRepeating(text) {
    const words = text.trim().split(/\s+/);
    if (words.length < 4) return false;

    return words.every(w => w.toLowerCase() === words[0].toLowerCase());
  },

  isCharSpam(text) {
    return /^(.)\1{4,}$/.test(text.replace(/\s/g, ''));
  },

  isCapsSpam(text) {
    if (text.length < 6) return false;

    const caps = text.replace(/[^a-zA-Z]/g, '').length;
    const total = text.length;

    return caps / total > 0.8;
  }
};