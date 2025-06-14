// sendMail.js
const transporter = require("./mailer");

const sendAviso = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: '"Mi App" <fabiomatiasayala@gmail.com>',
      to,
      subject,
      html: `<p>${message}</p>`,
    });
    console.log("Correo enviado con éxito");
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
};

module.exports = sendAviso;
