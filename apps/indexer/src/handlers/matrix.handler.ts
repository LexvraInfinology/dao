import prisma from "@equora/database";
import { formatUnits } from "viem";

// PayoutType enum — index must match EquoraMatrix.sol V3 enum order:
// enum PayoutType { UPLINE_1, UPLINE_2, OWNER_DIRECT, PROTOCOL_POOL, SPILLOVER_DOWNLINE1, SPILLOVER_DOWNLINE2, CYCLE_COMPLETE }
const PAYOUT_TYPE_NAMES = [
  "UPLINE_1",            // 0
  "UPLINE_2",            // 1
  "OWNER_DIRECT",        // 2
  "PROTOCOL_POOL",       // 3
  "SPILLOVER_DOWNLINE1", // 4
  "SPILLOVER_DOWNLINE2", // 5
  "CYCLE_COMPLETE",      // 6
] as const;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function normalizeHexAddress(addr?: string | null): string {
  if (!addr) return ZERO_ADDRESS;
  const c = addr.trim().toLowerCase();
  if (c.startsWith("0x") && c.length === 42) return c;
  if (c.startsWith("41") && c.length === 42) return `0x${c.slice(2)}`;
  return c;
}

function isProtocolVaultAddress(addr: string): boolean {
  const canonical = addr.toLowerCase();
  const knownVaults = new Set(
    [
      "0x6612ba87acbdcd645f039b80f3101935bc4ad9d8", // Mainnet ProtocolVault
      normalizeHexAddress(process.env.VAULT_ADDRESS),
      normalizeHexAddress(process.env.NEXT_PUBLIC_VAULT_ADDRESS),
      normalizeHexAddress(process.env.NEXT_PUBLIC_VAULT_HEX),
      ZERO_ADDRESS,
    ].filter((a) => a && a.startsWith("0x"))
  );
  return canonical.includes("vault") || knownVaults.has(canonical);
}

/**
 * Resolve or ensure User FK exists using on-chain EquoraRegistry ID when missing,
 * without inventing sequential fake user IDs.
 */
async function ensureRegisteredUser(canonicalAddress: string, timestampSec: number): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { address: canonicalAddress } });
  if (existing) return true;

  try {
    const isMainnet = process.env.IS_MAINNET !== "false" && process.env.NEXT_PUBLIC_IS_MAINNET !== "false";
    const fullnode =
      process.env.FULLNODE_URL ||
      process.env.RPC_URL ||
      (isMainnet ? "https://fullnode-one.trobchain.com" : "https://fullnode-one-testnet.trobchain.com");
    const registryHex = (
      process.env.NEXT_PUBLIC_REGISTRY_HEX ||
      process.env.REGISTRY_HEX ||
      "41d9b1ebced59d4899d306640718862e207dbfbb2a"
    )
      .replace(/^0x/i, "41")
      .toLowerCase();

    const paddedAddr = canonicalAddress.replace(/^0x/i, "").padStart(64, "0");
    const res = await fetch(`${fullnode}/wallet/triggerconstantcontract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_address: registryHex,
        contract_address: registryHex,
        function_selector: "getUserInfo(address)",
        parameter: paddedAddr,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as any;
      const raw = json?.constant_result?.[0] || "";
      if (raw.length >= 256) {
        const userId = Number(BigInt("0x" + raw.slice(0, 64)));
        const sponsorHex = "0x" + raw.slice(88, 128).toLowerCase();
        const regTs = Number(BigInt("0x" + raw.slice(128, 192)));
        const registered = BigInt("0x" + raw.slice(192, 256)) !== 0n;
        if (registered && userId > 0) {
          const sponsor = sponsorHex !== ZERO_ADDRESS ? sponsorHex : null;
          await prisma.user.upsert({
            where: { address: canonicalAddress },
            create: {
              address: canonicalAddress,
              userId,
              sponsorAddress: sponsor,
              registrationTimestamp: new Date((regTs > 0 ? regTs : timestampSec) * 1000),
              directReferralsCount: 0,
              isQualified: false,
            },
            update: {
              userId,
              ...(sponsor ? { sponsorAddress: sponsor } : {}),
            },
          });
          return true;
        }
      }
    }
  } catch (err) {
    console.warn(`[Matrix] Registry lookup failed for ${canonicalAddress}:`, (err as Error)?.message || err);
  }
  return false;
}

function payoutTypeName(index: number): string {
  return PAYOUT_TYPE_NAMES[index] ?? `UNKNOWN_${index}`;
}

function formatTokenUnits(amount: bigint): number {
  if (amount >= BigInt("100000000000000")) {
    return parseFloat(formatUnits(amount, 18));
  }
  return parseFloat(formatUnits(amount, 6));
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
  const user = normalizeHexAddress(event.user);
  const slotNumber = Number(event.slot);
  const tsSec = Number(event.timestamp);
  const joinDate = new Date(tsSec * 1000);
  const costDecimal = formatTokenUnits(event.cost);

  await ensureRegisteredUser(user, tsSec);

  const existingSlot = await prisma.matrixSlot.findUnique({
    where: { userAddress_slotNumber: { userAddress: user, slotNumber } },
  });

  if (!existingSlot) {
    await prisma.matrixSlot.create({
      data: {
        userAddress: user,
        slotNumber,
        isUnlocked: true,
        currentCycle: 1,
        filledNodes: 0,
        unlockedAt: joinDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
    }).catch(() => {});
  } else if (!existingSlot.isUnlocked) {
    await prisma.matrixSlot.update({
      where: { userAddress_slotNumber: { userAddress: user, slotNumber } },
      data: {
        isUnlocked: true,
        unlockedAt: joinDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
    }).catch(() => {});
  }

  // Idempotently record out-of-pocket entry purchase ($30 for Slot 1; $0 for auto-unlocked tiers)
  const existingPurchase = await prisma.matrixTransaction.findFirst({
    where: {
      userAddress: user,
      type: "SLOT_PURCHASE",
      slotNumber,
      txHash: event.txHash,
    },
  });
  if (!existingPurchase) {
    const sponsorAddr = normalizeHexAddress(event.sponsor);
    await prisma.matrixTransaction.create({
      data: {
        userAddress: user,
        type: "SLOT_PURCHASE",
        slotNumber,
        cycle: 1,
        amount: costDecimal,
        amountUsd: slotNumber === 1 ? 30 : 0,
        fromAddress: user,
        toAddress: sponsorAddr !== ZERO_ADDRESS ? sponsorAddr : null,
        status: "COMPLETED",
        txHash: event.txHash,
        timestamp: joinDate,
        description:
          slotNumber === 1
            ? "Matrix Slot #01 Activation ($30.00 USD lifetime entry)"
            : `Matrix Slot #${String(slotNumber).padStart(2, "0")} Activation`,
      },
    }).catch(() => {});
  }

  console.log(`[Matrix] Slot#${slotNumber} unlocked by ${user}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PositionFilled — V2/V3
// Updates the matrix slot filledNodes counter monotonically per cycle
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
  const matrixOwner = normalizeHexAddress(event.matrixOwner);
  const slotNumber = event.slot;
  const cycle = Number(event.cycle);

  await ensureRegisteredUser(matrixOwner, Number(event.timestamp));

  const existing = await prisma.matrixSlot.findUnique({
    where: { userAddress_slotNumber: { userAddress: matrixOwner, slotNumber } },
  });

  if (!existing) {
    await prisma.matrixSlot.create({
      data: {
        userAddress: matrixOwner,
        slotNumber,
        isUnlocked: true,
        currentCycle: cycle,
        filledNodes: event.position,
      },
    }).catch(() => {});
  } else if (
    cycle > existing.currentCycle ||
    (cycle === existing.currentCycle && event.position > existing.filledNodes)
  ) {
    await prisma.matrixSlot.update({
      where: { userAddress_slotNumber: { userAddress: matrixOwner, slotNumber } },
      data: {
        filledNodes: event.position,
        currentCycle: cycle,
      },
    }).catch(() => {});
  }

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
  const matrixOwner = normalizeHexAddress(event.matrixOwner);
  const participant = normalizeHexAddress(event.participant);
  const recipient = normalizeHexAddress(event.recipient);
  const slotNumber = event.slot;
  const cycle = Number(event.cycle);
  const payoutType = payoutTypeName(event.payoutTypeIndex);
  const amountDecimal = formatTokenUnits(event.amount);
  const tsSec = Number(event.timestamp);
  const eventDate = new Date(tsSec * 1000);
  const slotCostUsd = 30;
  const isVault = isProtocolVaultAddress(recipient) || payoutType === "PROTOCOL_POOL";
  const isOwnerDirect = payoutType === "OWNER_DIRECT" && !isVault;

  // Idempotency guard — avoid duplicate placements or double-counted earnings across restarts/replays
  const existingPlacement = await prisma.matrixPlacement.findFirst({
    where: {
      txHash: event.txHash,
      matrixOwnerAddress: matrixOwner,
      slotNumber,
      cycle,
      position: event.position,
      payoutType,
      recipientAddress: recipient,
    },
  });
  if (existingPlacement) {
    return;
  }

  await ensureRegisteredUser(matrixOwner, tsSec);
  await ensureRegisteredUser(participant, tsSec);

  // Insert full audit placement record
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
  }).catch(() => {});

  // ONLY EquoraMatrix V3 _creditOwner (OWNER_DIRECT = 2) credits personal wallet earnings.
  // UPLINE_1 / UPLINE_2 / SPILLOVER_* route recursively into target boards and emit their own OWNER_DIRECT event.
  if (isOwnerDirect) {
    await ensureRegisteredUser(recipient, tsSec);
    const isLevel2Direct = event.position === 3 || event.position === 6;

    await prisma.matrixProfile.upsert({
      where: { userAddress: recipient },
      create: {
        userAddress: recipient,
        username: `Operative #${recipient.slice(2, 6).toUpperCase()}`,
        totalEarnings: slotCostUsd,
        availableBalance: slotCostUsd,
        directEarnings: isLevel2Direct ? slotCostUsd : 0,
        matrixEarnings: isLevel2Direct ? 0 : slotCostUsd,
      },
      update: {
        totalEarnings: { increment: slotCostUsd },
        availableBalance: { increment: slotCostUsd },
        ...(isLevel2Direct
          ? { directEarnings: { increment: slotCostUsd } }
          : { matrixEarnings: { increment: slotCostUsd } }),
      },
    }).catch(() => {});

    const txType = isLevel2Direct ? "COMMISSION_EARNED" : "SPILLOVER_RECEIVED";
    const existingTx = await prisma.matrixTransaction.findFirst({
      where: {
        userAddress: recipient,
        type: txType,
        slotNumber,
        cycle,
        position: event.position,
        txHash: event.txHash,
      },
    });
    if (!existingTx) {
      await prisma.matrixTransaction.create({
        data: {
          userAddress: recipient,
          type: txType,
          amount: amountDecimal,
          amountUsd: slotCostUsd,
          slotNumber,
          cycle,
          position: event.position,
          fromAddress: participant !== ZERO_ADDRESS ? participant : null,
          toAddress: recipient,
          status: "COMPLETED",
          txHash: event.txHash,
          timestamp: eventDate,
          description: `Matrix reward: ${payoutType} (Slot #${slotNumber}, P${event.position})`,
        },
      }).catch(() => {});
    }

    const existingActivity = await prisma.matrixActivity.findFirst({
      where: {
        userAddress: recipient,
        action: "REWARD_DISTRIBUTED",
        slotNumber,
        txHash: event.txHash,
      },
    });
    if (!existingActivity) {
      await prisma.matrixActivity.create({
        data: {
          userAddress: recipient,
          action: "REWARD_DISTRIBUTED",
          title: `Matrix Commission Received ($${slotCostUsd.toFixed(2)} USD)`,
          description: `Earned from Position #${event.position} on Slot #${slotNumber} (${payoutType})`,
          slotNumber,
          amount: slotCostUsd,
          txHash: event.txHash,
          timestamp: eventDate,
        },
      }).catch(() => {});
    }
  } else if (participant !== ZERO_ADDRESS) {
    // Record zero-cashflow routing / protocol pool split on the payer's ledger for transparency
    const routingType = isVault ? "POOL_ROUTING" : "BOARD_ROUTING";
    const existingRouting = await prisma.matrixTransaction.findFirst({
      where: {
        userAddress: participant,
        type: routingType,
        slotNumber,
        cycle,
        position: event.position,
        txHash: event.txHash,
      },
    });
    if (!existingRouting) {
      await prisma.matrixTransaction.create({
        data: {
          userAddress: participant,
          type: routingType,
          amount: amountDecimal,
          amountUsd: 0,
          slotNumber,
          cycle,
          position: event.position,
          fromAddress: participant,
          toAddress: recipient !== ZERO_ADDRESS ? recipient : null,
          status: "COMPLETED",
          txHash: event.txHash,
          timestamp: eventDate,
          description: isVault
            ? `Protocol pool split at Slot #${slotNumber} P${event.position} ($0 personal cashflow)`
            : `Matrix routing via ${payoutType} at Slot #${slotNumber} P${event.position}`,
        },
      }).catch(() => {});
    }
  }

  // Track USD totalEarned on the slot owner's MatrixSlot record ONLY for OWNER_DIRECT
  if (isOwnerDirect && recipient === matrixOwner) {
    await prisma.matrixSlot.upsert({
      where: { userAddress_slotNumber: { userAddress: matrixOwner, slotNumber } },
      create: {
        userAddress: matrixOwner,
        slotNumber,
        isUnlocked: true,
        currentCycle: cycle,
        filledNodes: 0,
        totalEarned: slotCostUsd,
      },
      update: { totalEarned: { increment: slotCostUsd } },
    }).catch(() => {});
  }

  console.log(`[Matrix] ${payoutType} P${event.position} Slot#${slotNumber}/${cycle} -> ${recipient} ${amountDecimal} TROB${event.wasFallback ? " [FALLBACK]" : ""}`);
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

  // Recompute idempotent recyclesCount from archived cycles
  const totalCompletedCycles = await prisma.matrixCycleEvent.count({
    where: { userAddress: user },
  }).catch(() => 0);
  if (totalCompletedCycles > 0) {
    await prisma.matrixProfile.update({
      where: { userAddress: user },
      data: { recyclesCount: totalCompletedCycles },
    }).catch(() => {});
  }

  console.log(`[Matrix] Cycle#${cycleNumber} completed Slot#${slotNumber} for ${user}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SlotAutoActivated / SlotAutoUpgraded — next slot reserved & unlocked via P5
// ─────────────────────────────────────────────────────────────────────────────

export async function handleSlotAutoActivated(event: {
  user: string;
  fromSlot: number;
  toSlot: number;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const user = normalizeHexAddress(event.user);
  const tsSec = Number(event.timestamp);
  const upgradeDate = new Date(tsSec * 1000);

  await ensureRegisteredUser(user, tsSec);

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

  const existingAct = await prisma.matrixActivity.findFirst({
    where: {
      userAddress: user,
      action: "SLOT_AUTO_ACTIVATED",
      slotNumber: event.toSlot,
      txHash: event.txHash,
    },
  });
  if (!existingAct) {
    await prisma.matrixActivity.create({
      data: {
        userAddress: user,
        action: "SLOT_AUTO_ACTIVATED",
        title: `Slot #${String(event.toSlot).padStart(2, "0")} Auto-Unlocked`,
        description: `Automated Stage-1 activation from Slot #${event.fromSlot} P5 reserve ($0 out-of-pocket)`,
        slotNumber: event.toSlot,
        amount: 0,
        txHash: event.txHash,
        timestamp: upgradeDate,
      },
    }).catch(() => {});
  }

  console.log(`[Matrix] Auto-activated Slot#${event.fromSlot} -> Slot#${event.toSlot} for ${user}`);
}

export const handleSlotAutoUpgraded = handleSlotAutoActivated;

// ─────────────────────────────────────────────────────────────────────────────
// ProtocolPoolFunded — V3 P4/P5 4-Pool distribution split
// ─────────────────────────────────────────────────────────────────────────────

export async function handleProtocolPoolFunded(event: {
  matrixOwner: string;
  amount: bigint;
  slot: number;
  cycle: bigint;
  position: number;
  timestamp: bigint;
  txHash: string;
}) {
  const matrixOwner = normalizeHexAddress(event.matrixOwner);
  const tsSec = Number(event.timestamp);
  const eventDate = new Date(tsSec * 1000);
  const trobAmount = formatTokenUnits(event.amount);

  await ensureRegisteredUser(matrixOwner, tsSec);

  const existingAct = await prisma.matrixActivity.findFirst({
    where: {
      userAddress: matrixOwner,
      action: "PROTOCOL_POOL_FUNDED",
      slotNumber: event.slot,
      txHash: event.txHash,
    },
  });
  if (!existingAct) {
    await prisma.matrixActivity.create({
      data: {
        userAddress: matrixOwner,
        action: "PROTOCOL_POOL_FUNDED",
        title: `Protocol Pools Split (Slot #${event.slot} P${event.position})`,
        description: `Funded 4 Protocol Pools (${trobAmount.toFixed(2)} TROB): 35% DAO, 40% Royalty, 15% Level Rewards, 10% Magic Box`,
        slotNumber: event.slot,
        amount: 30,
        txHash: event.txHash,
        timestamp: eventDate,
      },
    }).catch(() => {});
  }
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
  const amountDecimal = formatTokenUnits(event.amount);
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

  console.log(`[DAO Pool] Funded +${amountDecimal} TROB`);
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
  const amountDecimal = formatTokenUnits(event.amount);

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

  console.log(`[DAO Pool] Claimed ${amountDecimal} TROB by ${member}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// RankPoolFunded — V2 rank pool event
// ─────────────────────────────────────────────────────────────────────────────

export async function handleRankPoolFunded(event: {
  amount: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const amountDecimal = formatTokenUnits(event.amount);

  await prisma.rankPoolEvent.create({
    data: {
      eventType: "FUNDED",
      amount: amountDecimal,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
  });

  console.log(`[Rank Pool] Funded +${amountDecimal} TROB`);
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

export async function handleRankAchieved(event: {
  user: string;
  newTier: number;
  timestamp?: bigint;
  txHash?: string;
}) {
  const user = normalizeHexAddress(event.user);
  const rankTier = Math.min(Math.max(Number(event.newTier) || 0, 0), 4);
  if (user === ZERO_ADDRESS || rankTier <= 0) return;

  const tsSec = event.timestamp ? Number(event.timestamp) : Math.floor(Date.now() / 1000);
  await ensureRegisteredUser(user, tsSec);

  await prisma.matrixProfile.upsert({
    where: { userAddress: user },
    create: {
      userAddress: user,
      username: `Operative #${user.slice(2, 6).toUpperCase()}`,
      rankTier,
    },
    update: { rankTier },
  }).catch(() => {});
}

