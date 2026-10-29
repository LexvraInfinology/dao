const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database/src/generated/client");

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const slotCount = await prisma.matrixSlot.count();
    const placementCount = await prisma.matrixPlacement.count();
    const txCount = await prisma.matrixTransaction.count();
    const activityCount = await prisma.matrixActivity.count();
    const daoMemberCount = await prisma.daoMember.count();

    console.log("Database Row Counts:", {
      users: userCount,
      matrixSlots: slotCount,
      matrixPlacements: placementCount,
      matrixTransactions: txCount,
      matrixActivities: activityCount,
      daoMembers: daoMemberCount
    });

    const sampleUsers = await prisma.user.findMany({
      take: 10,
      select: {
        address: true,
        userId: true,
        sponsorAddress: true,
        directReferralsCount: true,
        isQualified: true
      }
    });
    console.log("Sample Users in DB:", sampleUsers);

    const sampleSlots = await prisma.matrixSlot.findMany({
      take: 10,
      select: {
        userAddress: true,
        slotNumber: true,
        currentCycle: true,
        filledNodes: true,
        isUnlocked: true,
        totalEarned: true
      }
    });
    console.log("Sample Matrix Slots in DB:", sampleSlots);

  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
