const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

prisma
  .$connect()
  .then(() => logger.info('✅ Database connected (Supabase PostgreSQL)'))
  .catch((err) => {
    logger.error('❌ Database connection failed: ' + err.message);
    process.exit(1);
  });

module.exports = prisma;