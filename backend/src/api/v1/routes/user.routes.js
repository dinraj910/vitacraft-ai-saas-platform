const express = require('express');
const router  = express.Router();

const { getProfile, getGenerations } = require('../../../controllers/user.controller');
const { verifyAccessToken }          = require('../../../middleware/auth.middleware');

router.use(verifyAccessToken);

router.get('/profile',     getProfile);
router.get('/generations', getGenerations);

module.exports = router;