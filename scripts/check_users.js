if (process.loadEnvFile) process.loadEnvFile();
const { PrismaClient } = require('../packages/database/dist/index.js');
const prisma = new PrismaClient();

async function check() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      console.log('Connected on attempt', attempt);
      break;
    } catch (err) {
      console.log(`Attempt ${attempt} failed: ${err.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const users = await prisma.user.findMany({
    where: {
      userId: { in: [1, 2, 3, 4, 6, 13, 83, 113, 121, 195, 199, 200, 205, 210, 223, 109] }
    },
    select: { id: true, address: true, userId: true }
  });
  console.log('Existing users with those userIds:', users);
}

check().catch(console.error).finally(() => prisma.$disconnect());
