const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateProject = [
  check("name").exists().notEmpty().withMessage("El nombre es obligatorio"),
  check("description").optional().isString(),
  check("client").exists().isMongoId().withMessage("ID de cliente no válido"),
  (req, res, next) => validateResults(req, res, next),
];

const validatorUpdateProject = [
  check("id").exists().isMongoId(),
  check("name").optional().isString(),
  check("description").optional().isString(),
  check("client").optional().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorId = [
  check("id").exists().isMongoId().withMessage("ID de proyecto inválido"),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCreateProject,
  validatorUpdateProject,
  validatorId,
};