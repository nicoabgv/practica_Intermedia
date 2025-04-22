const { sendEmail } = require("../utils/handleMails");
const { handleHttpError } = require("../utils/handleError");
const { matchedData } = require("express-validator");

const send = async (req, res) => {
  try {
    const info = matchedData(req);
    await sendEmail(info);
    res.send({ message: "Correo enviado correctamente" });
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_SEND_EMAIL");
  }
};

module.exports = { send };