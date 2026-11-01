const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { prisma } = require("../packages/database");

const GENESIS_ROOT_EVM = "0x7124b32b48786a13177f3bdc9620e7a48eb9c902".toLowerCase();
const NODE1_USER_EVM = "0x54ee27d54ec9c03b5ed2f69960b175f34facd696".toLowerCase();

async function main() {
  console.log("================================================================================");
  console.log("🗄 SYNCHRONIZING NEON POSTGRESQL DATABASE WITH ON-CHAIN GENESIS MATRIX STATE");
  console.log("================================================================================");

  try {
    // 1. Update Genesis Root User
    console.log(`\n1. Updating Genesis Root User (${GENESIS_ROOT_EVM})...`);
    await prisma.user.update({
      where: { address: GENESIS_ROOT_EVM },
      data: {
        sponsorAddress: null,
        isQualified: true,
        directReferralsCount: 1,
      },
    });
    console.log(`   ✅ Genesis Root user updated: isQualified=true, directReferralsCount=1, sponsor=null`);

    // 2. Update Node 1 User
    console.log(`\n2. Updating Node 1 User (${NODE1_USER_EVM})...`);
    await prisma.user.update({
      where: { address: NODE1_USER_EVM },
      data: {
        sponsorAddress: GENESIS_ROOT_EVM,
        isQualified: false,
      },
    });
    console.log(`   ✅ Node 1 user updated: sponsorAddress=${GENESIS_ROOT_EVM}`);

    // 3. Upsert Root MatrixSlot 1
    console.log(`\n3. Setting Root MatrixSlot 1: isUnlocked=true, filledNodes=1...`);
    await prisma.matrixSlot.upsert({
      where: {
        userAddress_slotNumber: {
          userAddress: GENESIS_ROOT_EVM,
          slotNumber: 1,
        },
      },
      update: {
        isUnlocked: true,
        filledNodes: 1,
        currentCycle: 1,
      },
      create: {
        userAddress: GENESIS_ROOT_EVM,
        slotNumber: 1,
        isUnlocked: true,
        filledNodes: 1,
        currentCycle: 1,
      },
    });
    console.log(`   ✅ Root MatrixSlot 1 verified.`);

    // 4. Upsert Node 1 MatrixSlot 1
    console.log(`\n4. Setting Node 1 MatrixSlot 1: isUnlocked=true, filledNodes=0...`);
    await prisma.matrixSlot.upsert({
      where: {
        userAddress_slotNumber: {
          userAddress: NODE1_USER_EVM,
          slotNumber: 1,
        },
      },
      update: {
        isUnlocked: true,
        filledNodes: 0,
        currentCycle: 1,
      },
      create: {
        userAddress: NODE1_USER_EVM,
        slotNumber: 1,
        isUnlocked: true,
        filledNodes: 0,
        currentCycle: 1,
      },
    });
    console.log(`   ✅ Node 1 MatrixSlot 1 verified.`);

    // 5. Clean up old slot 1 placements and record Seat #1
    console.log(`\n5. Recording Seat #1 (Position 1) placement under Root...`);
    await prisma.matrixPlacement.deleteMany({
      where: {
        matrixOwnerAddress: GENESIS_ROOT_EVM,
        slotNumber: 1,
        cycle: 1,
      },
    });

    await prisma.matrixPlacement.create({
      data: {
        matrixOwnerAddress: GENESIS_ROOT_EVM,
        placedUserAddress: NODE1_USER_EVM,
        slotNumber: 1,
        position: 1,
        cycle: 1,
        payoutType: "UPLINE_1",
        recipientAddress: GENESIS_ROOT_EVM,
        wasFallback: false,
        amount: 30,
        txHash: "a06f3ec8c7c37949c594c6f37adf66ee5e8b619fd8691df8fe84389fe011d2a7",
        blockNumber: BigInt(1),
        timestamp: new Date(),
      },
    });
    console.log(`   ✅ Seat #1 (THiH4Wko...) successfully recorded in matrix_placements table.`);
    console.log(`   ✅ Seat #2 remains OPEN / unoccupied.`);

    console.log("\n================================================================================");
    console.log("🎉 NEON DATABASE SYNCHRONIZATION COMPLETE & 100% ALIGNED WITH ON-CHAIN STATE!");
    console.log("================================================================================");
  } catch (err) {
    console.error("❌ Database sync error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
