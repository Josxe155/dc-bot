const filters = [
  require('./filters/spam'),
  require('./filters/caps'),
  require('./filters/links'),
  require('./filters/mentions'),
  require('./filters/repetition')
];

const scorer = require('./scorer');
const actions = require('./actions');
const rules = require('./rules/configRules');
const logger = require('./utils/logger');

module.exports = async (message, config) => {
  try {
    // 🛑 seguridad básica
    if (!message || !message.author) return;
    if (message.author.bot) return;

    const results = [];

    // ----------------------------
    // 🧩 PIPELINE DE FILTROS
    // ----------------------------
    for (const filter of filters) {
      try {
        const res = await filter(message, config); // ✔ soporta async
        if (res) results.push(res);
      } catch (err) {
        console.error(`[AUTOMOD FILTER ERROR]:`, err);
      }
    }

    // ----------------------------
    // 🧠 SCORING ENGINE
    // ----------------------------
    let finalScore;

    try {
      finalScore = scorer(results, config, rules);
    } catch (err) {
      console.error(`[SCORER ERROR]:`, err);
      return;
    }

    const { decision, reasons = [], score = 0 } = finalScore;

    // ----------------------------
    // 📊 LOG SYSTEM
    // ----------------------------
    try {
      logger(message, {
        decision,
        reasons,
        score
      });
    } catch (err) {
      console.error(`[LOGGER ERROR]:`, err);
    }

    // ----------------------------
    // ⚡ ACTION ENGINE
    // ----------------------------
    if (decision && decision !== "ignore") {
      try {
        await actions(decision, message, reasons);
      } catch (err) {
        console.error(`[ACTION ERROR]:`, err);
      }
    }

  } catch (error) {
    // 🧨 anti-crash global
    console.error(`[AUTOMOD PIPELINE CRASH]:`, error);
  }
};