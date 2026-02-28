const prisma = require('../config/db');
const logger = require('../utils/logger');

/**
 * Atomically check balance and deduct credits using a Prisma transaction.
 * If balance is insufficient → throws INSUFFICIENT_CREDITS error.
 * If Ollama fails AFTER this call → you should NOT call this (deduct after success).
 */
const deductCredit = async (userId, amount = 1, reason = 'AI_GENERATION', generationId = null) => {
  return await prisma.$transaction(async (tx) => {

    // Lock the credit account row
    const account = await tx.creditAccount.findUnique({ where: { userId } });

    if (!account) {
      const err = new Error('Credit account not found');
      err.status = 404;
      throw err;
    }

    if (account.balance < amount) {
      const err = new Error('Insufficient credits. Please upgrade your plan.');
      err.status  = 402;
      err.code    = 'INSUFFICIENT_CREDITS';
      throw err;
    }

    // Deduct balance + increment totalUsed
    const updated = await tx.creditAccount.update({
      where: { userId },
      data: {
        balance:  { decrement: amount },
        totalUsed:{ increment: amount },
      },
    });

    // Audit trail record
    await tx.creditTransaction.create({
      data: {
        creditAccountId: account.id,
        amount:          -amount,
        reason,
        generationId,
      },
    });

    logger.info(`Credits deducted: user=${userId} amount=${amount} balance=${updated.balance}`);
    return updated;
  });
};

/**
 * Add credits — called by Stripe webhook on subscription renewal or admin grant.
 */
const addCredits = async (userId, amount, reason = 'SUBSCRIPTION_RENEWAL') => {
  return await prisma.$transaction(async (tx) => {
    const account = await tx.creditAccount.findUnique({ where: { userId } });
    if (!account) throw new Error('Credit account not found');

    const updated = await tx.creditAccount.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    await tx.creditTransaction.create({
      data: {
        creditAccountId: account.id,
        amount:          +amount,
        reason,
      },
    });

    logger.info(`Credits added: user=${userId} amount=${amount} balance=${updated.balance}`);
    return updated;
  });
};

/**
 * Get current credit balance for a user
 */
const getBalance = async (userId) => {
  const account = await prisma.creditAccount.findUnique({ where: { userId } });
  return account?.balance ?? 0;
};

module.exports = { deductCredit, addCredits, getBalance };