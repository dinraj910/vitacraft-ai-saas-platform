const express = require('express');
const router  = express.Router();

const { getSignedUrl, getUserFiles, deleteFile } = require('../../../controllers/files.controller');
const { verifyAccessToken } = require('../../../middleware/auth.middleware');

router.use(verifyAccessToken);

router.get('/',                  getUserFiles);
router.get('/signed-url/:fileId', getSignedUrl);
router.delete('/:fileId',        deleteFile);

module.exports = router;