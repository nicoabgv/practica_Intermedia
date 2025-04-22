const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorSendMail = [
  check("to").isEmail(),
  check("subject").notEmpty(),
  check("text").notEmpty(),
  check("from").optional().isEmail(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = { validatorSendMail };