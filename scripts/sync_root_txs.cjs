const path = require("path");
const { PrismaClient } = require(path.resolve(__dirname, "../packages/database/src/generated/client"));
const prisma = new PrismaClient();

async function syncRootTransactions() {
  const root = "0x5fd6266a07fa4ba10dd34e9a315edd47904b8823";

  // Ensure Root user exists
  await prisma.user.upsert({
    where: { address: root },
    create: {
      address: root,
      userId: 1,
      registrationTimestamp: new Date("2026-11-02T07:22:59Z")
    },
    update: {}
  });

  // Ensure MatrixProfile exists with real earned balance
  await prisma.matrixProfile.upsert({
    where: { userAddress: root },
    create: {
      userAddress: root,
      username: "Operative #96422",
      totalEarnings: 3227.954674,
      availableBalance: 3227.954674,
      directEarnings: 3227.954674,
      matrixEarnings: 0
    },
    update: {
      totalEarnings: 3227.954674,
      availableBalance: 3227.954674,
      directEarnings: 3227.954674
    }
  });

  const txsToInsert = [
    {
      id: "tx-payout-59cc97",
      userAddress: root,
      type: "COMMISSION_EARNED",
      slotNumber: 1,
      cycle: 1,
      position: 1,
      amount: "1153.446884",
      amountUsd: "30.00",
      token: "TROB",
      fromAddress: "0xc6E5dd575b8F424dFBEc616A9C81214d66aAb08f",
      toAddress: root,
      txHash: "59cc97a07891a0066991206952ba71b0f99c8a2e110b5dedac626c310f9b398d",
      status: "COMPLETED",
      description: "Level 1 Pass-Up Commission from Direct 1's Member (Position P1)",
      timestamp: new Date("2026-11-02T10:06:38Z")
    },
    {
      id: "tx-payout-f09710",
      userAddress: root,
      type: "COMMISSION_EARNED",
      slotNumber: 1,
      cycle: 1,
      position: 1,
      amount: "921.149595",
      amountUsd: "30.00",
      token: "TROB",
      fromAddress: "0xabbcc8bcd39cec1139c4ac9ddb8f20163a5510a7",
      toAddress: root,
      txHash: "f097102263d47691dff003ba180c36d04f88762336fc1f67ae67cd1dc79ba87e",
      status: "COMPLETED",
      description: "Level 1 Pass-Up Commission from Direct 2's Member (Position P1)",
      timestamp: new Date("2026-11-02T08:06:19Z")
    },
    {
      id: "tx-payout-0b11ae",
      userAddress: root,
      type: "COMMISSION_EARNED",
      slotNumber: 1,
      cycle: 1,
      position: 2,
      amount: "1153.358195",
      amountUsd: "30.00",
      token: "TROB",
      fromAddress: "0xed854e4a402958f90f9dd9a15ac90618b37f9051",
      toAddress: root,
      txHash: "0b11aecd3fcb52de175864c6ce664e7ecdd2b24c054a04f3737f4e267c808760",
      status: "COMPLETED",
      description: "Level 2 Upline P2P Settlement from Member #84013 (TXd6q...)",
      timestamp: new Date("2026-11-02T10:23:55Z")
    }
  ];

  for (const t of txsToInsert) {
    await prisma.matrixTransaction.upsert({
      where: { id: t.id },
      create: t,
      update: t
    });
  }

  console.log("Successfully synced real on-chain transactions for Root into Database!");
}

syncRootTransactions().catch(console.error).finally(() => prisma.$disconnect());

