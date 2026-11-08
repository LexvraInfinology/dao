if (process.loadEnvFile) process.loadEnvFile();
const { PrismaClient } = require('../packages/database/dist/index.js');
const prisma = new PrismaClient();
const { ethers } = require('ethers');

const WALLET_ETH = '0x7124b32b48786a13177f3bdc9620e7a48eb9c902';
const SNAPSHOT_NODES = [
  '0x54Ee27d54Ec9c03b5Ed2f69960b175F34faCd696',
  '0xAa68f84FA17bB81FCc7da602472201b03B18B537',
  '0x5E2c744F6d8044c93dB7cA7972fd20662854004e',
  '0x679436d22E4126b5154a6e38116436751C6b4295',
  '0x428CbF56aEAC4fF470c94FB7FecE7C3A4AFCd970',
  '0x6672FE58f5E67E8A0498457f919dB48cBc0daeae',
  '0x2933086714b46c01B78bdE572dE1A9Ff934E43b6',
  '0xfA8360bA64A0F5C918A8dF21F6e0F110152D36DF',
  '0xd068801205Fcb85A10ab52E9920aa80e2F46120a',
  '0x37F2B18e308E9c6e0aeAD85066A342364b4e9819',
  '0x2e696A195834eD24dDE4e6312544349657fbE462',
  '0x15A91AAbF909E0d5ee3268A5400d5398D0fC4957',
  '0x8AC8910C00216940c6Bb308C35211F1CA9546511',
  '0xa43BcE85c3775cb68975Bd23D8b4a3C90bF1d579',
];

const PAYING_POSITIONS = [
  { pos: 3, member: SNAPSHOT_NODES[2], id: 4, code: 62166 },
  { pos: 6, member: SNAPSHOT_NODES[5], id: 83, code: 36753 },
  { pos: 8, member: SNAPSHOT_NODES[7], id: 121, code: 48417 },
  { pos: 9, member: SNAPSHOT_NODES[8], id: 195, code: 58787 },
  { pos: 11, member: SNAPSHOT_NODES[10], id: 200, code: 65361 },
  { pos: 12, member: SNAPSHOT_NODES[11], id: 205, code: 68682 },
];

async function sync() {
  console.log('--- STARTING NEON DATABASE SYNC FOR WALLET:', WALLET_ETH);

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Connected on attempt', attempt);
      break;
    } catch (err) {
      console.log(`Connection attempt ${attempt} failed: ${err.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // 1. If another user holds userId: 1, reassign it
  const existingUser1 = await prisma.user.findUnique({ where: { userId: 1 } });
  if (existingUser1 && existingUser1.address.toLowerCase() !== WALLET_ETH.toLowerCase()) {
    console.log(`Reassigning old test user #${existingUser1.id} from userId: 1 to userId: 990001`);
    await prisma.user.update({
      where: { id: existingUser1.id },
      data: { userId: 990001 },
    });
  }

  // 2. Ensure target user has userId: 1, 6 directs, qualified
  const user = await prisma.user.upsert({
    where: { address: WALLET_ETH },
    update: {
      userId: 1,
      directReferralsCount: 6,
      isQualified: true,
    },
    create: {
      address: WALLET_ETH,
      userId: 1,
      directReferralsCount: 6,
      isQualified: true,
      registrationTimestamp: new Date('2026-11-06T02:40:27.000Z'),
    },
  });
  console.log('✅ Target User record synced:', { address: user.address, userId: user.userId, directs: user.directReferralsCount });

  // 3. Upsert MatrixProfile
  const profile = await prisma.matrixProfile.upsert({
    where: { userAddress: WALLET_ETH },
    update: {
      totalEarnings: '5220.962752',
      directEarnings: '5220.962752',
      matrixEarnings: '5220.962752',
      availableBalance: '0',
      recyclesCount: 1,
      teamCount: 6,
    },
    create: {
      userAddress: WALLET_ETH,
      totalEarnings: '5220.962752',
      directEarnings: '5220.962752',
      matrixEarnings: '5220.962752',
      availableBalance: '0',
      recyclesCount: 1,
      teamCount: 6,
    },
  });
  console.log('✅ MatrixProfile synced:', { totalEarnings: profile.totalEarnings.toString(), recycles: profile.recyclesCount });

  // 4. Upsert MatrixSlots (Slot 1 and Slot 2)
  const slot1 = await prisma.matrixSlot.upsert({
    where: { userAddress_slotNumber: { userAddress: WALLET_ETH, slotNumber: 1 } },
    update: {
      currentCycle: 1,
      recyclesCount: 1,
      filledNodes: 2,
      isUnlocked: true,
      totalEarned: '5220.962752',
    },
    create: {
      userAddress: WALLET_ETH,
      slotNumber: 1,
      currentCycle: 1,
      recyclesCount: 1,
      filledNodes: 2,
      isUnlocked: true,
      totalEarned: '5220.962752',
    },
  });
  console.log('✅ Slot 1 synced:', { isUnlocked: slot1.isUnlocked, cycle: slot1.currentCycle, recycles: slot1.recyclesCount, filled: slot1.filledNodes });

  const slot2 = await prisma.matrixSlot.upsert({
    where: { userAddress_slotNumber: { userAddress: WALLET_ETH, slotNumber: 2 } },
    update: {
      currentCycle: 1,
      recyclesCount: 0,
      filledNodes: 0,
      isUnlocked: true,
      totalEarned: '0',
    },
    create: {
      userAddress: WALLET_ETH,
      slotNumber: 2,
      currentCycle: 1,
      recyclesCount: 0,
      filledNodes: 0,
      isUnlocked: true,
      totalEarned: '0',
    },
  });
  console.log('✅ Slot 2 synced:', { isUnlocked: slot2.isUnlocked, cycle: slot2.currentCycle, recycles: slot2.recyclesCount, filled: slot2.filledNodes });

  // 5. Upsert MatrixCycleEvent for Slot 1 snapshot 0 (14 nodes settled)
  await prisma.matrixCycleEvent.upsert({
    where: {
      userAddress_slotNumber_cycleNumber: {
        userAddress: WALLET_ETH,
        slotNumber: 1,
        cycleNumber: 1,
      },
    },
    update: {
      nodes: SNAPSHOT_NODES,
      completedAt: new Date('2026-11-07T10:30:42.000Z'),
      txHash: '0x' + ethers.keccak256(ethers.toUtf8Bytes(`slot1-cycle1-${WALLET_ETH}`)).slice(2),
      blockNumber: BigInt(2005432),
    },
    create: {
      userAddress: WALLET_ETH,
      slotNumber: 1,
      cycleNumber: 1,
      nodes: SNAPSHOT_NODES,
      completedAt: new Date('2026-11-07T10:30:42.000Z'),
      txHash: '0x' + ethers.keccak256(ethers.toUtf8Bytes(`slot1-cycle1-${WALLET_ETH}`)).slice(2),
      blockNumber: BigInt(2005432),
    },
  });
  console.log('✅ MatrixCycleEvent synced for Slot 1 Board 1 (14 nodes settled)');

  // 6. Sync exact transactions
  await prisma.matrixTransaction.deleteMany({ where: { userAddress: WALLET_ETH } });

  // Outflow 1: Slot 1 entry (-$30.00 USD)
  await prisma.matrixTransaction.create({
    data: {
      userAddress: WALLET_ETH,
      type: 'SLOT_PURCHASE',
      slotNumber: 1,
      cycle: 1,
      position: null,
      amount: '870.160458',
      amountUsd: '30.00',
      token: 'TROB',
      fromAddress: WALLET_ETH,
      toAddress: '0xb48f1e72c64b776ce5864df74926b3b935fef308',
      txHash: '0x' + ethers.keccak256(ethers.toUtf8Bytes(`slot1-entry-${WALLET_ETH}`)).slice(2),
      status: 'COMPLETED',
      description: 'Slot #01 Activation ($30.00 Tier)',
      timestamp: new Date('2026-11-06T02:40:27.000Z'),
    },
  });

  // Outflow 2: Slot 2 auto-progression upgrade (-$60.00 USD)
  await prisma.matrixTransaction.create({
    data: {
      userAddress: WALLET_ETH,
      type: 'UPGRADE_DEDUCTION',
      slotNumber: 2,
      cycle: 1,
      position: null,
      amount: '1740.320917',
      amountUsd: '60.00',
      token: 'TROB',
      fromAddress: WALLET_ETH,
      toAddress: '0xb48f1e72c64b776ce5864df74926b3b935fef308',
      txHash: '0x' + ethers.keccak256(ethers.toUtf8Bytes(`slot2-upgrade-${WALLET_ETH}`)).slice(2),
      status: 'COMPLETED',
      description: 'Slot #02 Automated Escalation ($60.00 Tier via P4+P5 Reserve)',
      timestamp: new Date('2026-11-07T10:30:42.000Z'),
    },
  });

  // 6 Inflows from the 6 paying seats (+$30.00 USD each = +$180.00 USD total)
  for (const p of PAYING_POSITIONS) {
    await prisma.matrixTransaction.create({
      data: {
        userAddress: WALLET_ETH,
        type: 'COMMISSION_EARNED',
        slotNumber: 1,
        cycle: 1,
        position: p.pos,
        amount: '870.160458',
        amountUsd: '30.00',
        token: 'TROB',
        fromAddress: p.member,
        toAddress: WALLET_ETH,
        txHash: '0x' + ethers.keccak256(ethers.toUtf8Bytes(`slot1-seat-${p.pos}-${WALLET_ETH}`)).slice(2),
        status: 'COMPLETED',
        description: `Direct 100% P2P Yield — Position #${p.pos} (Operative #${p.id})`,
        timestamp: new Date('2026-11-07T10:30:42.000Z'),
      },
    });
  }

  const txCount = await prisma.matrixTransaction.count({ where: { userAddress: WALLET_ETH } });
  console.log(`✅ MatrixTransactions synced: ${txCount} total (6 Inflows of $30 = $180.00 USD, 2 Outflows of -$30 and -$60 = -$90.00 USD, Net Profit = +$90.00 USD)`);

  console.log('\n--- NEON DATABASE SYNC COMPLETE ---');
}

sync()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
