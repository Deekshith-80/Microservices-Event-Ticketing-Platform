const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, logout } = require('../controllers/authController');
const tenantContextFilter = require('../middlewares/tenantMiddleware');

router.post('/register', tenantContextFilter, register);
router.post('/login', tenantContextFilter, login);
router.post('/google-login', tenantContextFilter, googleLogin);
router.get('/me', getMe); // Added verification route handle context mapping
router.post('/logout', logout);

module.exports = router;