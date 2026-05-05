const db = require('../config/firebase');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { textToSpeech } = require('../modules/ai/tts');

function getToday() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}`;
}

module.exports = (client) => {
  console.log('🎂 Birthday service activo');

  setInterval(async () => {
    const today = getToday();

    try {
      const snapshot = await rtdb.ref('birthdays').once('value');
      const data = snapshot.val();

      if (!data) return;

      for (const userId in data) {
        if (data[userId] !== today) continue;

        try {
          const user = await client.users.fetch(userId).catch(() => null);
          if (!user) continue;

          // 🎂 EMBED PRO (limpio, sin branding raro)
          const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎂 Feliz Cumpleaños')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(
`🎉 Hoy es un día especial.

El sistema ha detectado tu cumpleaños.

Disfruta tu día.`
            )
            .addFields(
              { name: '👤 Usuario', value: user.tag, inline: true },
              { name: '📅 Fecha', value: today, inline: true }
            );

          // 🎶 SERENATA TEXTO
          const serenata = `Estas son las mañanitas
Que cantaba el rey David
Hoy por ser día de tu santo
Te las cantamos aquí`;

          await user.send({
            embeds: [embed],
            content: `🎶 Serenata de cumpleaños\n\n${serenata}`
          });

          // 🔊 AUDIO
          try {
            const fileName = `birthday-${Date.now()}.mp3`;
            const audioText = serenata.replace(/\n/g, ', ');

            const filePath = await textToSpeech(audioText, fileName);

            await user.send({
              content: '🔊 Serenata en audio',
              files: [filePath]
            });

            setTimeout(() => {
              fs.unlink(filePath, () => {});
            }, 5000);

          } catch (audioErr) {
            console.log('⚠️ Audio no disponible:', audioErr.message);
          }

          console.log(`🎂 Cumpleaños enviado a ${user.tag}`);

        } catch (err) {
          console.error(`❌ Error enviando cumpleaños a ${userId}:`, err);
        }
      }

    } catch (err) {
      console.error('❌ Birthday Service error:', err);
    }

  }, 60 * 60 * 1000);
};