const express = require('express');
const controller = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const { isAuthenticated } = require('../middleware/auth');
const { registrationRules, loginRules, collectValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/register', controller.showRegister);
router.post('/register', registrationRules, collectValidationErrors, asyncHandler(controller.register));
router.get('/login', controller.showLogin);
router.post('/login', loginRules, collectValidationErrors, asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));
router.get('/profile', isAuthenticated, asyncHandler(controller.profile));

module.exports = router;
