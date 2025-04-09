const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateClient = [
  check("name").exists().notEmpty().withMessage("El nombre es obligatorio"),
  check("nif").optional().isString(),
  check("email").optional().isEmail(),
  check("phone").optional().isString(),
  check("address").optional().isString(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorId = [
  check("id").exists().isMongoId().withMessage("ID no válido"),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCreateClient,
  validatorId,
};