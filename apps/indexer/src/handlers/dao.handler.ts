import prisma from "@equora/database";
import { formatUnits } from "viem";

export async function handleDAOPositionJoined(event: {
  user: string;
  position: bigint;
  tokenId: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalUser = event.user.toLowerCase();
  const joinedDate = new Date(Number(event.timestamp) * 1000);
  const position = Number(event.position);
  const nftTokenId = Number(event.tokenId);

  await prisma.$transaction([
    prisma.user.upsert({
      where: { address: canonicalUser },
      create: {
        address: canonicalUser,
        userId: position,
        registrationTimestamp: joinedDate,
      },
      update: {},
    }),

    prisma.daoMember.upsert({
      where: { address: canonicalUser },
      create: {
        address: canonicalUser,
        position,
        nftTokenId,
        entryAmountBtt: 300,
        pushedAmountBtt: 0,
        joinedAt: joinedDate,
        status: "active",
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },

      update: {
        position,
        nftTokenId,
        joinedAt: joinedDate,
        txHash: event.txHash,
        blockNumber: event.blockNumber,
      },
    }),
    prisma.daoEvent.create({
      data: {
        eventType: "joined",
        userAddress: canonicalUser,
        incomingPosition: position,
        recipientCount: position > 1 ? position - 1 : 1,
        amountBtt: 300,
        txHash: `${event.txHash}-joined`,
        blockNumber: event.blockNumber,
        timestamp: joinedDate,
      },
    }),
    prisma.daoInstance.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        capacity: 100,
        isClosed: position >= 100,
        totalDistributedBtt: 0,
        distributionMode: "push_with_pull_fallback",
      },
      update: {
        capacity: 100,
        isClosed: position >= 100,
      },
    }),

  ]);

  console.log(`🏛️ [Indexer] DAO Position #${position} (Soulbound NFT #${nftTokenId}) Joined by ${canonicalUser}`);
}

export async function handleDAOPayoutPushed(event: {
  recipient: string;
  amount: bigint;
  fromPosition: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalRecipient = event.recipient.toLowerCase();
  const amountFormatted = parseFloat(formatUnits(event.amount, 18));
  const pushDate = new Date(Number(event.timestamp) * 1000);
  const fromPosition = Number(event.fromPosition);

  await prisma.$transaction([
    prisma.daoMember.updateMany({
      where: { address: canonicalRecipient },
      data: {
        pushedAmountBtt: {
          increment: amountFormatted,
        },
      },
    }),
    prisma.daoEvent.create({
      data: {
        eventType: "pushed",
        userAddress: canonicalRecipient,
        incomingPosition: fromPosition,
        amountBtt: amountFormatted,
        txHash: `${event.txHash}-push-${canonicalRecipient}`,
        blockNumber: event.blockNumber,
        timestamp: pushDate,
      },
    }),
    prisma.daoInstance.update({
      where: { id: 1 },
      data: {
        totalDistributedBtt: {
          increment: amountFormatted,
        },
      },
    }),
  ]);

  console.log(`⚡ [Indexer] Instant Payout Pushed: ${amountFormatted} BTT to ${canonicalRecipient} from Seat #${fromPosition}`);
}

export async function handleDAOPayoutFallback(event: {
  recipient: string;
  amount: bigint;
  fromPosition: bigint;
  reason: string;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalRecipient = event.recipient.toLowerCase();
  const amountFormatted = parseFloat(formatUnits(event.amount, 18));
  const fallbackDate = new Date(Number(event.timestamp) * 1000);

  await prisma.daoEvent.create({
    data: {
      eventType: "push_failed",
      userAddress: canonicalRecipient,
      incomingPosition: Number(event.fromPosition),
      amountBtt: amountFormatted,
      reason: event.reason,
      txHash: `${event.txHash}-fallback-${canonicalRecipient}`,
      blockNumber: event.blockNumber,
      timestamp: fallbackDate,
    },
  });

  console.log(`⚠️ [Indexer] Direct Push Failed (${event.reason}): Saved ${amountFormatted} BTT in Fallback for ${canonicalRecipient}`);
}

export async function handleFallbackClaimed(event: {
  user: string;
  amount: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalUser = event.user.toLowerCase();
  const amountFormatted = parseFloat(formatUnits(event.amount, 18));
  const claimDate = new Date(Number(event.timestamp) * 1000);

  const member = await prisma.daoMember.findUnique({
    where: { address: canonicalUser },
  });

  if (member) {
    await prisma.$transaction([
      prisma.pullFallbackClaim.create({
        data: {
          memberId: member.id,
          amountBtt: amountFormatted,
          reason: "Manual fallback claim",
          txHash: event.txHash,
          claimedAt: claimDate,
        },
      }),
      prisma.daoMember.update({
        where: { address: canonicalUser },
        data: {
          pushedAmountBtt: {
            increment: amountFormatted,
          },
        },
      }),
      prisma.daoEvent.create({
        data: {
          eventType: "fallback_claimed",
          userAddress: canonicalUser,
          amountBtt: amountFormatted,
          txHash: `${event.txHash}-claimed`,
          blockNumber: event.blockNumber,
          timestamp: claimDate,
        },
      }),
    ]);
  }

  console.log(`💎 [Indexer] Fallback Claimed: ${amountFormatted} BTT by ${canonicalUser}`);
}

export async function handleQueueClosed(event: {
  totalMembers: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const closeDate = new Date(Number(event.timestamp) * 1000);
  const total = Number(event.totalMembers);

  await prisma.daoInstance.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      capacity: 100,
      isClosed: true,
      closedAt: closeDate,
    },
    update: {
      capacity: 100,
      isClosed: true,
      closedAt: closeDate,
    },
  });

  console.log(`🔒 [Indexer] Genesis DAO 100/100 Queue Permanently CLOSED!`);
}

export async function handleRetopup(event: {
  member: string;
  position: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalMember = event.member.toLowerCase();
  const eventDate = new Date(Number(event.timestamp) * 1000);
  const position = Number(event.position);

  await prisma.$transaction([
    prisma.daoMember.updateMany({
      where: { address: canonicalMember },
      data: {
        status: "active",
        entryAmountBtt: {
          increment: 300,
        },
      },
    }),
    prisma.daoEvent.create({
      data: {
        eventType: "retopup",
        userAddress: canonicalMember,
        incomingPosition: position,
        amountBtt: 300,
        txHash: `${event.txHash}-retopup-${canonicalMember}`,
        blockNumber: event.blockNumber,
        timestamp: eventDate,
      },
    }),
  ]);

  console.log(`🔄 [Indexer] Genesis DAO Seat #${position} Re-topup (300 BTT) by ${canonicalMember}`);
}

export async function handleEarningsCapHit(event: {
  member: string;
  lifetimeEarnings: bigint;
  retopupDeadline: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalMember = event.member.toLowerCase();
  const earnings = parseFloat(formatUnits(event.lifetimeEarnings, 18));
  const deadlineDate = new Date(Number(event.retopupDeadline) * 1000);

  await prisma.$transaction([
    prisma.daoMember.updateMany({
      where: { address: canonicalMember },
      data: {
        status: "capped",
      },
    }),
    prisma.daoEvent.create({
      data: {
        eventType: "cap_hit",
        userAddress: canonicalMember,
        amountBtt: earnings,
        reason: `3X Cap Reached. 48h Retopup Deadline: ${deadlineDate.toISOString()}`,
        txHash: `${event.txHash}-cap-${canonicalMember}`,
        blockNumber: event.blockNumber,
        timestamp: new Date(),
      },
    }),
  ]);

  console.log(`🎯 [Indexer] Member ${canonicalMember} hit 3X Cap (${earnings} BTT)! 48h Window Open.`);
}

export async function handleSlotBlanked(event: {
  member: string;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalMember = event.member.toLowerCase();
  const eventDate = new Date(Number(event.timestamp) * 1000);

  await prisma.$transaction([
    prisma.daoMember.updateMany({
      where: { address: canonicalMember },
      data: {
        status: "blank",
      },
    }),
    prisma.daoEvent.create({
      data: {
        eventType: "slot_blanked",
        userAddress: canonicalMember,
        reason: "48h Retopup window expired — slot blanked",
        txHash: `${event.txHash}-blank-${canonicalMember}`,
        blockNumber: event.blockNumber,
        timestamp: eventDate,
      },
    }),
  ]);

  console.log(`⚠️ [Indexer] Member ${canonicalMember} slot BLANKED due to expired 48h retopup.`);
}

export async function handleSlotReactivated(event: {
  member: string;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalMember = event.member.toLowerCase();
  const eventDate = new Date(Number(event.timestamp) * 1000);

  await prisma.$transaction([
    prisma.daoMember.updateMany({
      where: { address: canonicalMember },
      data: {
        status: "active",
      },
    }),
    prisma.daoEvent.create({
      data: {
        eventType: "slot_reactivated",
        userAddress: canonicalMember,
        reason: "Slot reactivated upon re-topup",
        txHash: `${event.txHash}-reactivated-${canonicalMember}`,
        blockNumber: event.blockNumber,
        timestamp: eventDate,
      },
    }),
  ]);

  console.log(`✨ [Indexer] Member ${canonicalMember} slot REACTIVATED.`);
}

export async function handlePoolShareClaimed(event: {
  member: string;
  amount: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const canonicalMember = event.member.toLowerCase();
  const amountFormatted = parseFloat(formatUnits(event.amount, 18));
  const claimDate = new Date(Number(event.timestamp) * 1000);

  await prisma.daoEvent.create({
    data: {
      eventType: "pool_claimed",
      userAddress: canonicalMember,
      amountBtt: amountFormatted,
      reason: "35% Matrix Vault Pool Share Dividend Claimed",
      txHash: `${event.txHash}-poolclaim-${canonicalMember}`,
      blockNumber: event.blockNumber,
      timestamp: claimDate,
    },
  });

  console.log(`🏛️ [Indexer] 35% Pool Share Claimed: ${amountFormatted} BTT by ${canonicalMember}`);
}


