require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VitaCraft AI database...');

  const plans = [
    {
      name: 'FREE',
      displayName: 'Free',
      monthlyCredits: 5,
      priceUSD: 0.0,
      stripePriceId: 'price_free_placeholder',
      features: JSON.stringify(['5 AI generations/month', 'Resume Generator', 'PDF Download']),
      isActive: true,
    },
    {
      name: 'PRO',
      displayName: 'Pro',
      monthlyCredits: 50,
      priceUSD: 9.99,
      stripePriceId: 'price_pro_placeholder',
      features: JSON.stringify(['50 AI generations/month', 'Resume + Cover Letter', 'PDF Download', 'S3 Storage']),
      isActive: true,
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise',
      monthlyCredits: 200,
      priceUSD: 29.99,
      stripePriceId: 'price_enterprise_placeholder',
      features: JSON.stringify(['200 AI generations/month', 'All AI Features', 'Job Analyzer', 'Priority Support']),
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ Plan: ${plan.displayName}`);
  }

  const adminHash = await bcrypt.hash('Admin@VitaCraft2026!', 12);
  const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vitacraft.ai' },
    update: {},
    create: {
      email: 'admin@vitacraft.ai',
      passwordHash: adminHash,
      name: 'VitaCraft Admin',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  await prisma.creditAccount.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 999, totalUsed: 0 },
  });

  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, planId: freePlan.id, status: 'ACTIVE' },
  });

  console.log('  ✅ Admin user: admin@vitacraft.ai / Admin@VitaCraft2026!');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());