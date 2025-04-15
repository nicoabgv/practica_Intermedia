const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateNote = [
  check("type").exists().isIn(["hours", "materials", "mixed"]),
  check("project").exists().isMongoId(),
  check("persons").optional().isArray(),
  check("persons.*.name").optional().isString(),
  check("persons.*.hours").optional().isNumeric(),
  check("materials").optional().isArray(),
  check("materials.*.name").optional().isString(),
  check("materials.*.quantity").optional().isNumeric(),
  (req, res, next) => validateResults(req, res, next),
];

const validatorId = [
  check("id").exists().isMongoId(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorCreateNote,
  validatorId,
};