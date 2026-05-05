module.exports = async (action, message, reasons) => {
  const reasonText = reasons.join(", ");

  if (action === "warn") {
    return message.channel.send(`⚠️ Warning: ${reasonText}`);
  }

  if (action === "mute") {
    return message.member?.timeout(10 * 60 * 1000, reasonText);
  }

  if (action === "ban") {
    return message.member?.ban({ reason: reasonText });
  }
};