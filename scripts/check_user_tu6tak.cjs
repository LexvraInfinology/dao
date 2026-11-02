const path = require("path");
const { PrismaClient } = require(path.resolve(__dirname, "../packages/database/src/generated/client"));
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      matrixSlots: true,
      matrixProfile: true,
      matrixTransactions: true,
    }
  });
  console.log("Total users:", users.length);
  for (const u of users) {
    const s = JSON.stringify(u);
    if (s.toLowerCase().includes("tu6tak") || s.toLowerCase().includes("59cc97")) {
      console.log("Matched User:", u.userId, u.address);
      console.log("User details:", JSON.stringify(u, null, 2));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
