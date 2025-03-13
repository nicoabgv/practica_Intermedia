const express = require('express');
const router = express.Router();

const { registerUser } = require('../controllers/userController');
const { validateEmail } = require('../controllers/userController');
const { loginUser } = require('../controllers/userController');
const { updatePersonalInfo } = require('../controllers/userController');
const { updateCompanyInfo } = require('../controllers/userController');

router.put('/onboarding/company-info', updateCompanyInfo);
router.put('/onboarding/personal-info', updatePersonalInfo);
router.post('/login', loginUser);
router.put('/validate-email', validateEmail);
router.post('/register', registerUser);

module.exports = router;