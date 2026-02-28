const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getSignedDownloadUrl } = require('../services/s3.service');
const prisma = require('../config/db');

// GET /api/v1/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      isEmailVerified: true, createdAt: true,
      creditAccount: { select: { balance: true, totalUsed: true } },
      subscription: {
        select: {
          status: true, currentPeriodEnd: true,
          plan: { select: { name: true, displayName: true, monthlyCredits: true, priceUSD: true } },
        },
      },
    },
  });
  return sendSuccess(res, 200, 'Profile retrieved', user);
});

// GET /api/v1/users/generations
const getGenerations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const skip   = (page - 1) * limit;

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
      select: {
        id: true, type: true, model: true, creditsUsed: true,
        processingMs: true, s3Key: true, createdAt: true,
      },
    }),
    prisma.generation.count({ where: { userId } }),
  ]);

  // Attach signed download URLs for files
  const withUrls = await Promise.all(
    generations.map(async (gen) => ({
      ...gen,
      downloadUrl: gen.s3Key ? await getSignedDownloadUrl(gen.s3Key) : null,
    }))
  );

  return sendSuccess(res, 200, 'Generations retrieved', withUrls, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  });
});

module.exports = { getProfile, getGenerations };