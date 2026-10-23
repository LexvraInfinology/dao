/**
 * ==============================================================================
 * EQUORA MATRIX PROTOCOL — MAINNET CLEAN LAUNCH RESET SCRIPT
 * (scripts/seed_matrix_clean.ts)
 *
 * PURPOSE:
 * Run this script to purge all simulation test data and initialize a clean,
 * pristine genesis ledger for production launch.
 *
 * WHAT IT DOES:
 * 1. Purges all simulated matrix placements, cycles, activities, transactions.
 * 2. Purges test dummy operatives (userId > 1).
 * 3. Initializes Operative #1 (Root Genesis) with Slots 1–12 unlocked,
 *    clean 0 balance, ready to accept organic mainnet registrations.
 * ==============================================================================
 */

import { prisma } from "../packages/database/src";

const GENESIS_ROOT_ADDRESS = (
  process.env.MATRIX_ROOT_ADDRESS ||
  process.env.NEXT_PUBLIC_DEFAULT_WALLET ||
  "0x71c85d7b561e723908f9c162590214b7e8d24982"
).toLowerCase();

async function main() {
  console.log("========================================================");
  console.log("⚡ EQUORA MATRIX PROTOCOL — CLEAN LAUNCH PREPARATION");
  console.log(`🎯 Target Genesis Root Address: ${GENESIS_ROOT_ADDRESS}`);
  console.log("========================================================\n");

  console.log("1. Purging simulation ledger placements & cycles...");
  await prisma.matrixPlacement.deleteMany({});
  await prisma.matrixCycleEvent.deleteMany({});
  await prisma.matrixActivity.deleteMany({});
  await prisma.matrixTransaction.deleteMany({});
  console.log("   ✓ Purged matrix placements, cycles, activities, transactions.");

  console.log("2. Purging matrix data for non-root operatives...");
  // Clear matrix-specific state for other users without deleting the User records
  await prisma.matrixSlot.deleteMany({ where: { userAddress: { not: GENESIS_ROOT_ADDRESS } } });
  await prisma.matrixSettings.deleteMany({ where: { userAddress: { not: GENESIS_ROOT_ADDRESS } } });
  await prisma.matrixProfile.deleteMany({ where: { userAddress: { not: GENESIS_ROOT_ADDRESS } } });
  console.log("   ✓ Reset matrix profiles, settings, and slots for non-root users.");

  console.log("3. Initializing / Resetting Root Genesis Operative #1...");
  await prisma.matrixSlot.deleteMany({ where: { userAddress: GENESIS_ROOT_ADDRESS } });

  const rootUser = await prisma.user.upsert({
    where: { address: GENESIS_ROOT_ADDRESS },
    update: {
      userId: 1,
      sponsorAddress: null,
      directReferralsCount: 0,
      isQualified: true,
      registrationTimestamp: new Date(),
    },
    create: {
      address: GENESIS_ROOT_ADDRESS,
      userId: 1,
      sponsorAddress: null,
      directReferralsCount: 0,
      isQualified: true,
      registrationTimestamp: new Date(),
    },
  });

  await prisma.matrixProfile.upsert({
    where: { userAddress: GENESIS_ROOT_ADDRESS },
    update: {
      username: "Root Genesis #1",
      bio: "Protocol Architect & Genesis Anchor",
      rankTier: 4,
      totalEarnings: 0,
      directEarnings: 0,
      matrixEarnings: 0,
      poolEarnings: 0,
      availableBalance: 0,
      withdrawnTotal: 0,
      recyclesCount: 0,
      teamCount: 0,
    },
    create: {
      userAddress: GENESIS_ROOT_ADDRESS,
      username: "Root Genesis #1",
      bio: "Protocol Architect & Genesis Anchor",
      rankTier: 4,
      totalEarnings: 0,
      directEarnings: 0,
      matrixEarnings: 0,
      poolEarnings: 0,
      availableBalance: 0,
      withdrawnTotal: 0,
      recyclesCount: 0,
      teamCount: 0,
    },
  });

  await prisma.matrixSettings.upsert({
    where: { userAddress: GENESIS_ROOT_ADDRESS },
    update: {
      autoUpgrade: true,
      autoReinvest: true,
      soundEffects: true,
      theme: "dark",
      telegramNotifications: true,
      emailNotifications: false,
    },
    create: {
      userAddress: GENESIS_ROOT_ADDRESS,
      autoUpgrade: true,
      autoReinvest: true,
      soundEffects: true,
      theme: "dark",
      telegramNotifications: true,
      emailNotifications: false,
    },
  });

  console.log("4. Unlocking all 12 Matrix Slots for Root Genesis...");
  for (let slot = 1; slot <= 12; slot++) {
    await prisma.matrixSlot.create({
      data: {
        userAddress: GENESIS_ROOT_ADDRESS,
        slotNumber: slot,
        isUnlocked: true,
        currentCycle: 1,
        recyclesCount: 0,
        filledNodes: 0,
        upgradeReserve: 0,
        totalEarned: 0,
        unlockedAt: new Date(),
      },
    });
  }

  // Record genesis activity
  await prisma.matrixActivity.create({
    data: {
      userAddress: GENESIS_ROOT_ADDRESS,
      action: "MEMBER_JOINED",
      title: "Genesis Matrix Initialized",
      description: "EQUORA Protocol Genesis Anchor established. Network ready for live public activations.",
      slotNumber: 1,
    },
  });

  console.log("   ✓ All 12 Matrix slots initialized with 0 filled nodes and 0 earnings.");
  console.log("\n========================================================");
  console.log("✅ EQUORA MATRIX PROTOCOL IS CLEAN & READY FOR LAUNCH!");
  console.log(`👤 Genesis Anchor: ${rootUser.address} (Operative #1)`);
  console.log("========================================================");
}

main()
  .catch((e) => {
    console.error("❌ Clean seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
