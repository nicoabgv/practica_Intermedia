const express = require("express");
const router = express.Router();

const { createItem } = require("../controllers/storage");
const { uploadMiddleware } = require("../utils/handleStorage");

/**
 * @swagger
 * tags:
 *   name: Storage
 *   description: Subida de archivos al servidor
 */

/**
 * @swagger
 * /api/storage/local:
 *   post:
 *     summary: Subir un archivo (imagen) al servidor local
 *     tags: [Storage]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido correctamente
 *       400:
 *         description: No se proporcionó un archivo válido
 */
router.post("/local", uploadMiddleware.single("image"), createItem);

module.exports = router;