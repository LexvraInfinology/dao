const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database/src/generated/client'));

const prisma = new PrismaClient();

const GENESIS_ROOT_EVM = '0x7124b32b48786a13177f3bdc9620e7a48eb9c902'; // TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa
const START_BLOCK = 2099700n; // Testnet block right before contract deployments

async function main() {
  console.log('===============================================================');
  console.log('STARTING 100% FRESH DATABASE RESET FOR TROBCHAIN TESTNET');
  console.log('===============================================================\n');

  // 1. Truncate / delete all dependent tables first
  console.log('1. Clearing all Matrix tables...');
  await prisma.matrixPlacement.deleteMany({});
  await prisma.matrixCycleEvent.deleteMany({});
  await prisma.matrixTransaction.deleteMany({});
  await prisma.matrixActivity.deleteMany({});
  await prisma.matrixSlot.deleteMany({});
  await prisma.matrixProfile.deleteMany({});
  await prisma.matrixSettings.deleteMany({});

  console.log('2. Clearing all DAO & Governance tables...');
  await prisma.daoVote.deleteMany({});
  await prisma.daoProposal.deleteMany({});
  await prisma.daoEvent.deleteMany({});
  await prisma.daoMember.deleteMany({});
  await prisma.pullFallbackClaim.deleteMany({});

  console.log('3. Clearing Financials & Aux tables...');
  await prisma.withdrawal.deleteMany({});
  await prisma.vestingLock.deleteMany({});
  await prisma.nftBadge.deleteMany({});
  await prisma.authNonce.deleteMany({});
  await prisma.leaderboardSnapshot.deleteMany({});
  await prisma.userSettings.deleteMany({});

  console.log('4. Clearing Users...');
  await prisma.user.deleteMany({});

  console.log('5. Resetting Indexer Cursor to start block #2099700...');
  await prisma.indexerCursor.deleteMany({});
  
  // Set indexer cursor for each contract so it indexes from deployment block
  const chainId = 1001;
  const contracts = [
    'EquoraRegistry',
    'EquoraMatrix',
    'EquoraDAO',
    'EquoraVault',
    'EquoraRoyaltyPool',
    'EquoraRewardPool',
    'EquoraMagicBox'
  ];

  for (const c of contracts) {
    await prisma.indexerCursor.upsert({
      where: {
        contractName_chainId: {
          contractName: c,
          chainId: chainId,
        }
      },
      update: {
        lastIndexedBlock: START_BLOCK,
        lastIndexedBlockHash: null,
      },
      create: {
        contractName: c,
        chainId: chainId,
        lastIndexedBlock: START_BLOCK,
        lastIndexedBlockHash: null,
      }
    });
  }

  // 6. Reset DaoInstance
  try {
    await prisma.daoInstance.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        capacity: 100,
        isClosed: false,
        totalDistributedBtt: 0,
        distributionMode: 'push_with_pull_fallback'
      },
      update: {
        capacity: 100,
        isClosed: false,
        totalDistributedBtt: 0,
        closedAt: null
      }
    });
  } catch (e) {
    console.log('DaoInstance note:', e.message);
  }

  // 7. Seed Genesis Root User (#1)
  console.log('6. Seeding Genesis Root Apex User (#1)...');
  await prisma.user.create({
    data: {
      address: GENESIS_ROOT_EVM,
      userId: 1,
      sponsorAddress: null,
      directReferralsCount: 0,
      isQualified: true,
      registrationTimestamp: new Date(),
    }
  });

  // Seed Genesis Root Slot 1
  await prisma.matrixSlot.create({
    data: {
      userAddress: GENESIS_ROOT_EVM,
      slotNumber: 1,
      currentCycle: 1,
      recyclesCount: 0,
      filledNodes: 0,
      isUnlocked: true,
      upgradeReserve: 0,
      totalEarned: 0,
      unlockedAt: new Date()
    }
  });

  // Seed Genesis Root Profile & Settings
  await prisma.matrixProfile.create({
    data: {
      userAddress: GENESIS_ROOT_EVM,
      username: 'Genesis Apex #1',
      totalEarnings: 0,
      availableBalance: 0,
      withdrawnTotal: 0,
    }
  });

  await prisma.matrixSettings.create({
    data: {
      userAddress: GENESIS_ROOT_EVM,
      autoUpgrade: true,
      autoReinvest: true,
      soundEffects: true,
      theme: 'dark',
    }
  });

  console.log('\n===============================================================');
  console.log('DATABASE RESET COMPLETE & 100% FRESH!');
  console.log(`Genesis Root Seated: ${GENESIS_ROOT_EVM}`);
  console.log(`Slot 1 Status:       Active & Unlocked`);
  console.log(`Seats 1 to 14:       100% EMPTY & OPEN FOR FRESH IDS`);
  console.log(`Indexer Block:       Starting at #${START_BLOCK}`);
  console.log('===============================================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
