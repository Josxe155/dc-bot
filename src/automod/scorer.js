module.exports = (results, config, rules) => {
  let score = 0;
  const reasons = [];

  for (const r of results) {
    score += r.points || 0;
    if (r.reason) reasons.push(r.reason);
  }

  // reglas dinámicas
  const thresholds = rules?.thresholds || {
    warn: 3,
    mute: 6,
    ban: 10
  };

  let decision = "ignore";

  if (score >= thresholds.ban) decision = "ban";
  else if (score >= thresholds.mute) decision = "mute";
  else if (score >= thresholds.warn) decision = "warn";

  return {
    score,
    decision,
    reasons
  };
};