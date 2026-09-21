import prisma from "@equora/database";
import { priceService } from "./price.service";

export class DaoService {
  async getDAOStats() {
    const [memberCount, activeCount, blankCount, cappedCount, priceData, instance, vaultSplits] = await Promise.all([
      prisma.daoMember.count(),
      prisma.daoMember.count({ where: { status: "active" } }),
      prisma.daoMember.count({ where: { status: "blank" } }),
      prisma.daoMember.count({ where: { status: "capped" } }),
      priceService.getBttUsdPrice(),
      prisma.daoInstance.findUnique({ where: { id: 1 } }),
      prisma.vaultDepositSplit.aggregate({
        _sum: {
          daoAmount: true,
        },
      }),
    ]);

    const isCompleted = instance ? instance.isClosed : memberCount >= 100;
    const totalCollectedBTT = memberCount * 300;
    const totalDistributedBTT = instance
      ? Number(instance.totalDistributedBtt)
      : (await prisma.daoMember.findMany({ select: { pushedAmountBtt: true } })).reduce(
          (acc, m) => acc + Number(m.pushedAmountBtt),
          0
        );

    const totalPoolReceivedBTT = Number(vaultSplits._sum.daoAmount || 0);
    const totalDistributedUSDEstimate = totalDistributedBTT * priceData.priceUsd;
    const totalCollectedUSDEstimate = totalCollectedBTT * priceData.priceUsd;

    return {
      memberCount,
      activeMembers: activeCount,
      blankMembers: blankCount,
      cappedMembers: cappedCount,
      capacity: 100,
      remainingPositions: Math.max(0, 100 - activeCount),
      entryFeeBtt: 300,
      earningsCapBtt: 900,
      totalCollectedBTT,
      totalCollectedUSDEstimate,
      totalDistributedBTT,
      totalDistributedUSDEstimate,
      totalPoolReceivedBTT,
      totalPoolReceivedUSDEstimate: totalPoolReceivedBTT * priceData.priceUsd,
      isClosed: isCompleted,
      distributionMode: "push_with_pull_fallback",
      bttPriceUsd: priceData.priceUsd,
      priceSource: priceData.priceSource,
      priceUpdatedAt: priceData.updatedAt,
    };
  }

  async getDAOMembers(page = 1, limit = 100) {

    const skip = (page - 1) * limit;
    const [total, members, priceData] = await Promise.all([
      prisma.daoMember.count(),
      prisma.daoMember.findMany({
        skip,
        take: limit,
        orderBy: { position: "asc" },
        include: {
          user: {
            select: {
              userId: true,
              directReferralsCount: true,
              isQualified: true,
            },
          },
          fallbackClaims: true,
        },
      }),
      priceService.getBttUsdPrice(),
    ]);

    return {
      total,
      priceSource: priceData.priceSource,
      bttPriceUsd: priceData.priceUsd,
      members: members.map((m) => {
        const pushedBtt = Number(m.pushedAmountBtt);
        return {
          position: m.position,
          address: m.address,
          userId: m.user?.userId || null,
          nftTokenId: m.nftTokenId || m.position,
          entryAmountBtt: Number(m.entryAmountBtt),
          entryAmountUsdEstimate: Number(m.entryAmountBtt) * priceData.priceUsd,
          pushedAmountBtt: pushedBtt,
          pushedAmountUsdEstimate: pushedBtt * priceData.priceUsd,
          status: m.status,
          joinedAt: m.joinedAt,
          txHash: m.txHash,
          hasFallbackClaims: m.fallbackClaims.length > 0,
        };
      }),
    };
  }

  async getMemberByAddress(address: string) {
    const canonicalAddress = address.toLowerCase();
    const [member, priceData] = await Promise.all([
      prisma.daoMember.findUnique({
        where: { address: canonicalAddress },
        include: {
          user: true,
          fallbackClaims: true,
        },
      }),
      priceService.getBttUsdPrice(),
    ]);

    if (!member) {
      return {
        isMember: false,
        position: null,
        nftTokenId: null,
        pushedAmountBtt: 0,
        pushedAmountUsdEstimate: 0,
      };
    }

    const pushedBtt = Number(member.pushedAmountBtt);
    const earningsCapBtt = 900;
    const capProgressPct = Math.min(100, (pushedBtt / earningsCapBtt) * 100);

    return {
      isMember: true,
      position: member.position,
      userId: member.user?.userId || null,
      directReferralsCount: member.user?.directReferralsCount || 0,
      isQualified: member.user?.isQualified || false,
      nftTokenId: member.nftTokenId || member.position,
      joinedAt: member.joinedAt,
      entryAmountBtt: Number(member.entryAmountBtt),
      entryAmountUsdEstimate: Number(member.entryAmountBtt) * priceData.priceUsd,
      pushedAmountBtt: pushedBtt,
      pushedAmountUsdEstimate: pushedBtt * priceData.priceUsd,
      earningsCapBtt,
      capProgressPct,
      isCapped: pushedBtt >= earningsCapBtt,
      priceSource: priceData.priceSource,
      status: member.status,
      txHash: member.txHash,
      fallbackClaims: member.fallbackClaims,
    };
  }

  async getDAOEvents(limit = 20) {
    const [events, priceData] = await Promise.all([
      prisma.daoEvent.findMany({
        take: limit,
        orderBy: { timestamp: "desc" },
      }),
      priceService.getBttUsdPrice(),
    ]);

    return events.map((e) => {
      const amountBtt = Number(e.amountBtt);
      return {
        id: e.id,
        eventType: e.eventType,
        userAddress: e.userAddress,
        incomingPosition: e.incomingPosition,
        recipientCount: e.recipientCount,
        amountBtt,
        amountUsdEstimate: amountBtt * priceData.priceUsd,
        priceSource: priceData.priceSource,
        reason: e.reason,
        txHash: e.txHash,
        blockNumber: e.blockNumber.toString(),
        timestamp: e.timestamp,
      };
    });
  }

  async getVaultDepositSplits(limit = 20) {
    const splits = await prisma.vaultDepositSplit.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
    });

    return splits.map((s) => ({
      id: s.id,
      userAddress: s.userAddress,
      totalAmount: Number(s.totalAmount),
      daoAmount: Number(s.daoAmount),
      salaryAmount: Number(s.salaryAmount),
      magicBoxAmount: Number(s.magicBoxAmount),
      rewardsAmount: Number(s.rewardsAmount),
      timestamp: s.timestamp,
      txHash: s.txHash,
      blockNumber: s.blockNumber.toString(),
    }));
  }

  async getDAOProposals(limit = 20) {
    const proposals = await prisma.daoProposal.findMany({
      take: limit,
      orderBy: { proposalId: "desc" },
      include: {
        votes: true,
      },
    });

    return proposals.map((p) => ({
      proposalId: p.proposalId,
      proposer: p.proposer,
      title: p.title,
      description: p.description,
      status: p.status,
      startTime: p.startTime,
      endTime: p.endTime,
      votesFor: Number(p.votesFor),
      votesAgainst: Number(p.votesAgainst),
      votesCount: p.votes.length,
      createdAt: p.createdAt,
    }));
  }
}

export const daoService = new DaoService();
