const express = require('express');
const router = express.Router();

const {
  loginUser,
  deleteUser,
  registerUser,
  validateEmail,
  getUserProfile,
  updateCompanyInfo,
  updatePersonalInfo,
  inviteUser,
  registerInvitedUser,
  requestPasswordReset,
  resetPassword
} = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints relacionados con usuarios, autenticación y onboarding
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/invite:
 *   post:
 *     summary: Invitar a un compañero
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitación enviada
 */
router.post('/invite', inviteUser);

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Eliminar usuario (hard o soft)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [soft, hard]
 *         description: Tipo de eliminación
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete('/delete', deleteUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 */
router.get('/profile', getUserProfile);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/validate-email:
 *   put:
 *     summary: Validar el email con un código
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email validado correctamente
 */
router.put('/validate-email', validateEmail);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Restablecer contraseña con código
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/users/register-invited:
 *   post:
 *     summary: Registro de usuario invitado con token
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario invitado registrado
 */
router.post('/register-invited', registerInvitedUser);

/**
 * @swagger
 * /api/users/onboarding/company-info:
 *   put:
 *     summary: Añadir información de la compañía (onboarding)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Información de la empresa actualizada
 */
router.put('/onboarding/company-info', updateCompanyInfo);

/**
 * @swagger
 * /api/users/onboarding/personal-info:
 *   put:
 *     summary: Añadir información personal (onboarding)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastName:
 *                 type: string
 *               nif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Información personal actualizada
 */
router.put('/onboarding/personal-info', updatePersonalInfo);

/**
 * @swagger
 * /api/users/request-password-reset:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código de recuperación enviado al correo
 */
router.post('/request-password-reset', requestPasswordReset);

module.exports = router;