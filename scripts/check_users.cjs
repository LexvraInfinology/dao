const path = require("path");
const { PrismaClient } = require(path.resolve(__dirname, "../packages/database/src/generated/client"));
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log("Total users in testnet DB:", count);
  const users = await prisma.user.findMany({
    select: {
      userId: true,
      address: true,
      matrixSlots: { select: { slotNumber: true, isUnlocked: true } }
    }
  });
  console.log("Users in DB:", JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
