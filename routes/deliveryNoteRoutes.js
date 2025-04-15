const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  validatorCreateNote,
  validatorId,
} = require("../validators/deliveryNote");
const {
  createNote,
  getNotes,
  getNote,
  deleteNote,
  signNote,
  generatePdf,
} = require("../controllers/deliveryNoteController");
const { uploadMiddleware } = require("../utils/handleStorage");

router.use(authMiddleware);

router.get("/", getNotes);
router.get("/:id", validatorId, getNote);
router.delete("/:id", validatorId, deleteNote);
router.get("/pdf/:id", validatorId, generatePdf);
router.post("/", validatorCreateNote, createNote);
router.patch(
  "/:id/sign",
  uploadMiddleware.single("signature"),
  validatorId,
  signNote
);

module.exports = router;