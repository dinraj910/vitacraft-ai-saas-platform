const express = require('express');
const router  = express.Router();

const { register, login, refresh, logout, getMe } = require('../../../controllers/auth.controller');
const { verifyAccessToken } = require('../../../middleware/auth.middleware');
const { authLimiter }       = require('../../../middleware/rateLimiter.middleware');
const { validate }          = require('../../../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../../../validators/auth.validator');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema), login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        verifyAccessToken, getMe);

module.exports = router;