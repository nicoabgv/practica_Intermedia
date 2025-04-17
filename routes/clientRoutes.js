const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  validatorCreateClient,
  validatorUpdateClient,
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

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para la gestión de clientes
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Obtener todos los clientes del usuario
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get("/", getClients);

/**
 * @swagger
 * /api/clients/archived:
 *   get:
 *     summary: Obtener clientes archivados
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get("/archived", getArchivedClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del cliente
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", validatorId, getClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Eliminar cliente (soft delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del cliente
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.delete("/:id", validatorId, deleteClient);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               nif:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 */
router.post("/", validatorCreateClient, createClient);

/**
 * @swagger
 * /api/clients/{id}/recover:
 *   patch:
 *     summary: Restaurar un cliente eliminado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del cliente a restaurar
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente restaurado
 */
router.patch("/:id/recover", validatorId, restoreClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del cliente
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nif:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put("/:id", validatorId, validatorUpdateClient, updateClient);

module.exports = router;