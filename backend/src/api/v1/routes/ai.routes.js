const express = require('express');
const router  = express.Router();
const multer  = require('multer');

// Multer config — store file in memory (buffer) for pdf-parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

const {
  generateResumeHandler,
  generateCoverLetterHandler,
  analyzeJobHandler,
  analyzeResumeHandler,
  getHistoryHandler,
} = require('../../../controllers/ai.controller');

const { verifyAccessToken } = require('../../../middleware/auth.middleware');
const { aiLimiter }         = require('../../../middleware/rateLimiter.middleware');
const { validate }          = require('../../../middleware/validate.middleware');
const { resumeSchema, coverLetterSchema, jobAnalysisSchema, resumeAnalysisSchema } = require('../../../validators/ai.validator');

// All AI routes require auth
router.use(verifyAccessToken);

router.post('/resume/generate',       aiLimiter, validate(resumeSchema),       generateResumeHandler);
router.post('/cover-letter/generate', aiLimiter, validate(coverLetterSchema),   generateCoverLetterHandler);
router.post('/job-analyzer/analyze',  aiLimiter, validate(jobAnalysisSchema),   analyzeJobHandler);
router.post('/resume-analyzer/analyze', aiLimiter, upload.single('resumeFile'), validate(resumeAnalysisSchema), analyzeResumeHandler);
router.get('/history',                getHistoryHandler);

module.exports = router;