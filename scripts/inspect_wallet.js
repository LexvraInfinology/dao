const { ethers } = require('ethers');
const { prisma } = require('../packages/database/dist/index.js');

const RPC_URL = 'https://fullnode-one.trobchain.com';
const WALLET_B58 = 'TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa';
const WALLET_ETH = '0x7124b32b48786a13177f3bdc9620e7a48eb9c902';
const WALLET_TRON = '417124b32b48786a13177f3bdc9620e7a48eb9c902';

const CONTRACTS = {
  matrix: '0xb48f1e72c64b776ce5864df74926b3b935fef308',
  token: '0xa667025dfad5636f4c92c26c60131ea052a34ede',
  registry: '0xd9b1ebced59d4899d306640718862e207dbfbb2a',
  vault: '0x6612ba87acbdcd645f039b80f3101935bc4ad9d8',
  salaryPool: '0x91fd22b491aa2fe8a6e4ab435113031ff84a9714',
  rewardPool: '0x120cd0d08658c3857b52733c730885bbed9a22e9',
  magicBoxPool: '0x2b23fe5b5fc7b3ef248dd6c95554d0ae74ca6afd',
  dao: '0x7816ae352da7d1a806eea8446aebbe551420429b',
};

async function callConstant(contractHex, functionSelector, parameter = "") {
  try {
    const cAddress = '41' + contractHex.slice(2).toLowerCase();
    const res = await fetch(`${RPC_URL}/wallet/triggerconstantcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: cAddress,
        contract_address: cAddress,
        function_selector: functionSelector,
        parameter: parameter,
        visible: false,
      }),
    });
    const json = await res.json();
    return json?.constant_result || [];
  } catch (err) {
    return [];
  }
}

const coder = new ethers.AbiCoder();
const paramAddress = coder.encode(['address'], [WALLET_ETH]).slice(2);

async function run() {
  console.log('================================================================');
  console.log('ON-CHAIN BLOCKCHAIN INSPECTION FOR WALLET:', WALLET_B58);
  console.log('Hex address:', WALLET_ETH);
  console.log('================================================================\n');

  // 1. REGISTRY CONTRACT
  console.log('--- 1. REGISTRY CONTRACT ---');
  const userRegChunks = await callConstant(CONTRACTS.registry, 'getUser(address)', paramAddress);
  if (userRegChunks && userRegChunks[0]) {
    const decoded = coder.decode(['bool', 'address', 'uint256', 'uint256', 'uint256', 'uint256'], '0x' + userRegChunks[0]);
    console.log('isRegistered:', decoded[0]);
    console.log('sponsor:', decoded[1]);
    console.log('regTime:', new Date(Number(decoded[2]) * 1000).toISOString());
    console.log('directsCount:', Number(decoded[3]));
    console.log('userId:', Number(decoded[4]));
    console.log('referralCode:', Number(decoded[5]));
  } else {
    console.log('getUser: No response');
  }

  // 2. MATRIX FINANCIALS & QUALIFICATION
  console.log('\n--- 2. MATRIX FINANCIALS & QUALIFICATION ---');
  const [qualChunks, directCountChunks, statsChunks, balChunks] = await Promise.all([
    callConstant(CONTRACTS.matrix, 'isMatrixQualified(address)', paramAddress),
    callConstant(CONTRACTS.matrix, 'getActiveDirectReferralsCount(address)', paramAddress),
    callConstant(CONTRACTS.matrix, 'totalEarned(address)', paramAddress),
    callConstant(CONTRACTS.matrix, 'userBalance(address)', paramAddress),
  ]);

  console.log('isMatrixQualified:', qualChunks[0] ? coder.decode(['bool'], '0x' + qualChunks[0])[0] : false);
  console.log('activeDirectsCount:', directCountChunks[0] ? Number(coder.decode(['uint256'], '0x' + directCountChunks[0])[0]) : 0);
  console.log('totalEarned (native SUN):', statsChunks[0] ? coder.decode(['uint256'], '0x' + statsChunks[0])[0].toString() : '0');
  const earnedTrob = statsChunks[0] ? Number(coder.decode(['uint256'], '0x' + statsChunks[0])[0]) / 1e6 : 0;
  console.log('totalEarned (TROB):', earnedTrob.toFixed(6));
  console.log('userBalance (native SUN):', balChunks[0] ? coder.decode(['uint256'], '0x' + balChunks[0])[0].toString() : '0');

  // 3. ALL 12 SLOTS STATUS
  console.log('\n--- 3. ALL 12 SLOTS STATUS ---');
  const allStatusChunks = await callConstant(CONTRACTS.matrix, 'getAllSlotsStatus(address)', paramAddress);
  const liveStatusChunks = await callConstant(CONTRACTS.matrix, 'getAllSlotsLiveStatus(address)', paramAddress);
  if (allStatusChunks && allStatusChunks[0]) {
    const decoded = coder.decode(['bool[12]', 'uint256[12]', 'uint256[12]'], '0x' + allStatusChunks[0]);
    const liveDecoded = liveStatusChunks[0] ? coder.decode(['bool[12]'], '0x' + liveStatusChunks[0])[0] : Array(12).fill(false);
    for (let i = 0; i < 12; i++) {
      console.log(`Slot #${String(i + 1).padStart(2, '0')}: unlocked=${decoded[0][i]}, live=${liveDecoded[i]}, cycle=${Number(decoded[1][i])}, filledNodes=${Number(decoded[2][i])}`);
    }
  }

  // 4. SLOT 1 DEEP INSPECTION
  console.log('\n--- 4. SLOT 1 DEEP INSPECTION ---');
  const s1Param = coder.encode(['address', 'uint256'], [WALLET_ETH, 1]).slice(2);
  const [s1DataChunks, s1SnapCountChunks] = await Promise.all([
    callConstant(CONTRACTS.matrix, 'getSlotDataV2(address,uint256)', s1Param),
    callConstant(CONTRACTS.matrix, 'getCycleSnapshotCount(address,uint256)', s1Param),
  ]);

  if (s1DataChunks && s1DataChunks[0]) {
    const s1d = coder.decode(['bool', 'bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + s1DataChunks[0]);
    console.log('Slot 1 Live Board: unlocked =', s1d[0], ', isLive =', s1d[1], ', currentCycle =', Number(s1d[2]), ', filledNodes =', Number(s1d[3]), ', slotEarned =', s1d[5].toString());
    console.log('Slot 1 Live Nodes (first 4):', s1d[4].slice(0, 4));
  }

  const s1SnapCount = s1SnapCountChunks[0] ? Number(coder.decode(['uint256'], '0x' + s1SnapCountChunks[0])[0]) : 0;
  console.log('Slot 1 Cycle Snapshot Count:', s1SnapCount);

  if (s1SnapCount > 0) {
    const snap0Param = coder.encode(['address', 'uint256', 'uint256'], [WALLET_ETH, 1, 0]).slice(2);
    const snap0Chunks = await callConstant(CONTRACTS.matrix, 'getCycleSnapshotDetail(address,uint256,uint256)', snap0Param);
    if (snap0Chunks && snap0Chunks[0]) {
      const snap0 = coder.decode(['uint256', 'address[14]', 'uint32[14]', 'uint256[14]', 'address[14]', 'uint8[14]', 'uint256'], '0x' + snap0Chunks[0]);
      console.log('Snapshot #0: cycleNumber =', Number(snap0[0]), ', completedAt =', new Date(Number(snap0[6]) * 1000).toISOString());
      console.log('Snapshot #0 Placed Nodes:');
      const payingIndices = [2, 5, 7, 8, 10, 11]; // Positions 3, 6, 8, 9, 11, 12
      for (let i = 0; i < 14; i++) {
        const isPaying = payingIndices.includes(i);
        console.log(`  Seat #${String(i + 1).padStart(2, '0')}: ${snap0[1][i]} | Code: ${Number(snap0[2][i])} | ID: ${Number(snap0[3][i])} | Payout: ${snap0[4][i]} (type ${Number(snap0[5][i])}) ${isPaying ? '<-- PAID YOU $30' : ''}`);
      }
    }
  }

  // 5. SLOT 2 DEEP INSPECTION
  console.log('\n--- 5. SLOT 2 DEEP INSPECTION ---');
  const s2Param = coder.encode(['address', 'uint256'], [WALLET_ETH, 2]).slice(2);
  const [s2DataChunks, s2SnapCountChunks] = await Promise.all([
    callConstant(CONTRACTS.matrix, 'getSlotDataV2(address,uint256)', s2Param),
    callConstant(CONTRACTS.matrix, 'getCycleSnapshotCount(address,uint256)', s2Param),
  ]);

  if (s2DataChunks && s2DataChunks[0]) {
    const s2d = coder.decode(['bool', 'bool', 'uint256', 'uint256', 'address[14]', 'uint256'], '0x' + s2DataChunks[0]);
    console.log('Slot 2 Live Board:');
    console.log('  isUnlocked:', s2d[0]);
    console.log('  isLive:', s2d[1]);
    console.log('  currentCycle:', Number(s2d[2]));
    console.log('  filledNodes:', Number(s2d[3]));
    console.log('  slotEarned:', s2d[5].toString());
    console.log('  nodes (all 14):', s2d[4]);
  }

  // 6. PROTOCOL POOLS BALANCES ON-CHAIN
  console.log('\n--- 6. PROTOCOL POOLS ON-CHAIN STATUS ---');
  for (const [name, addr] of Object.entries(CONTRACTS)) {
    const balChunks = await callConstant(CONTRACTS.token, 'balanceOf(address)', coder.encode(['address'], [addr]).slice(2));
    const tokenBal = balChunks[0] ? Number(coder.decode(['uint256'], '0x' + balChunks[0])[0]) / 1e6 : 0;
    console.log(`Pool/Contract ${name} (${addr}): ${tokenBal.toFixed(2)} TROB`);
  }

  // 7. NEON POSTGRES DATABASE TABLES INSPECTION
  console.log('\n--- 7. NEON POSTGRES DATABASE TABLES INSPECTION ---');
  try {
    const [dbUser, dbProfile, dbSlots, dbPlacements, dbTxs, dbPoolCards] = await Promise.all([
      prisma.user.findUnique({ where: { address: WALLET_ETH } }).catch((e) => ({ error: e.message })),
      prisma.matrixProfile.findUnique({ where: { userAddress: WALLET_ETH } }).catch((e) => ({ error: e.message })),
      prisma.matrixSlot.findMany({ where: { userAddress: WALLET_ETH } }).catch((e) => ({ error: e.message })),
      prisma.matrixPlacement.findMany({ where: { matrixOwnerAddress: WALLET_ETH } }).catch((e) => ({ error: e.message })),
      prisma.matrixTransaction.findMany({ where: { userAddress: WALLET_ETH } }).catch((e) => ({ error: e.message })),
      prisma.poolCard.findMany().catch((e) => ({ error: e.message })),
    ]);

    console.log('DB User record:', dbUser ? { id: dbUser.id, userId: dbUser.userId, sponsorAddress: dbUser.sponsorAddress, directsCount: dbUser.directReferralsCount, isQualified: dbUser.isQualified } : 'Not found');
    console.log('DB MatrixProfile:', dbProfile ? { highestUnlockedSlot: dbProfile.highestUnlockedSlot, totalEarningsUsd: dbProfile.totalEarningsUsd, totalEarningsTrob: dbProfile.totalEarningsTrob, availableBalance: dbProfile.availableBalance } : 'Not found');
    console.log('DB MatrixSlots count:', Array.isArray(dbSlots) ? dbSlots.length : dbSlots);
    if (Array.isArray(dbSlots)) {
      dbSlots.forEach(s => console.log(`  Slot #${s.slotNumber}: isUnlocked=${s.isUnlocked}, isLive=${s.isLive}, cycle=${s.currentCycle}, filledNodes=${s.filledNodes}, earnedUsd=${s.totalEarnedUsd}`));
    }
    console.log('DB Placements count:', Array.isArray(dbPlacements) ? dbPlacements.length : dbPlacements);
    console.log('DB MatrixTransactions count:', Array.isArray(dbTxs) ? dbTxs.length : dbTxs);
    if (Array.isArray(dbTxs)) {
      dbTxs.forEach(t => console.log(`  Tx ${t.type}: amount=${t.amount}, usd=${t.amountUsd}, trob=${t.trobAmount}, from=${t.fromAddress}, txHash=${t.txHash}`));
    }
    console.log('DB PoolCards count:', Array.isArray(dbPoolCards) ? dbPoolCards.length : dbPoolCards);
    if (Array.isArray(dbPoolCards)) {
      dbPoolCards.forEach(c => console.log(`  Card ${c.poolId || c.title}: ${c.amountTrob || c.amountUsd || c.balanceTrob}`));
    }
    await prisma.$disconnect();
  } catch (err) {
    console.log('DB Inspection notice:', err.message);
  }

  console.log('\n================================================================');
  console.log('INSPECTION COMPLETE');
  console.log('================================================================');
}

run().catch(console.error);