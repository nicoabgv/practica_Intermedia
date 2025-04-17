const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  validatorCreateProject,
  validatorUpdateProject,
  validatorId,
} = require("../validators/project");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getArchivedProjects,
  restoreProject,
} = require("../controllers/projectController");

/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Endpoints para la gestión de proyectos
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener todos los proyectos del usuario
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get("/", getProjects);

/**
 * @swagger
 * /api/projects/archived:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get("/archived", getArchivedProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get("/:id", validatorId, getProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft delete)
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del proyecto
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 */
router.delete("/:id", validatorId, deleteProject);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
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
 *               - client
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               client:
 *                 type: string
 *                 description: ID del cliente asociado
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
router.post("/", validatorCreateProject, createProject);

/**
 * @swagger
 * /api/projects/{id}/recover:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del proyecto
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 */
router.patch("/:id/recover", validatorId, restoreProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del proyecto
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
 *               description:
 *                 type: string
 *               client:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.put("/:id", validatorUpdateProject, updateProject);

module.exports = router;