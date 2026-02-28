const express = require('express');
const router  = express.Router();

const {
  generateResumeHandler,
  generateCoverLetterHandler,
  analyzeJobHandler,
  getHistoryHandler,
} = require('../../../controllers/ai.controller');

const { verifyAccessToken } = require('../../../middleware/auth.middleware');
const { aiLimiter }         = require('../../../middleware/rateLimiter.middleware');
const { validate }          = require('../../../middleware/validate.middleware');
const { resumeSchema, coverLetterSchema, jobAnalysisSchema } = require('../../../validators/ai.validator');

// All AI routes require auth
router.use(verifyAccessToken);

router.post('/resume/generate',       aiLimiter, validate(resumeSchema),       generateResumeHandler);
router.post('/cover-letter/generate', aiLimiter, validate(coverLetterSchema),   generateCoverLetterHandler);
router.post('/job-analyzer/analyze',  aiLimiter, validate(jobAnalysisSchema),   analyzeJobHandler);
router.get('/history',                getHistoryHandler);

module.exports = router;