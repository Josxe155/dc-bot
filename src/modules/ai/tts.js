// src/utils/tts.js
const gtts = require("gtts");
const fs = require("fs");
const path = require("path");

function textToSpeech(text, filename = "voice.mp3") {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../../temp", filename);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const tts = new gtts(text, "es");

    tts.save(filePath, (err) => {
      if (err) return reject(err);
      resolve(filePath);
    });
  });
}

module.exports = { textToSpeech };