const { generateResume, generateCoverLetter, analyzeJobDescription } = require('../services/ai.service');
const { deductCredit, getBalance } = require('../services/credit.service');
const { generatePDF }  = require('../services/pdf.service');
const { uploadToS3 }   = require('../services/s3.service');
const asyncHandler     = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const prisma           = require('../config/db');

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
// Flow: check credits → Ollama → PDF → S3 → DB → deduct credits → respond
// ─────────────────────────────────────────────────────────────────────────────
const generateResumeHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Pre-flight credit check (fast — before calling Ollama)
  const hasCredits = await checkCredits(userId, res);
  if (!hasCredits) return;

  // 2. Call Ollama — on-demand LLM invocation
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
    { generationId: generation.id, text: aiResult.text, s3Key, processingMs: aiResult.processingMs },
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
    { generationId: generation.id, text: aiResult.text, processingMs: aiResult.processingMs },
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
        prompt: true,
      },
    }),
    prisma.generation.count({ where: { userId } }),
  ]);

  return sendSuccess(res, 200, 'Generation history retrieved', generations, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  });
});

module.exports = {
  generateResumeHandler,
  generateCoverLetterHandler,
  analyzeJobHandler,
  getHistoryHandler,
};