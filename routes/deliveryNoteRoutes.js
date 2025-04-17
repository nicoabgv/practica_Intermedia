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

/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Endpoints para gestionar albaranes de trabajo
 */

/**
 * @swagger
 * /api/delivery-notes:
 *   get:
 *     summary: Obtener todos los albaranes del usuario
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get("/", getNotes);

/**
 * @swagger
 * /api/delivery-notes/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/:id", validatorId, getNote);

/**
 * @swagger
 * /api/delivery-notes/{id}:
 *   delete:
 *     summary: Eliminar un albarán (si no está firmado)
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       400:
 *         description: El albarán ya está firmado o no se encontró
 */
router.delete("/:id", validatorId, deleteNote);

/**
 * @swagger
 * /api/delivery-notes/pdf/{id}:
 *   get:
 *     summary: Generar y descargar un PDF del albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/pdf/:id", validatorId, generatePdf);

/**
 * @swagger
 * /api/delivery-notes:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - project
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [hours, materials, mixed]
 *               project:
 *                 type: string
 *               persons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     hours:
 *                       type: number
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Albarán creado
 */
router.post("/", validatorCreateNote, createNote);

/**
 * @swagger
 * /api/delivery-notes/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán subiendo una imagen
 *     tags: [Albaranes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       400:
 *         description: Ya está firmado o falta archivo
 */
router.patch(
  "/:id/sign",
  uploadMiddleware.single("signature"),
  validatorId,
  signNote
);

module.exports = router;