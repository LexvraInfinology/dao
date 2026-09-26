import prisma from "@equora/database";
import { createPublicClient, http, parseAbi } from "viem";
import { servicesConfig } from "../config";
import {
  PriceData,
  DaoStatsDTO,
  DaoMemberDTO,
  DaoEventDTO,
  VaultDepositSplitDTO,
  DaoProposalDTO,
  MemberDetailsDTO,
} from "./model";

const AGGREGATOR_V3_ABI = parseAbi([
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)",
]);

export class PriceService {
  private client: ReturnType<typeof createPublicClient> | null = null;
  private chainlinkFeedAddress: `0x${string}` | null = null;
  private defaultBttPrice = 1.0;

  constructor() {
    const rpcUrl = servicesConfig.blockchain.rpcUrl;
    const feed = process.env.CHAINLINK_BTT_USD_FEED as `0x${string}` | undefined;

    if (feed && /^0x[0-9a-fA-F]{40}$/.test(feed)) {
      this.chainlinkFeedAddress = feed;
      this.client = createPublicClient({
        transport: http(rpcUrl),
      });
    }
  }

  async getBttUsdPrice(): Promise<PriceData> {
    if (this.client && this.chainlinkFeedAddress) {
      try {
        const [roundData, decimals] = await Promise.all([
          this.client.readContract({
            address: this.chainlinkFeedAddress,
            abi: AGGREGATOR_V3_ABI,
            functionName: "latestRoundData",
          }),
          this.client.readContract({
            address: this.chainlinkFeedAddress,
            abi: AGGREGATOR_V3_ABI,
            functionName: "decimals",
          }),
        ]);

        const [, answer, , updatedAt] = roundData;
        const nowSeconds = Math.floor(Date.now() / 1000);
        const updatedSeconds = Number(updatedAt);
        const isStale = updatedSeconds === 0 || nowSeconds - updatedSeconds > 3600;

        if (!isStale && answer > 0n) {
          const formattedPrice = Number(answer) / 10 ** decimals;
          return {
            priceUsd: formattedPrice,
            priceSource: "onchain",
            updatedAt: new Date(updatedSeconds * 1000),
            isStale: false,
          };
        }
      } catch (err) {
        // Fall back to off-chain estimate
      }
    }

    return {
      priceUsd: this.defaultBttPrice,
      priceSource: "offchain-estimate",
      updatedAt: new Date(),
      isStale: false,
    };
  }
}

export const priceService = new PriceService();

export class DaoService {
  private priceService = priceService;

  async getDAOStats(): Promise<DaoStatsDTO> {
    const [memberCount, activeCount, blankCount, cappedCount, priceData, instance, vaultSplits] =
      await Promise.all([
        prisma.daoMember.count(),
        prisma.daoMember.count({ where: { status: "active" } }),
        prisma.daoMember.count({ where: { status: "blank" } }),
        prisma.daoMember.count({ where: { status: "capped" } }),
        this.priceService.getBttUsdPrice(),
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
          (acc: number, m: { pushedAmountBtt: any }) => acc + Number(m.pushedAmountBtt),
          0
        );

    const totalPoolReceivedBTT = Number(vaultSplits?._sum?.daoAmount || 0);
    const totalDistributedUSDEstimate = totalDistributedBTT * (priceData?.priceUsd || 1.0);
    const totalCollectedUSDEstimate = totalCollectedBTT * (priceData?.priceUsd || 1.0);

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

  async getDAOMembers(page = 1, limit = 100): Promise<{
    total: number;
    priceSource: string;
    bttPriceUsd: number;
    members: DaoMemberDTO[];
  }> {
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
      this.priceService.getBttUsdPrice(),
    ]);

    return {
      total,
      priceSource: priceData.priceSource,
      bttPriceUsd: priceData.priceUsd,
      members: members.map((m: any) => {
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

  async getMemberByAddress(address: string): Promise<MemberDetailsDTO> {
    const canonicalAddress = address.toLowerCase();
    const [member, priceData] = await Promise.all([
      prisma.daoMember.findUnique({
        where: { address: canonicalAddress },
        include: {
          user: true,
          fallbackClaims: true,
        },
      }),
      this.priceService.getBttUsdPrice(),
    ]);

    if (!member) {
      return {
        isMember: false,
        position: null,
        userId: null,
        directReferralsCount: 0,
        isQualified: false,
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
      fallbackClaims: (member.fallbackClaims || []).map((f: any) => ({
        id: f.id,
        round: f.round,
        amountBtt: Number(f.amountBtt),
        claimed: f.claimed,
        txHash: f.txHash,
        claimedAt: f.claimedAt,
        createdAt: f.createdAt,
      })),
    };
  }

  async getDAOEvents(limit = 20): Promise<DaoEventDTO[]> {
    const [events, priceData] = await Promise.all([
      prisma.daoEvent.findMany({
        take: limit,
        orderBy: { timestamp: "desc" },
      }),
      this.priceService.getBttUsdPrice(),
    ]);

    return events.map((e: any) => {
      const amountBtt = Number(e.amountBtt || 0);
      return {
        id: e.id,
        eventType: e.eventType,
        userAddress: e.userAddress,
        incomingPosition: e.incomingPosition,
        recipientCount: e.recipientCount,
        amountBtt,
        amountUsdEstimate: amountBtt * (priceData?.priceUsd || 1.0),
        priceSource: priceData?.priceSource || "offchain-estimate",
        reason: e.reason,
        txHash: e.txHash,
        blockNumber: e.blockNumber != null ? e.blockNumber.toString() : "0",
        timestamp: e.timestamp,
      };
    });
  }

  async getVaultDepositSplits(limit = 20): Promise<VaultDepositSplitDTO[]> {
    const splits = await prisma.vaultDepositSplit.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
    });

    return splits.map((s: any) => ({
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

  async getDAOProposals(limit = 20): Promise<DaoProposalDTO[]> {
    const proposals = await prisma.daoProposal.findMany({
      take: limit,
      orderBy: { proposalId: "desc" },
      include: {
        votes: true,
      },
    });

    return proposals.map((p: any) => ({
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
export * from "./model";
