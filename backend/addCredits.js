const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCredits() {
  try {
    // Find user by email (adjust if needed)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'dinraj' } },
          { name: { contains: 'DINRAJ' } }
        ]
      },
      include: { creditAccount: true }
    });

    if (!user) {
      console.log('❌ User not found. Available users:');
      const allUsers = await prisma.user.findMany({ select: { email: true, name: true } });
      console.table(allUsers);
      return;
    }

    // Update credit balance
    await prisma.creditAccount.update({
      where: { userId: user.id },
      data: { balance: 50 }
    });

    console.log(`✅ Added 50 credits to ${user.name} (${user.email})`);
    console.log(`   New balance: 50 credits`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addCredits();
