const { generateResume, generateCoverLetter, analyzeJobDescription, analyzeResume } = require('../services/ai.service');
const { deductCredit, getBalance } = require('../services/credit.service');
const { generatePDF }  = require('../services/pdf.service');
const { uploadToS3 }   = require('../services/s3.service');
const asyncHandler     = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const prisma           = require('../config/db');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const logger           = require('../utils/logger');

const CREDIT_COST = 1;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — check credits before doing anything
// ─────────────────────────────────────────────────────────────────────────────
const checkCredits = async (userId, res) => {
  const balance = await getBalance(userId);
  if (balance < CREDIT_COST) {
    sendError(res, 402, 'Insufficient credits. Please upgrade your plan.', 'INSUFFICIENT_CREDITS');
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/resume/generate
// Flow: check credits → LLM → PDF → S3 → DB → deduct credits → respond
// ─────────────────────────────────────────────────────────────────────────────
const generateResumeHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Pre-flight credit check (fast — before calling LLM)
  const hasCredits = await checkCredits(userId, res);
  if (!hasCredits) return;

  // 2. Call LLM — multi-provider with automatic fallback
  const aiResult = await generateResume(req.body);

  // 3. Generate PDF buffer from AI text
  const pdfBuffer = await generatePDF(aiResult.text, 'resume', req.body.name);

  // 4. Upload PDF to S3
  const s3Key = `users/${userId}/resumes/${Date.now()}.pdf`;
  await uploadToS3(pdfBuffer, s3Key, 'application/pdf');

  // 5. Save Generation + UserFile records atomically
  const [generation] = await prisma.$transaction([
    prisma.generation.create({
      data: {
        userId,
        type:        'RESUME',
        prompt:      JSON.stringify(req.body),
        response:    aiResult.text,
        model:       aiResult.model,
        processingMs:aiResult.processingMs,
        s3Key,
        creditsUsed: CREDIT_COST,
      },
    }),
    prisma.userFile.create({
      data: {
        userId,
        s3Key,
        fileName:  `resume_${Date.now()}.pdf`,
        mimeType:  'application/pdf',
        sizeBytes: pdfBuffer.length,
        category:  'resume_pdf',
      },
    }),
  ]);

  // 6. Deduct credits AFTER successful generation
  const updatedAccount = await deductCredit(userId, CREDIT_COST, 'AI_GENERATION', generation.id);

  return sendSuccess(
    res, 200,
    'Resume generated successfully!',
    {
      generationId: generation.id,
      text:         aiResult.text,
      s3Key,
      processingMs: aiResult.processingMs,
      model:        aiResult.model,
      provider:     aiResult.provider,
    },
    { creditsRemaining: updatedAccount.balance }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/cover-letter/generate
// ─────────────────────────────────────────────────────────────────────────────
const generateCoverLetterHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const hasCredits = await checkCredits(userId, res);
  if (!hasCredits) return;

  const aiResult  = await generateCoverLetter(req.body);
  const pdfBuffer = await generatePDF(aiResult.text, 'cover_letter', req.body.name);
  const s3Key     = `users/${userId}/cover-letters/${Date.now()}.pdf`;
  await uploadToS3(pdfBuffer, s3Key, 'application/pdf');

  const [generation] = await prisma.$transaction([
    prisma.generation.create({
      data: {
        userId, type: 'COVER_LETTER',
        prompt: JSON.stringify(req.body), response: aiResult.text,
        model: aiResult.model, processingMs: aiResult.processingMs,
        s3Key, creditsUsed: CREDIT_COST,
      },
    }),
    prisma.userFile.create({
      data: {
        userId, s3Key,
        fileName: `cover_letter_${Date.now()}.pdf`,
        mimeType: 'application/pdf', sizeBytes: pdfBuffer.length,
        category: 'cover_letter_pdf',
      },
    }),
  ]);

  const updatedAccount = await deductCredit(userId, CREDIT_COST, 'AI_GENERATION', generation.id);

  return sendSuccess(res, 200, 'Cover letter generated!',
    { generationId: generation.id, text: aiResult.text, s3Key, processingMs: aiResult.processingMs, model: aiResult.model, provider: aiResult.provider },
    { creditsRemaining: updatedAccount.balance }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/job-analyzer/analyze
// ─────────────────────────────────────────────────────────────────────────────
const analyzeJobHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const hasCredits = await checkCredits(userId, res);
  if (!hasCredits) return;

  const aiResult = await analyzeJobDescription(req.body);

  const generation = await prisma.generation.create({
    data: {
      userId, type: 'JOB_ANALYSIS',
      prompt: JSON.stringify(req.body), response: aiResult.text,
      model: aiResult.model, processingMs: aiResult.processingMs,
      creditsUsed: CREDIT_COST,
    },
  });

  const updatedAccount = await deductCredit(userId, CREDIT_COST, 'AI_GENERATION', generation.id);

  return sendSuccess(res, 200, 'Job description analyzed!',
    { generationId: generation.id, text: aiResult.text, processingMs: aiResult.processingMs, model: aiResult.model, provider: aiResult.provider },
    { creditsRemaining: updatedAccount.balance }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/ai/history
// ─────────────────────────────────────────────────────────────────────────────
const getHistoryHandler = asyncHandler(async (req, res) => {
  const userId  = req.user.id;
  const page    = parseInt(req.query.page)  || 1;
  const limit   = parseInt(req.query.limit) || 10;
  const skip    = (page - 1) * limit;

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, type: true, model: true,
        creditsUsed: true, processingMs: true,
        s3Key: true, createdAt: true,
        prompt: true, response: true,
      },
    }),
    prisma.generation.count({ where: { userId } }),
  ]);

  // Attach signed download URLs for items that have PDFs in S3
  const { getSignedDownloadUrl } = require('../services/s3.service');
  const enriched = await Promise.all(
    generations.map(async (gen) => {
      let downloadUrl = null;
      if (gen.s3Key) {
        try {
          downloadUrl = await getSignedDownloadUrl(gen.s3Key);
        } catch {
          // S3 URL generation failed — skip silently
        }
      }
      return { ...gen, downloadUrl };
    })
  );

  return sendSuccess(res, 200, 'Generation history retrieved', enriched, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/resume-analyzer/analyze
// Flow: check credits → extract PDF text → LLM analysis → DB → deduct → respond
// ─────────────────────────────────────────────────────────────────────────────
const analyzeResumeHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Pre-flight credit check
  const hasCredits = await checkCredits(userId, res);
  if (!hasCredits) return;

  // 2. Validate that a PDF file was uploaded
  if (!req.file) {
    return sendError(res, 400, 'Please upload a PDF resume file.', 'VALIDATION_ERROR');
  }

  if (req.file.mimetype !== 'application/pdf') {
    return sendError(res, 400, 'Only PDF files are accepted.', 'VALIDATION_ERROR');
  }

  // 3. Extract text from the uploaded PDF
  let resumeText;
  try {
    resumeText = await extractTextFromPDF(req.file.buffer);
  } catch (err) {
    logger.error(`PDF extraction failed for ${req.file.originalname}: ${err.message}`);
    return sendError(res, 400, `Could not read the PDF file: ${err.message}. Please ensure it is a valid, text-based (not scanned/image) PDF.`, 'PDF_PARSE_ERROR');
  }

  if (!resumeText || resumeText.trim().length < 50) {
    return sendError(res, 400, 'The PDF appears to be empty or contains very little text. Please upload a text-based PDF resume (not a scanned image).', 'PDF_EMPTY');
  }

  // 4. Build input for the AI service
  const analysisInput = {
    resumeText:         resumeText.trim(),
    jobDescription:     req.body.jobDescription,
    targetRole:         req.body.targetRole,
    experienceLevel:    req.body.experienceLevel,
    industry:           req.body.industry,
    customInstructions: req.body.customInstructions,
  };

  // 5. Call LLM — multi-provider with automatic fallback
  const aiResult = await analyzeResume(analysisInput);

  // 6. Save Generation record
  const generation = await prisma.generation.create({
    data: {
      userId,
      type:         'RESUME_ANALYSIS',
      prompt:       JSON.stringify({ ...analysisInput, resumeText: `[PDF: ${req.file.originalname}, ${resumeText.length} chars]` }),
      response:     aiResult.text,
      model:        aiResult.model,
      processingMs: aiResult.processingMs,
      creditsUsed:  CREDIT_COST,
    },
  });

  // 7. Deduct credits
  const updatedAccount = await deductCredit(userId, CREDIT_COST, 'AI_GENERATION', generation.id);

  return sendSuccess(res, 200, 'Resume analyzed successfully!', {
    generationId:   generation.id,
    text:           aiResult.text,
    processingMs:   aiResult.processingMs,
    model:          aiResult.model,
    provider:       aiResult.provider,
    resumeFileName: req.file.originalname,
  }, { creditsRemaining: updatedAccount.balance });
});

module.exports = {
  generateResumeHandler,
  generateCoverLetterHandler,
  analyzeJobHandler,
  analyzeResumeHandler,
  getHistoryHandler,
};