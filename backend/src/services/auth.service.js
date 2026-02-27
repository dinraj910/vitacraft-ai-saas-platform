const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateAccessToken, generateRefreshToken, generateSecureToken, verifyToken } = require('../utils/generateTokens');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409; err.code = 'USER_ALREADY_EXISTS'; throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
  if (!freePlan) throw new Error('FREE plan not found. Run: node prisma/seed.js');

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({ data: { name, email, passwordHash } });
    await tx.creditAccount.create({ data: { userId: newUser.id, balance: 5 } });
    await tx.subscription.create({ data: { userId: newUser.id, planId: freePlan.id, status: 'ACTIVE' } });
    return newUser;
  });

  logger.info(`New user registered: ${user.email}`);

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);
  const tokenId      = generateSecureToken();

  await prisma.refreshToken.create({
    data: { token: tokenId, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken, tokenId };
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
  }

  logger.info(`User logged in: ${user.email}`);

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);
  const tokenId      = generateSecureToken();

  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId: user.id, OR: [{ isRevoked: true }, { expiresAt: { lt: new Date() } }] } }),
    prisma.refreshToken.create({ data: { token: tokenId, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken, tokenId };
};

const refreshAccessToken = async (refreshToken, tokenId) => {
  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  if (!decoded) { const err = new Error('Invalid refresh token'); err.status = 401; err.code = 'REFRESH_TOKEN_INVALID'; throw err; }

  const stored = await prisma.refreshToken.findUnique({ where: { token: tokenId }, include: { user: true } });
  if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
    const err = new Error('Refresh token is invalid or revoked'); err.status = 401; err.code = 'REFRESH_TOKEN_INVALID'; throw err;
  }

  const user = stored.user;
  const newAccessToken  = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user.id);
  const newTokenId      = generateSecureToken();

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { token: tokenId }, data: { isRevoked: true } }),
    prisma.refreshToken.create({ data: { token: newTokenId, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, tokenId: newTokenId, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

const logoutUser = async (tokenId) => {
  if (!tokenId) return;
  await prisma.refreshToken.updateMany({ where: { token: tokenId }, data: { isRevoked: true } });
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true, isEmailVerified: true, createdAt: true,
      creditAccount: { select: { balance: true, totalUsed: true } },
      subscription: { select: { status: true, currentPeriodEnd: true, plan: { select: { name: true, displayName: true, monthlyCredits: true, priceUSD: true } } } },
    },
  });
  if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }
  return user;
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser };