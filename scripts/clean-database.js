const { prisma } = require("../packages/database");

async function cleanDatabase() {
  console.log("🧹 Purging all derived testnet data from database...");
  const models = [
    "matrixTransaction",
    "matrixActivity",
    "matrixPlacement",
    "matrixSlot",
    "matrixCycleEvent",
    "matrixProfile",
    "matrixSettings",
    "matrixRankPoolState",
    "daoMember",
    "daoEvent",
    "daoProposal",
    "daoVote",
    "daoPoolState",
    "daoPoolEvent",
    "rankPoolEvent",
    "nftBadge",
    "poolCard",
    "vaultDepositSplit",
    "vestingLock",
    "withdrawal",
    "indexerCursor",
    "leaderboardSnapshot",
    "authNonce",
    "whatsappVerification",
    "pullFallbackClaim",
    "userSettings",
    "user",
  ];

  for (const model of models) {
    if (prisma[model] && typeof prisma[model].deleteMany === "function") {
      try {
        const result = await prisma[model].deleteMany({});
        console.log(`   ✅ Cleared ${model} (${result.count} records removed)`);
      } catch (err) {
        console.warn(`   ⚠️ Could not clear ${model}:`, err.message);
      }
    }
  }

  console.log("🎉 Database cleanly purged!");
  await prisma.$disconnect();
}

cleanDatabase().catch((err) => {
  console.error("❌ Database clean error:", err);
  process.exit(1);
});
