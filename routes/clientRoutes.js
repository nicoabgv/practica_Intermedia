const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  validatorCreateClient,
  validatorId,
} = require("../validators/client");
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getArchivedClients,
  restoreClient,
} = require("../controllers/clientController");

router.use(authMiddleware);

router.post("/", validatorCreateClient, createClient);
router.get("/", getClients);
router.get("/archived", getArchivedClients);
router.get("/:id", validatorId, getClient);
router.patch("/:id/recover", validatorId, restoreClient);
router.put("/:id", validatorId, validatorCreateClient, updateClient);
router.delete("/:id", validatorId, deleteClient);

module.exports = router;