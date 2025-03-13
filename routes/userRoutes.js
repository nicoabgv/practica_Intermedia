const express = require('express');
const router = express.Router();

const { loginUser } = require('../controllers/userController');
const { deleteUser } = require('../controllers/userController');
const { registerUser } = require('../controllers/userController');
const { validateEmail } = require('../controllers/userController');
const { getUserProfile } = require('../controllers/userController');
const { updatePersonalInfo } = require('../controllers/userController');
const { updateCompanyInfo } = require('../controllers/userController');

router.post('/login', loginUser);
router.delete('/delete', deleteUser);
router.get('/profile', getUserProfile);
router.post('/register', registerUser);
router.put('/validate-email', validateEmail);
router.put('/onboarding/company-info', updateCompanyInfo);
router.put('/onboarding/personal-info', updatePersonalInfo);

module.exports = router;