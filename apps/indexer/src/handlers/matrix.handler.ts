import prisma from "@equora/database";
import { formatUnits } from "viem";

// PayoutType enum — index must match EquoraMatrix.sol V2 enum order
const PAYOUT_TYPE_NAMES = [
  "UPLINE_1",            // 0
  "UPLINE_2",            // 1
  "OWNER_DIRECT",        // 2
  "UPGRADE_RESERVE",     // 3
  "AUTO_UPGRADE",        // 4
  "SPILLOVER_DOWNLINE1", // 5
  "SPILLOVER_DOWNLINE2", // 6
  "RECYCLE_SPONSOR",     // 7
  "DAO_POOL",            // 8
  "RANK_POOL",           // 9
  "CYCLE_COMPLETE",      // 10
] as const;

function payoutTypeName(index: number): string {
  return PAYOUT_TYPE_NAMES[index] ?? `UNKNOWN_${index}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SlotJoined
// ─────────────────────────────────────────────────────────────────────────────

export async function handleSlotJoined(event: {
  user: string;
  slot: bigint;
  cost: bigint;
  sponsor: string;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const user = event.user.toLowerCase();
  const slotNumber = Number(event.slot);
  const joinDate = new Date(Number(event.timestamp) * 1000);

  await prisma.matrixSlot.upsert({
    where: { userAddress_slotNumber: { userAddress: user, slotNumber } },
    create: {
      userAddress: user,
      slotNumber,
      isUnlocked: true,
      currentCycle: 1,
      filledNodes: 0,
      unlockedAt: joinDate,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
    update: {
      isUnlocked: true,
      unlockedAt: joinDate,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
  });

  console.log(`[Matrix] Slot#${slotNumber} unlocked by ${user}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PositionFilled — V2 (replaces NodeFilled)
// Updates the matrix slot filledNodes counter for grid display
// ─────────────────────────────────────────────────────────────────────────────

export async function handlePositionFilled(event: {
  matrixOwner: string;
  participant: string;
  slot: number;
  cycle: bigint;
  position: number;
  amount: bigint;
  txHash: string;
  blockNumber: bigint;
  timestamp: bigint;
}) {
  const matrixOwner = event.matrixOwner.toLowerCase();
  const slotNumber = event.slot;
  const cycle = Number(event.cycle);

  await prisma.matrixSlot.upsert({
    where: { userAddress_slotNumber: { userAddress: matrixOwner, slotNumber } },
    create: {
      userAddress: matrixOwner,
      slotNumber,
      isUnlocked: true,
      currentCycle: cycle,
      filledNodes: event.position,
    },
    update: {
      filledNodes: event.position,
      currentCycle: cycle,
    },
  });

  console.log(`[Matrix] P${event.position} Slot#${slotNumber} Cycle#${cycle} for ${matrixOwner}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DistributionExecuted — V2 financial audit event
// One event per money movement. Creates MatrixPlacement record.
// ─────────────────────────────────────────────────────────────────────────────

export async function handleDistributionExecuted(event: {
  recipient: string;
  amount: bigint;
  payoutTypeIndex: number;
  slot: number;
  cycle: bigint;
  position: number;
  matrixOwner: string;
  participant: string;
  wasFallback: boolean;
  txHash: string;
  blockNumber: bigint;
  timestamp: bigint;
}) {
  const matrixOwner = event.matrixOwner.toLowerCase();
  const participant = event.participant.toLowerCase();
  const recipient = event.recipient.toLowerCase();
  const slotNumber = event.slot;
  const cycle = Number(event.cycle);
  const payoutType = payoutTypeName(event.payoutTypeIndex);
  const amountDecimal = parseFloat(formatUnits(event.amount, 18));
  const eventDate = new Date(Number(event.timestamp) * 1000);

  // Insert full audit record
  await prisma.matrixPlacement.create({
    data: {
      matrixOwnerAddress: matrixOwner,
      placedUserAddress: participant,
      slotNumber,
      position: event.position,
      cycle,
      payoutType,
      recipientAddress: recipient,
      wasFallback: event.wasFallback,
      amount: amountDecimal,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
      timestamp: eventDate,
    },
  });

  // For owner direct income, track totalEarned on slot
  const ownerIncomeTypes = ["OWNER_DIRECT", "SPILLOVER_DOWNLINE1", "SPILLOVER_DOWNLINE2"];
  if (ownerIncomeTypes.includes(payoutType) && recipient === matrixOwner) {
    await prisma.matrixSlot.upsert({
      where: { userAddress_slotNumber: { userAddress: matrixOwner, slotNumber } },
      create: { userAddress: matrixOwner, slotNumber, isUnlocked: true, currentCycle: cycle, filledNodes: 0, totalEarned: amountDecimal },
      update: { totalEarned: { increment: amountDecimal } },
    });
  }

  // Track upgrade reserve accumulation
  if (payoutType === "UPGRADE_RESERVE") {
    await prisma.matrixSlot.upsert({
      where: { userAddress_slotNumber: { userAddress: matrixOwner, slotNumber } },
      create: { userAddress: matrixOwner, slotNumber, isUnlocked: true, currentCycle: cycle, filledNodes: 0, upgradeReserve: amountDecimal },
      update: { upgradeReserve: { increment: amountDecimal } },
    });
  }

  console.log(`[Matrix] ${payoutType} P${event.position} Slot#${slotNumber}/${cycle} -> ${recipient} ${amountDecimal}${event.wasFallback ? " [FALLBACK]" : ""}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CycleCompleted — permanent cycle snapshot + slot reset
// ─────────────────────────────────────────────────────────────────────────────

export async function handleCycleCompleted(event: {
  user: string;
  slot: number;
  cycleNumber: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const user = event.user.toLowerCase();
  const slotNumber = event.slot;
  const cycleNumber = Number(event.cycleNumber);
  const cycleDate = new Date(Number(event.timestamp) * 1000);

  // Create permanent, immutable cycle snapshot (upsert guards against duplicates on reindex)
  await prisma.matrixCycleEvent.upsert({
    where: { userAddress_slotNumber_cycleNumber: { userAddress: user, slotNumber, cycleNumber } },
    create: {
      userAddress: user,
      slotNumber,
      cycleNumber,
      nodes: [],
      completedAt: cycleDate,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
    update: { completedAt: cycleDate },
  });

  // Reset slot state for next cycle
  await prisma.matrixSlot.update({
    where: { userAddress_slotNumber: { userAddress: user, slotNumber } },
    data: { currentCycle: cycleNumber + 1, filledNodes: 0, upgradeReserve: 0 },
  }).catch(() => {}); // safe if slot not yet indexed

  console.log(`[Matrix] Cycle#${cycleNumber} completed Slot#${slotNumber} for ${user}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SlotAutoUpgraded — new slot unlocked via reserve
// ─────────────────────────────────────────────────────────────────────────────

export async function handleSlotAutoUpgraded(event: {
  user: string;
  fromSlot: number;
  toSlot: number;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const user = event.user.toLowerCase();
  const upgradeDate = new Date(Number(event.timestamp) * 1000);

  await prisma.matrixSlot.upsert({
    where: { userAddress_slotNumber: { userAddress: user, slotNumber: event.toSlot } },
    create: {
      userAddress: user,
      slotNumber: event.toSlot,
      isUnlocked: true,
      currentCycle: 1,
      filledNodes: 0,
      unlockedAt: upgradeDate,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
    update: { isUnlocked: true, unlockedAt: upgradeDate },
  });

  console.log(`[Matrix] Auto-upgrade Slot#${event.fromSlot} -> Slot#${event.toSlot} for ${user}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DaoPoolFunded — V2 DAO accumulator event
// ─────────────────────────────────────────────────────────────────────────────

export async function handleDaoPoolFunded(event: {
  amount: bigint;
  newAccRewardPerShare: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const amountDecimal = parseFloat(formatUnits(event.amount, 18));
  // bigint -> string so Prisma Decimal field accepts it
  const accStr = event.newAccRewardPerShare.toString();

  await prisma.$transaction([
    prisma.daoPoolState.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        accRewardPerShare: accStr,
        totalDeposited: amountDecimal,
      },
      update: {
        accRewardPerShare: accStr,
        totalDeposited: { increment: amountDecimal },
      },
    }),
    prisma.daoPoolEvent.create({
      data: {
        eventType: "FUNDED",
        amount: amountDecimal,
        accRewardPerShareAfter: accStr,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
    }),
  ]);

  console.log(`[DAO Pool] Funded +${amountDecimal} BTT`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DaoRewardClaimed — member claims DAO pool rewards
// ─────────────────────────────────────────────────────────────────────────────

export async function handleDaoRewardClaimed(event: {
  member: string;
  amount: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const member = event.member.toLowerCase();
  const amountDecimal = parseFloat(formatUnits(event.amount, 18));

  // Run state update separately (may not exist yet) then insert event
  await prisma.daoPoolState.update({
    where: { id: 1 },
    data: { totalClaimed: { increment: amountDecimal } },
  }).catch(() => {});

  await prisma.daoPoolEvent.create({
    data: {
      eventType: "CLAIMED",
      walletAddress: member,
      amount: amountDecimal,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
  });

  console.log(`[DAO Pool] Claimed ${amountDecimal} BTT by ${member}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// RankPoolFunded — V2 rank pool event
// ─────────────────────────────────────────────────────────────────────────────

export async function handleRankPoolFunded(event: {
  amount: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const amountDecimal = parseFloat(formatUnits(event.amount, 18));

  await prisma.rankPoolEvent.create({
    data: {
      eventType: "FUNDED",
      amount: amountDecimal,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
  });

  console.log(`[Rank Pool] Funded +${amountDecimal} BTT`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MagicBoxUnlocked — rank milestone
// ─────────────────────────────────────────────────────────────────────────────

export async function handleMagicBoxUnlocked(event: {
  user: string;
  slot: bigint;
  rank: number;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const user = event.user.toLowerCase();
  const rank = Number(event.rank);
  const slotNumber = Number(event.slot);
  const unlockDate = new Date(Number(event.timestamp) * 1000);

  const poolNames: Record<number, string> = {
    1: "ALPHA",
    2: "PRIME",
    3: "ELITE",
    4: "CROWN",
  };
  const tierName = poolNames[rank] ?? `TIER_${rank}`;

  await prisma.$transaction([
    prisma.nftBadge.upsert({
      where: { userAddress_tokenId: { userAddress: user, tokenId: rank } },
      create: { userAddress: user, tokenId: rank, rank, mintedAt: unlockDate, txHash: event.txHash },
      update: { rank, mintedAt: unlockDate, txHash: event.txHash },
    }),
    prisma.poolCard.upsert({
      where: { userAddress_tier: { userAddress: user, tier: rank } },
      create: {
        userAddress: user,
        tier: rank,
        tierName,
        unlockedAt: unlockDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
      update: {
        tierName,
        unlockedAt: unlockDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
    }),
    prisma.vestingLock.create({
      data: {
        userAddress: user,
        amount: 1,
        milestoneSlot: slotNumber,
        lockedAt: unlockDate,
        unlockTimestamp: new Date(unlockDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000),
        isClaimed: false,
        txHash: event.txHash,
      },
    }),
  ]);

  console.log(`[MagicBox] ${tierName} Pool Card (Rank#${rank}) Slot#${slotNumber} for ${user}`);
}

