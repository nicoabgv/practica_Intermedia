const express = require('express');
const router = express.Router();

const { loginUser } = require('../controllers/userController');
const { deleteUser } = require('../controllers/userController');
const { registerUser } = require('../controllers/userController');
const { validateEmail } = require('../controllers/userController');
const { getUserProfile } = require('../controllers/userController');
const { updateCompanyInfo } = require('../controllers/userController');
const { updatePersonalInfo } = require('../controllers/userController');
const { inviteUser, registerInvitedUser } = require('../controllers/userController');
const { requestPasswordReset, resetPassword } = require('../controllers/userController');

router.post('/login', loginUser);
router.post('/invite', inviteUser);
router.delete('/delete', deleteUser);
router.get('/profile', getUserProfile);
router.post('/register', registerUser);
router.put('/validate-email', validateEmail);
router.post('/reset-password', resetPassword);
router.post('/register-invited', registerInvitedUser);
router.put('/onboarding/company-info', updateCompanyInfo);
router.put('/onboarding/personal-info', updatePersonalInfo);
router.post('/request-password-reset', requestPasswordReset);

module.exports = router;