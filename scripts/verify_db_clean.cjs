const path = require("path");
const { PrismaClient } = require(path.resolve(__dirname, "../packages/database/src/generated/client"));
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ 
    select: { id: true, address: true, userId: true, referralCode: true, sponsorAddress: true, directReferralsCount: true, isQualified: true } 
  });
  const slots = await prisma.matrixSlot.findMany();
  const placements = await prisma.matrixPlacement.findMany();
  const matrixProfiles = await prisma.matrixProfile.findMany();
  const daoMembers = await prisma.daoMember.findMany();
  const cursors = await prisma.indexerCursor.findMany();

  console.log("=== VERIFY DB CLEAN STATUS ===");
  console.log("USERS IN DB (" + users.length + "):", JSON.stringify(users, null, 2));
  console.log("MATRIX PROFILES (" + matrixProfiles.length + ")");
  console.log("TOTAL SLOTS (" + slots.length + "):", slots.map(s => ({ slotNumber: s.slotNumber, ownerAddress: s.ownerAddress, filledCount: s.filledPositionsCount })));
  console.log("TOTAL PLACEMENTS (" + placements.length + ")");
  console.log("DAO MEMBERS (" + daoMembers.length + ")");
  console.log("INDEXER CURSORS (" + cursors.length + "):", cursors.map(c => ({ contract: c.contractAddress, block: c.lastProcessedBlock.toString() })));
  await prisma.$disconnect();
}
check().catch(console.error);
