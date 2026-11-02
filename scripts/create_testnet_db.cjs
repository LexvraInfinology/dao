const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database/src/generated/client'));
const prisma = new PrismaClient();

async function reset() {
  await prisma.$executeRawUnsafe("DROP SCHEMA IF EXISTS testnet CASCADE;");
  console.log("Dropped schema testnet cascade!");
  await prisma.$executeRawUnsafe("CREATE SCHEMA testnet;");
  console.log("Created fresh schema testnet!");
  await prisma.$disconnect();
}

reset();
