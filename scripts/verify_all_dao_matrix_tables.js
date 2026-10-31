const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database");

let url = process.env.DATABASE_URL || "";
url = url.replace("&channel_binding=require", "");
if (!url.includes("pgbouncer=true")) {
  url += "&pgbouncer=true&connect_timeout=15";
}

const prisma = new PrismaClient({
  datasources: {
    db: { url },
  },
});

async function main() {
  console.log("=== VERIFYING ALL DAO & MATRIX TABLES IN NEW DATABASE ===");
  const results = {};
  const models = [
    "user", "authNonce", "userSettings", "whatsappVerification", "indexerCursor", "leaderboardSnapshot",
    "daoInstance", "daoMember", "daoProposal", "daoVote", "daoEvent", "daoPoolState", "daoPoolEvent",
    "pullFallbackClaim", "vaultDepositSplit", "vestingLock", "withdrawal", "nftBadge", "poolCard",
    "matrixProfile", "matrixSlot", "matrixPlacement", "matrixCycleEvent", "matrixTransaction",
    "matrixActivity", "matrixSettings", "matrixRankPoolState", "rankPoolEvent"
  ];

  for (const m of models) {
    process.stdout.write(`Checking ${m}... `);
    const count = await prisma[m].count();
    console.log(`OK (${count} rows)`);
    results[m] = count;
  }


  console.log("\n--- Verification Results (Table Rows in New Database) ---");
  for (const [table, count] of Object.entries(results)) {
    console.log(`✓ ${table.padEnd(25)} : ${count} rows (Table Accessible & Active)`);
  }

  console.log(`\nTOTAL VERIFIED TABLES: ${Object.keys(results).length}/28`);
  console.log("All DAO and Matrix tables exist and respond correctly!");
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
