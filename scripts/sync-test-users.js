const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { PrismaClient } = require("../packages/database/src/generated/client");

const prisma = new PrismaClient();

async function sync() {
  console.log("═════════════════════════════════════════════════════════════════════");
  console.log("🗄️  SYNCING TEST USERS TO NEON CLOUD POSTGRES DATABASE");
  console.log("═════════════════════════════════════════════════════════════════════\n");

  const sponsor = {
    address: "THB9S4bRBzR6Zwt4fz3hAfi3TC3AC6pLhx",
    evm: "0x4f0ae492762d1ff9661ed5209f1058b98e3d8e8f",
    seat: 2,
    code: 39280,
  };

  const userA = {
    address: "TP6F8F4mjUkM1hWMetGSnYQY6twXTsbmq8",
    evm: "0x8fee51e0d60e1fa07f6e643f1802bfc4eeca24a6",
    seat: 3,
    code: 93703,
    sponsor: sponsor.address,
    daoTx: "0x6d84591dc98819cc54832a9140fe8e26ef8e77a873e7a61e2ce55bbae0de546d",
    matrixTx: "0x42a8ba66d1fb038dc85dc6a66c39669576b0dfe3cde913b57377d0ea63212def",
  };

  const userB = {
    address: "TMubf5EHwzjY1JAo68MQmU7Gqonb15bZDu",
    evm: "0x82f2c1e211905bdf75c363a6a6f5d99e9ac7095f",
    sponsor: userA.address,
    matrixTx: "0xc4afc0ca34e80093f9b4f4991e2cadc7d98912e136eb6d0d1fbf8d199a338791",
  };

  // 1. Update/Ensure Sponsor (Member 2)
  const dbSponsor = await prisma.user.upsert({
    where: { address: sponsor.address },
    update: {
      directReferralsCount: 1,
    },
    create: {
      address: sponsor.address,
      userId: 2,
      directReferralsCount: 1,
      registrationTimestamp: new Date(),
    },
  });
  console.log(`✅ Sponsor (Member 2) verified: ${dbSponsor.address} (ID: #${dbSponsor.userId})`);

  // 2. Upsert User A
  const dbUserA = await prisma.user.upsert({
    where: { address: userA.address },
    update: {
      sponsorAddress: sponsor.address,
      directReferralsCount: 1,
      txHash: userA.matrixTx,
    },
    create: {
      address: userA.address,
      userId: 108,
      sponsorAddress: sponsor.address,
      directReferralsCount: 1,
      registrationTimestamp: new Date(),
      txHash: userA.matrixTx,
    },
  });

  // Upsert User A DaoMember (Council Seat #3)
  await prisma.daoMember.upsert({
    where: { address: userA.address },
    update: {
      position: userA.seat,
      nftTokenId: userA.seat,
      status: "active",
      entryAmountUsdAtJoin: 300.00,
    },
    create: {
      address: userA.address,
      position: userA.seat,
      nftTokenId: userA.seat,
      entryAmountBtt: 5357.14,
      entryAmountUsdAtJoin: 300.00,
      joinedAt: new Date(),
      status: "active",
      txHash: userA.daoTx,
      blockNumber: 1000n,
    },
  });

  // Upsert User A MatrixProfile
  await prisma.matrixProfile.upsert({
    where: { userAddress: userA.address },
    update: {
      username: `Operative #${dbUserA.userId}`,
      teamCount: 1,
      directEarnings: 9.00,
      totalEarnings: 9.00,
      availableBalance: 9.00,
    },
    create: {
      userAddress: userA.address,
      username: `Operative #${dbUserA.userId}`,
      teamCount: 1,
      directEarnings: 9.00,
      totalEarnings: 9.00,
      availableBalance: 9.00,
    },
  });

  // Upsert User A MatrixSlot 1
  await prisma.matrixSlot.upsert({
    where: {
      userAddress_slotNumber: {
        userAddress: userA.address,
        slotNumber: 1,
      },
    },
    update: {
      isUnlocked: true,
      filledNodes: 1,
      totalEarned: 9.00,
      txHash: userA.matrixTx,
    },
    create: {
      userAddress: userA.address,
      slotNumber: 1,
      currentCycle: 1,
      recyclesCount: 0,
      filledNodes: 1,
      isUnlocked: true,
      totalEarned: 9.00,
      unlockedAt: new Date(),
      txHash: userA.matrixTx,
    },
  });

  console.log(`✅ User A Synced:`);
  console.log(`   Address:       ${dbUserA.address}`);
  console.log(`   User ID:       #${dbUserA.userId}`);
  console.log(`   Sponsor:       ${dbUserA.sponsorAddress} (Member 2)`);
  console.log(`   Council Seat:  #${userA.seat}`);
  console.log(`   Registry Code: #${userA.code}`);
  console.log(`   Matrix Slot 1: Unlocked, Node 1 filled`);

  // 3. Upsert User B
  const highestUser = await prisma.user.findFirst({
    orderBy: { userId: "desc" },
    select: { userId: true },
  });
  const nextUserId = (highestUser?.userId ?? 108) + 1;

  const dbUserB = await prisma.user.upsert({
    where: { address: userB.address },
    update: {
      sponsorAddress: userA.address,
      txHash: userB.matrixTx,
    },
    create: {
      address: userB.address,
      userId: nextUserId,
      sponsorAddress: userA.address,
      registrationTimestamp: new Date(),
      txHash: userB.matrixTx,
    },
  });

  // Upsert User B MatrixProfile
  await prisma.matrixProfile.upsert({
    where: { userAddress: userB.address },
    update: {
      username: `Operative #${dbUserB.userId}`,
    },
    create: {
      userAddress: userB.address,
      username: `Operative #${dbUserB.userId}`,
    },
  });

  // Upsert User B MatrixSlot 1
  await prisma.matrixSlot.upsert({
    where: {
      userAddress_slotNumber: {
        userAddress: userB.address,
        slotNumber: 1,
      },
    },
    update: {
      isUnlocked: true,
      txHash: userB.matrixTx,
    },
    create: {
      userAddress: userB.address,
      slotNumber: 1,
      currentCycle: 1,
      recyclesCount: 0,
      filledNodes: 0,
      isUnlocked: true,
      unlockedAt: new Date(),
      txHash: userB.matrixTx,
    },
  });

  // Upsert User B Placement on Node 1 of User A's Matrix Slot 1
  const existingPlacement = await prisma.matrixPlacement.findFirst({
    where: {
      matrixOwnerAddress: userA.address,
      slotNumber: 1,
      position: 1,
    },
  });

  if (!existingPlacement) {
    await prisma.matrixPlacement.create({
      data: {
        matrixOwnerAddress: userA.address,
        placedUserAddress: userB.address,
        slotNumber: 1,
        position: 1,
        cycle: 1,
        payoutType: "UPLINE_1",
        recipientAddress: sponsor.address,
        amount: 9.00,
        txHash: userB.matrixTx,
        blockNumber: 1005n,
        timestamp: new Date(),
      },
    });
  }

  console.log(`\n✅ User B Synced:`);
  console.log(`   Address:       ${dbUserB.address}`);
  console.log(`   User ID:       #${dbUserB.userId}`);
  console.log(`   Sponsor:       ${dbUserB.sponsorAddress} (User A!)`);
  console.log(`   Matrix Slot 1: Unlocked`);
  console.log(`   Placement:     Node 1 in User A's 14-node Tree`);

  // 4. Summarize Database
  const totalUsers = await prisma.user.count();
  const totalDaoMembers = await prisma.daoMember.count();
  const totalSlots = await prisma.matrixSlot.count();
  const totalPlacements = await prisma.matrixPlacement.count();

  console.log(`\n📊 Neon Postgres Summary:`);
  console.log(`   Total Users:        ${totalUsers}`);
  console.log(`   Total DAO Members:  ${totalDaoMembers}`);
  console.log(`   Total Matrix Slots: ${totalSlots}`);
  console.log(`   Total Placements:   ${totalPlacements}`);
  console.log("═════════════════════════════════════════════════════════════════════\n");

  await prisma.$disconnect();
}

sync().catch((err) => {
  console.error("❌ Sync failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
