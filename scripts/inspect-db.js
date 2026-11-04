const { prisma } = require("../packages/database");

async function main() {
  const users = await prisma.user.findMany();
  console.log(`\n=== USERS (${users.length}) ===`);
  for (const u of users) {
    console.log(`User ID: ${u.userId}, Address: ${u.address}, Sponsor: ${u.sponsorAddress}, Directs: ${u.directReferralsCount}`);
  }

  const slots = await prisma.matrixSlot.findMany();
  console.log(`\n=== MATRIX SLOTS (${slots.length}) ===`);
  for (const s of slots) {
    console.log(`Slot: ${s.slot}, User: ${s.userAddress}, Cycle: ${s.currentCycle}, Filled: ${s.filledNodesCount}`);
  }

  const placements = await prisma.matrixPlacement.findMany();
  console.log(`\n=== MATRIX PLACEMENTS (${placements.length}) ===`);
  for (const p of placements) {
    console.log(`BoardOwner: ${p.matrixOwnerAddress}, PlacedUser: ${p.placedUserAddress}, Pos: ${p.position}, Type: ${p.nodeType}, Recipient: ${p.payoutRecipient}`);
  }

  const txs = await prisma.matrixTransaction.findMany();
  console.log(`\n=== MATRIX TRANSACTIONS (${txs.length}) ===`);
  for (const t of txs) {
    console.log(`Tx: ${t.txHash}, Type: ${t.type}, From: ${t.fromAddress}, To: ${t.toAddress}, Amount: ${t.amountSun} SUN, Pos: ${t.nodePosition}`);
  }

  const poolSplits = await prisma.vaultDepositSplit.findMany();
  console.log(`\n=== VAULT DEPOSIT SPLITS (${poolSplits.length}) ===`);
  for (const ps of poolSplits) {
    console.log(`Depositor: ${ps.depositorAddress}, Amount: ${ps.totalAmountSun}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
