import prisma from "@equora/database";
import * as crypto from "crypto";
import { createPublicClient, http, parseAbi } from "viem";
import { servicesConfig } from "../config";

export function getAddressVariants(addr: string): string[] {
  const variants = new Set<string>();
  const clean = addr.trim();
  if (!clean) return [];
  variants.add(clean);
  variants.add(clean.toLowerCase());

  const hexClean = clean.startsWith("0x") ? clean.slice(2) : clean;
  if (/^41[0-9a-fA-F]{40}$/.test(hexClean)) {
    try {
      const bytes = Buffer.from(hexClean, "hex");
      const hash1 = crypto.createHash("sha256").update(bytes).digest();
      const hash2 = crypto.createHash("sha256").update(hash1).digest();
      const checksum = hash2.subarray(0, 4);
      const full = Buffer.concat([bytes, checksum]);
      const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      const digits = [0];
      for (let i = 0; i < full.length; i++) {
        let carry = full[i];
        for (let j = 0; j < digits.length; j++) {
          carry += digits[j] << 8;
          digits[j] = carry % 58;
          carry = (carry / 58) | 0;
        }
        while (carry > 0) {
          digits.push(carry % 58);
          carry = (carry / 58) | 0;
        }
      }
      let b58 = "";
      for (let i = 0; i < full.length && full[i] === 0; i++) b58 += "1";
      for (let i = digits.length - 1; i >= 0; i--) b58 += ALPHABET[digits[i]];
      variants.add(b58);
      variants.add(b58.toLowerCase());
    } catch (_) {}
  } else if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(clean)) {
    try {
      const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      const bytes = [0];
      for (const c of clean) {
        let val = ALPHABET.indexOf(c);
        if (val === -1) break;
        for (let i = 0; i < bytes.length; i++) {
          val += bytes[i] * 58;
          bytes[i] = val & 0xff;
          val >>= 8;
        }
        while (val > 0) {
          bytes.push(val & 0xff);
          val >>= 8;
        }
      }
      for (const c of clean) {
        if (c === "1") bytes.push(0);
        else break;
      }
      const raw = Buffer.from(bytes.reverse().slice(0, 21)).toString("hex");
      variants.add(raw);
      variants.add("0x" + raw);
      variants.add(raw.toLowerCase());
      variants.add(("0x" + raw).toLowerCase());
    } catch (_) {}
  }

  return Array.from(variants);
}
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
  private cachedPrice: PriceData | null = null;
  private lastFetchTime = 0;
  private cacheTtlMs = servicesConfig.price.cacheTtlMs;

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

  async getTrobUsdPrice(): Promise<PriceData> {
    const now = Date.now();
    if (this.cachedPrice && now - this.lastFetchTime < this.cacheTtlMs) {
      return this.cachedPrice;
    }

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
          const result: PriceData = {
            priceUsd: formattedPrice,
            priceSource: "onchain",
            updatedAt: new Date(updatedSeconds * 1000),
            isStale: false,
          };
          this.cachedPrice = result;
          this.lastFetchTime = now;
          return result;
        }
      } catch (err) {
        // Fall back to official Trobium market API
      }
    }

    // Live Trobium Market Price API (used by TrobSafe Wallet extension)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const apiUrl = servicesConfig.price.trobApiUrl;
      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = (await res.json()) as any;
        const data = json?.data ?? json;
        const price = Number(data?.priceUsd);
        if (Number.isFinite(price) && price > 0) {
          const result: PriceData = {
            priceUsd: price,
            priceSource: "trobchain-api",
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
            isStale: false,
          };
          this.cachedPrice = result;
          this.lastFetchTime = now;
          return result;
        }
      }
    } catch (err) {
      console.warn("PriceService: Failed to fetch live TROB price from trobchain.com:", err);
    }

    if (this.cachedPrice) {
      return {
        ...this.cachedPrice,
        isStale: true,
      };
    }

    throw new Error("Live TROB market rate unavailable: dynamic price feed must be reachable.");
  }

  async getBttUsdPrice(): Promise<PriceData> {
    return this.getTrobUsdPrice();
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
    const priceUsd = priceData?.priceUsd || 0;

    // USD-pegged economics: $300 entry fee, $1,500 cap (5x)
    const SEAT_ENTRY_USD = servicesConfig.price.seatEntryUsd; // $300
    const EARNINGS_CAP_USD = SEAT_ENTRY_USD * 5;             // $1,500

    // TROB equivalents at current market price
    const entryFeeTrob    = priceUsd > 0 ? SEAT_ENTRY_USD / priceUsd : 0;
    const earningsCapTrob = priceUsd > 0 ? EARNINGS_CAP_USD / priceUsd : 0;

    const totalCollectedTrob    = memberCount * entryFeeTrob;
    const totalDistributedTROB  = instance
      ? Number(instance.totalDistributedBtt)
      : (await prisma.daoMember.findMany({ select: { pushedAmountBtt: true } })).reduce(
          (acc: number, m: { pushedAmountBtt: any }) => acc + Number(m.pushedAmountBtt),
          0
        );

    const totalPoolReceivedBTT = Number(vaultSplits?._sum?.daoAmount || 0);
    const totalDistributedUSDEstimate = totalDistributedTROB * priceUsd;
    const totalCollectedUSDEstimate   = totalCollectedTrob * priceUsd;

    return {
      memberCount,
      activeMembers: activeCount,
      blankMembers: blankCount,
      cappedMembers: cappedCount,
      capacity: 100,
      remainingPositions: Math.max(0, 100 - activeCount),
      // USD-pegged values (always $300 / $1500)
      entryFeeUsd: SEAT_ENTRY_USD,
      earningsCapUsd: EARNINGS_CAP_USD,
      // TROB equivalents at current price
      entryFeeBtt: entryFeeTrob,
      entryFeeTrob,
      earningsCapBtt: earningsCapTrob,
      earningsCapTrob,
      totalCollectedBTT: totalCollectedTrob,
      totalCollectedTROB: totalCollectedTrob,
      totalCollectedUSDEstimate,
      totalDistributedBTT: totalDistributedTROB,
      totalDistributedTROB,
      totalDistributedUSDEstimate,
      totalPoolReceivedBTT,
      totalPoolReceivedTROB: totalPoolReceivedBTT,
      totalPoolReceivedUSDEstimate: totalPoolReceivedBTT * priceUsd,
      isClosed: isCompleted,
      distributionMode: "push_with_pull_fallback",
      bttPriceUsd: priceUsd,
      trobPriceUsd: priceUsd,
      priceSource: priceData.priceSource,
      priceUpdatedAt: priceData.updatedAt,
    };
  }

  async getDAOMembers(page = 1, limit = 100): Promise<{
    total: number;
    priceSource: string;
    bttPriceUsd: number;
    trobPriceUsd?: number;
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
      this.priceService.getTrobUsdPrice(),
    ]);

    return {
      total,
      priceSource: priceData.priceSource,
      bttPriceUsd: priceData.priceUsd,
      trobPriceUsd: priceData.priceUsd,
      members: members.map((m: any) => {
        let entryTrob = Number(m.entryAmountBtt);
        let pushedTrob = Number(m.pushedAmountBtt);
        const priceUsd = priceData.priceUsd > 0 ? priceData.priceUsd : 0.053111;

        if (entryTrob <= 300 && priceUsd > 0) {
          entryTrob = Math.round((300 / priceUsd) * 100) / 100;
        }
        if (pushedTrob <= 300 && m.position === 1 && priceUsd > 0) {
          pushedTrob = Math.round((300 / priceUsd) * 100) / 100;
        }

        const entryUsd = Number(m.entryAmountUsdAtJoin) > 0 ? Number(m.entryAmountUsdAtJoin) : 300;
        const pushedUsd = Number((pushedTrob * priceUsd).toFixed(2));

        return {
          position: m.position,
          address: m.address,
          userId: m.user?.userId || null,
          nftTokenId: m.nftTokenId || m.position,
          entryAmountBtt: entryTrob,
          entryAmountTrob: entryTrob,
          entryAmountUsdEstimate: entryUsd,
          pushedAmountBtt: pushedTrob,
          pushedAmountTrob: pushedTrob,
          pushedAmountUsdEstimate: pushedUsd,
          status: m.status,
          joinedAt: m.joinedAt,
          txHash: m.txHash,
          hasFallbackClaims: m.fallbackClaims.length > 0,
        };
      }),
    };
  }

  async getMemberByAddress(address: string): Promise<MemberDetailsDTO> {
    const variants = getAddressVariants(address);
    const [member, priceData] = await Promise.all([
      prisma.daoMember.findFirst({
        where: {
          OR: [
            ...variants.map((v) => ({ address: v })),
            ...variants.map((v) => ({ user: { address: v } })),
          ],
        },
        include: {
          user: true,
          fallbackClaims: true,
        },
      }),
      this.priceService.getTrobUsdPrice(),
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
        pushedAmountTrob: 0,
        pushedAmountUsdEstimate: 0,
      };
    }

    const priceUsd          = priceData.priceUsd > 0 ? priceData.priceUsd : 0.053111;
    let pushedTrob          = Number(member.pushedAmountBtt);
    let entryTrob           = Number(member.entryAmountBtt);

    if (entryTrob <= 300 && priceUsd > 0) {
      entryTrob = Math.round((300 / priceUsd) * 100) / 100;
    }
    if (pushedTrob <= 300 && member.position === 1 && priceUsd > 0) {
      pushedTrob = Math.round((300 / priceUsd) * 100) / 100;
    }

    const SEAT_ENTRY_USD    = servicesConfig.price.seatEntryUsd; // $300
    const EARNINGS_CAP_USD  = SEAT_ENTRY_USD * 5;               // $1,500

    // Compute cap in TROB using live price
    const earningsCapTrob = priceUsd > 0 ? Math.round((EARNINGS_CAP_USD / priceUsd) * 100) / 100 : 0;

    // Cap progress based on USD value (5x limit hits only when $1,500 is earned)
    const pushedUsd       = Number((pushedTrob * priceUsd).toFixed(2));
    const remainingCapUsd = Math.max(0, Number((EARNINGS_CAP_USD - pushedUsd).toFixed(2)));
    const remainingCapTrob= priceUsd > 0 ? Math.round((remainingCapUsd / priceUsd) * 100) / 100 : 0;
    const capProgressPct  = EARNINGS_CAP_USD > 0 ? Math.min(100, (pushedUsd / EARNINGS_CAP_USD) * 100) : 0;

    return {
      isMember: true,
      position: member.position,
      userId: member.user?.userId || null,
      directReferralsCount: member.user?.directReferralsCount || 0,
      isQualified: member.user?.isQualified || false,
      nftTokenId: member.nftTokenId || member.position,
      joinedAt: member.joinedAt,
      entryAmountBtt: entryTrob,
      entryAmountTrob: entryTrob,
      entryAmountUsdEstimate: SEAT_ENTRY_USD, // Always $300 USD regardless of TROB price
      pushedAmountBtt: pushedTrob,
      pushedAmountTrob: pushedTrob,
      pushedAmountUsdEstimate: pushedUsd,
      // USD-pegged cap values ($1,500 max cap)
      earningsCapUsd: EARNINGS_CAP_USD,
      earningsCapBtt: earningsCapTrob,
      earningsCapTrob,
      remainingCapUsd,
      remainingCapTrob,
      capProgressPct,
      isCapped: pushedUsd >= EARNINGS_CAP_USD,
      priceSource: priceData.priceSource,
      trobPriceUsd: priceUsd,
      bttPriceUsd: priceUsd,
      status: member.status,
      txHash: member.txHash,
      fallbackClaims: (member.fallbackClaims || []).map((f: any) => ({
        id: f.id,
        round: f.round,
        amountBtt: Number(f.amountBtt),
        amountTrob: Number(f.amountBtt),
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
      this.priceService.getTrobUsdPrice(),
    ]);

    const priceUsd = priceData?.priceUsd > 0 ? priceData.priceUsd : 0.053111;

    return events.map((e: any) => {
      let amt = Number(e.amountBtt || 0);
      let usdEst = Number(e.amountUsdEst);

      if (amt <= 300 && priceUsd > 0) {
        if (e.eventType === "joined") {
          amt = Math.round((300 / priceUsd) * 100) / 100;
          usdEst = 300;
        } else if (e.eventType === "pushed") {
          const pos = e.incomingPosition || 1;
          const targetUsd = 300 / pos;
          amt = Math.round((targetUsd / priceUsd) * 100) / 100;
          usdEst = targetUsd;
        }
      }

      if (!usdEst || usdEst <= 0) {
        usdEst = amt * priceUsd;
      }

      return {
        id: e.id,
        eventType: e.eventType,
        userAddress: e.userAddress,
        incomingPosition: e.incomingPosition,
        recipientCount: e.recipientCount,
        amountBtt: amt,
        amountTrob: amt,
        amountUsdEstimate: Number(usdEst.toFixed(2)),
        priceSource: priceData?.priceSource || "trobchain-api",
        reason:
          e.reason ||
          (e.eventType === "joined"
            ? (e.incomingPosition ? `Council Seat #${e.incomingPosition} Activated` : "Council Seat Activated")
            : e.eventType === "pushed"
            ? (e.incomingPosition ? `Instant Cashback (Seat #${e.incomingPosition})` : "Instant 300/N Cashback")
            : e.eventType === "fallback_claimed"
            ? "Dividend Reward Claimed"
            : e.eventType),
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
export * from "./resourceCalculator";
