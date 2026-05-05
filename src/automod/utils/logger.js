module.exports = (message, result) => {
  console.log("━━━━━━━━━━━━━━━");
  console.log(`👤 User: ${message.author.tag}`);
  console.log(`📄 Content: ${message.content}`);
  console.log(`⚖️ Score: ${result.score}`);
  console.log(`🚨 Action: ${result.decision}`);
  console.log(`📌 Reasons: ${result.reasons.join(", ")}`);
  console.log("━━━━━━━━━━━━━━━");
};