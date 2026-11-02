const path = require("path");
const { PrismaClient } = require(path.resolve(__dirname, "../packages/database/src/generated/client"));
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.matrixTransaction.count();
  console.log('MatrixTransaction count in DB:', count);
  const txs = await prisma.matrixTransaction.findMany({ take: 10 });
  console.log('Sample txs:', JSON.stringify(txs, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
