const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database/src/generated/client");
const prisma = new PrismaClient();

async function show() {
  const users = await prisma.user.findMany();
  console.log("All existing users in DB:", users);
  await prisma.$disconnect();
}
show();
