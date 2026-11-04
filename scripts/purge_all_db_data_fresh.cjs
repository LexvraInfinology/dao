const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database/src/generated/client");

const prisma = new PrismaClient();

async function main() {
  console.log("===============================================================");
  console.log("PURGING 100% OF DATABASE DATA FOR FRESH CLEAN BLOCKCHAIN SYNC");
  console.log("===============================================================\n");

  const beforeCounts = {
    users: await prisma.user.count(),
    slots: await prisma.matrixSlot.count(),
    placements: await prisma.matrixPlacement.count(),
    transactions: await prisma.matrixTransaction.count(),
    activities: await prisma.matrixActivity.count(),
    daoMembers: await prisma.daoMember.count(),
  };
  console.log("Before Purge Counts:", beforeCounts);

  // 1. Matrix Tables
  console.log("1. Deleting Matrix tables...");
  await prisma.matrixPlacement.deleteMany({});
  await prisma.matrixCycleEvent.deleteMany({});
  await prisma.matrixTransaction.deleteMany({});
  await prisma.matrixActivity.deleteMany({});
  await prisma.matrixSlot.deleteMany({});
  await prisma.matrixProfile.deleteMany({});
  await prisma.matrixSettings.deleteMany({});

  // 2. DAO & Governance Tables
  console.log("2. Deleting DAO tables...");
  await prisma.daoVote.deleteMany({});
  await prisma.daoProposal.deleteMany({});
  await prisma.daoEvent.deleteMany({});
  await prisma.daoMember.deleteMany({});
  await prisma.pullFallbackClaim.deleteMany({});

  // 3. Financials & Nonces
  console.log("3. Deleting Financials & Auth nonces...");
  await prisma.withdrawal.deleteMany({});
  await prisma.vestingLock.deleteMany({});
  await prisma.nftBadge.deleteMany({});
  await prisma.authNonce.deleteMany({});
  await prisma.leaderboardSnapshot.deleteMany({});
  await prisma.userSettings.deleteMany({});

  // 4. Users
  console.log("4. Deleting all User rows...");
  await prisma.user.deleteMany({});

  // 5. Indexer Cursor
  console.log("5. Resetting indexer cursors...");
  await prisma.indexerCursor.deleteMany({});

  // 6. Reset DaoInstance
  console.log("6. Resetting DaoInstance...");
  try {
    await prisma.daoInstance.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        capacity: 100,
        isClosed: false,
        totalDistributedBtt: 0,
        distributionMode: "push_with_pull_fallback",
      },
      update: {
        capacity: 100,
        isClosed: false,
        totalDistributedBtt: 0,
        closedAt: null,
      },
    });
  } catch (e) {
    console.log("DaoInstance notice:", e.message);
  }

  const afterCounts = {
    users: await prisma.user.count(),
    slots: await prisma.matrixSlot.count(),
    placements: await prisma.matrixPlacement.count(),
    transactions: await prisma.matrixTransaction.count(),
    activities: await prisma.matrixActivity.count(),
    daoMembers: await prisma.daoMember.count(),
  };
  console.log("\nAfter Purge Counts (ALL ZERO):", afterCounts);
  console.log("\n===============================================================");
  console.log("DATABASE 100% PURGED — READY FOR FRESH CONTRACT USERS");
  console.log("===============================================================\n");
}

main()
  .catch((err) => {
    console.error("Purge error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

