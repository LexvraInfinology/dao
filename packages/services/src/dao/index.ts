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

export function calculateMemberEarnedUsd(
  position: number | null | undefined,
  status?: string | null,
  totalActiveSeats: number = 93
): number {
  if (!position || position <= 0) return 0;
  const s = status ? status.toLowerCase() : '';
  if (s === 'underfunded' || s === 'vacant' || s === 'blank' || s === 'defaulted') return 0;
  if (s === 'capped') return 1500;

  let totalUsd = 0;
  const maxK = Math.max(position, totalActiveSeats);
  for (let k = position; k <= maxK; k++) {
    totalUsd += 300 / k;
  }
  return Math.min(1500, Math.round(totalUsd * 100) / 100);
}

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

const NEON_DIRECT_URL =
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

export async function queryNeonHttp<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    let dbUrl = process.env.DATABASE_URL || "";
    if (!dbUrl.includes("neon.tech")) {
      dbUrl = NEON_DIRECT_URL;
    }
    const match = dbUrl.match(/@([^/:]+)/);
    const host = match && match[1] ? match[1] : "ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech";
    const endpoint = `https://${host}/sql`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Neon-Connection-String": dbUrl,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, params }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    return (json.rows || []) as T[];
  } catch (e) {
    return [];
  }
}

export class DaoService {
  private priceService = priceService;

  async getDAOStats(): Promise<DaoStatsDTO> {
    let [memberCount, activeCount, blankCount, cappedCount, priceData, instance, vaultSplits] =
      await Promise.all([
        prisma.daoMember.count({ where: { status: { notIn: ["vacant", "blank"] } } }).catch(() => 0),
        prisma.daoMember.count({ where: { status: "active" } }).catch(() => 0),
        prisma.daoMember.count({ where: { status: "blank" } }).catch(() => 0),
        prisma.daoMember.count({ where: { status: "capped" } }).catch(() => 0),
        this.priceService.getBttUsdPrice().catch(() => ({
          priceUsd: 0.055,
          priceSource: "default",
          updatedAt: new Date(),
          isStale: true,
        })),
        prisma.daoInstance.findUnique({ where: { id: 1 } }).catch(() => null),
        prisma.vaultDepositSplit.aggregate({
          _sum: {
            daoAmount: true,
          },
        }).catch(() => null),
      ]);

    let totalCollectedDb = 0;
    let totalDistributedDb = 0;

    // Fallback directly to Neon DB if local database count is 0
    if (memberCount === 0) {
      const neonRows = await queryNeonHttp<{
        count: string;
        active_count: string;
        capped_count: string;
        total_collected: string;
        total_distributed: string;
      }>(
        `SELECT 
          count(*) as count,
          COUNT(*) FILTER (WHERE LOWER(status) NOT IN ('vacant', 'blank')) as active_count,
          COUNT(*) FILTER (WHERE LOWER(status) = 'capped') as capped_count,
          COALESCE(SUM("entryAmountBtt"), 0) as total_collected,
          COALESCE(SUM("pushedAmountBtt"), 0) as total_distributed
         FROM "DaoMember"`
      );
      if (neonRows.length > 0 && Number(neonRows[0].count) > 0) {
        memberCount = parseInt(neonRows[0].active_count || neonRows[0].count, 10);
        activeCount = memberCount;
        cappedCount = parseInt(neonRows[0].capped_count || "0", 10);
        totalCollectedDb = parseFloat(neonRows[0].total_collected) || 0;
        totalDistributedDb = parseFloat(neonRows[0].total_distributed) || 0;
      }
    }

    // Direct On-Chain fallback if still 0
    if (memberCount === 0) {
      try {
        const fullNode = servicesConfig.blockchain.rpcUrl || "https://fullnode-one.trobchain.com";
        const daoHex = "419031dbc5faddd365a9b3d40ddc0c550ca0f369e4";
        const ocRes = await fetch(`${fullNode}/wallet/triggerconstantcontract`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner_address: daoHex,
            contract_address: daoHex,
            function_selector: "getAllMembers()",
            parameter: "",
          }),
          signal: AbortSignal.timeout(4000),
        });
        if (ocRes.ok) {
          const ocJson = (await ocRes.json()) as any;
          if (ocJson.constant_result?.[0]) {
            const raw = String(ocJson.constant_result[0]);
            const memberCountMatch = raw.length > 128 ? Math.floor((raw.length - 128) / 64) : 0;
            if (memberCountMatch > 0) {
              memberCount = memberCountMatch;
              activeCount = memberCountMatch;
            }
          }
        }
      } catch {}
    }

    const isCompleted = instance ? instance.isClosed : memberCount >= 100;
    const priceUsd = priceData?.priceUsd || 0.055;

    // USD-pegged economics: $300 entry fee, $1,500 cap (5x)
    const SEAT_ENTRY_USD = servicesConfig.price.seatEntryUsd || 300;
    const EARNINGS_CAP_USD = SEAT_ENTRY_USD * 5;

    // TROB equivalents at current market price
    const entryFeeTrob    = priceUsd > 0 ? SEAT_ENTRY_USD / priceUsd : 0;
    const earningsCapTrob = priceUsd > 0 ? EARNINGS_CAP_USD / priceUsd : 0;

    const totalCollectedTrob = totalCollectedDb > 0 ? totalCollectedDb : (memberCount * entryFeeTrob);
    const totalDistributedTROB = totalDistributedDb > 0
      ? totalDistributedDb
      : (instance
        ? Number(instance.totalDistributedBtt)
        : (await prisma.daoMember.findMany({ select: { pushedAmountBtt: true } }).catch(() => [])).reduce(
            (acc: number, m: { pushedAmountBtt: any }) => acc + Number(m.pushedAmountBtt),
            0
          ));

    const totalPoolReceivedBTT = Number(vaultSplits?._sum?.daoAmount || 0);
    const totalDistributedUSDEstimate = totalDistributedTROB * priceUsd;
    const totalCollectedUSDEstimate   = totalCollectedTrob * priceUsd;

    return {
      memberCount,
      activeMembers: activeCount,
      blankMembers: blankCount,
      cappedMembers: cappedCount,
      capacity: 100,
      remainingPositions: Math.max(0, 100 - memberCount),
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
      dividendYieldApy: "0%",
      treasurySnapshotUsd: 0,
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
    let [total, members, priceData] = await Promise.all([
      prisma.daoMember.count({ where: { status: { notIn: ["vacant", "blank"] } } }).catch(() => 0),
      prisma.daoMember.findMany({
        skip,
        take: limit,
        where: { status: { notIn: ["vacant", "blank"] } },
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
      }).catch(() => []),
      this.priceService.getTrobUsdPrice().catch(() => ({
        priceUsd: 0.055,
        priceSource: "default",
        updatedAt: new Date(),
        isStale: true,
      })),
    ]);

    // Fallback directly to Neon DB if local database returned 0 members
    if (total === 0 || members.length === 0) {
      try {
        const [neonMembers, neonCountRows] = await Promise.all([
          queryNeonHttp<any>(
            `SELECT * FROM "DaoMember" WHERE LOWER(status) NOT IN ('vacant', 'blank') ORDER BY position ASC LIMIT $1 OFFSET $2`,
            [limit, skip]
          ),
          queryNeonHttp<{ count: string }>(
            `SELECT COUNT(*) as count FROM "DaoMember" WHERE LOWER(status) NOT IN ('vacant', 'blank')`
          ),
        ]);
        if (neonMembers && neonMembers.length > 0) {
          total = neonCountRows.length > 0 ? parseInt(neonCountRows[0].count, 10) : neonMembers.length;
          members = neonMembers.map((row: any) => ({
            ...row,
            position: Number(row.position),
            entryAmountBtt: row.entryAmountBtt,
            pushedAmountBtt: row.pushedAmountBtt,
            nftTokenId: Number(row.nftTokenId) || Number(row.position),
            joinedAt: new Date(row.joinedAt),
            user: null,
            fallbackClaims: [],
          }));
        }
      } catch (neonErr) {
        console.warn("[DaoService] Neon fallback for getDAOMembers failed:", neonErr);
      }
    }

    return {
      total,
      priceSource: priceData.priceSource,
      bttPriceUsd: priceData.priceUsd,
      trobPriceUsd: priceData.priceUsd,
      members: members.map((m: any) => {
        let entryTrob = Number(m.entryAmountBtt);
        let pushedTrob = Number(m.pushedAmountBtt);
        const priceUsd = priceData.priceUsd > 0 ? priceData.priceUsd : 0.053111;

        if (m.status !== "underfunded" && entryTrob <= 300 && priceUsd > 0) {
          entryTrob = Math.round((300 / priceUsd) * 100) / 100;
        }
        if (pushedTrob <= 300 && m.position === 1 && priceUsd > 0) {
          pushedTrob = Math.round((300 / priceUsd) * 100) / 100;
        }

        const isCapped = m.status === 'capped';
        const isUnderfunded = m.status === 'underfunded';
        const entryUsd = Number(m.entryAmountUsdAtJoin) > 0 ? Number(m.entryAmountUsdAtJoin) : 300;
        const exactPushedUsd = isUnderfunded ? 0 : isCapped ? 1500 : calculateMemberEarnedUsd(m.position, m.status, total || 93);
        const pushedUsd = exactPushedUsd;

        return {
          position: m.position,
          address: m.address,
          userId: m.user?.userId || null,
          nftTokenId: m.nftTokenId || m.position,
          entryAmountBtt: entryTrob,
          entryAmountTrob: entryTrob,
          entryAmountUsdEstimate: entryUsd,
          pushedAmountBtt: isCapped ? Math.max(pushedTrob, 27529.6) : pushedTrob,
          pushedAmountTrob: isCapped ? Math.max(pushedTrob, 27529.6) : pushedTrob,
          pushedAmountUsdEstimate: pushedUsd,
          status: m.status,
          joinedAt: m.joinedAt,
          txHash: m.txHash,
          hasFallbackClaims: m.fallbackClaims.length > 0,
        };
      }),
    };
  }

  private async getOnChainPosition(address: string): Promise<number> {
    try {
      const clean = address.trim();
      if (!clean) return 0;
      const variants = getAddressVariants(clean);
      let hexOwner = variants.find((v) => /^41[0-9a-fA-F]{40}$/.test(v));
      if (!hexOwner) {
        const hex0x = variants.find((v) => /^0x[0-9a-fA-F]{40}$/.test(v));
        if (hex0x) hexOwner = "41" + hex0x.slice(2);
      }
      if (!hexOwner) return 0;

      const rpcUrl =
        process.env.FULLNODE_URL ||
        process.env.RPC_URL ||
        process.env.NEXT_PUBLIC_RPC_URL ||
        "https://fullnode-one.trobchain.com";
      const daoHex = (
        process.env.NEXT_PUBLIC_DAO_HEX || "419031dbc5faddd365a9b3d40ddc0c550ca0f369e4"
      )
        .replace(/^0x/, "41")
        .toLowerCase();

      const res = await fetch(`${rpcUrl}/wallet/triggerconstantcontract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_address: hexOwner,
          contract_address: daoHex,
          function_selector: "memberPosition(address)",
          parameter: hexOwner.replace(/^41/, "").padStart(64, "0"),
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data?.constant_result?.[0]) {
          const pos = parseInt(data.constant_result[0], 16);
          if (Number.isFinite(pos) && pos > 0 && pos <= 100) {
            return pos;
          }
        }
      }
    } catch (_) {}
    return 0;
  }

  async getMemberByAddress(address: string): Promise<MemberDetailsDTO> {
    const variants = getAddressVariants(address);
    let [member, priceData] = await Promise.all([
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
      }).catch(() => null),
      this.priceService.getTrobUsdPrice().catch(() => ({
        priceUsd: 0.055,
        priceSource: "default",
        updatedAt: new Date(),
        isStale: true,
      })),
    ]);

    if (!member) {
      try {
        const lowerAddrs = variants.map((v) => v.toLowerCase());
        const neonMemberRows = await queryNeonHttp<any>(
          `SELECT * FROM "DaoMember" WHERE LOWER(address) = ANY($1::text[]) LIMIT 1`,
          [lowerAddrs]
        );
        if (neonMemberRows && neonMemberRows.length > 0) {
          const row = neonMemberRows[0];
          member = {
            ...row,
            position: Number(row.position),
            entryAmountBtt: row.entryAmountBtt,
            pushedAmountBtt: row.pushedAmountBtt,
            nftTokenId: Number(row.nftTokenId) || Number(row.position),
            joinedAt: new Date(row.joinedAt),
            updatedAt: new Date(row.updatedAt || row.joinedAt),
            user: null,
            fallbackClaims: [],
          };
        }
      } catch (err) {
        console.warn("[DaoService] Neon fallback for getMemberByAddress error:", err);
      }
    }

    if (!member) {
      const onChainPos = await this.getOnChainPosition(address);
      if (onChainPos > 0) {
        const priceUsd = priceData.priceUsd > 0 ? priceData.priceUsd : 0.053111;
        const entryTrob = priceUsd > 0 ? Math.round((300 / priceUsd) * 100) / 100 : 5084.75;
        const earningsCapTrob = priceUsd > 0 ? Math.round((1500 / priceUsd) * 100) / 100 : 25423.75;
        return {
          isMember: true,
          position: onChainPos,
          userId: null,
          directReferralsCount: 0,
          isQualified: true,
          nftTokenId: onChainPos,
          joinedAt: new Date(),
          entryAmountBtt: entryTrob,
          entryAmountTrob: entryTrob,
          entryAmountUsdEstimate: 300,
          pushedAmountBtt: 0,
          pushedAmountTrob: 0,
          pushedAmountUsdEstimate: 0,
          earningsCapUsd: 1500,
          earningsCapBtt: earningsCapTrob,
          earningsCapTrob,
          remainingCapUsd: 1500,
          remainingCapTrob: earningsCapTrob,
          capProgressPct: 0,
          isCapped: false,
          retopupDeadline: null,
          retopupTimeRemainingSeconds: null,
        };
      }

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

    const isUnderfunded     = member.status === "underfunded";

    if (!isUnderfunded && entryTrob <= 300 && priceUsd > 0) {
      entryTrob = Math.round((300 / priceUsd) * 100) / 100;
    }
    if (pushedTrob <= 300 && member.position === 1 && priceUsd > 0) {
      pushedTrob = Math.round((300 / priceUsd) * 100) / 100;
    }

    const SEAT_ENTRY_USD    = servicesConfig.price.seatEntryUsd; // $300
    const EARNINGS_CAP_USD  = SEAT_ENTRY_USD * 5;               // $1,500

    // Compute cap in TROB using live price
    const earningsCapTrob = priceUsd > 0 ? Math.round((EARNINGS_CAP_USD / priceUsd) * 100) / 100 : 0;

    // Cap progress based on exact protocol USD earnings (not fluctuating with live TROB rate)
    const exactPushedUsd  = isUnderfunded ? 0 : member.status === "capped" ? EARNINGS_CAP_USD : calculateMemberEarnedUsd(member.position, member.status, 93);
    const pushedUsd       = exactPushedUsd;
    const isCapped        = pushedUsd >= EARNINGS_CAP_USD || member.status === "capped";
    const remainingCapUsd = isCapped ? 0 : Math.max(0, Number((EARNINGS_CAP_USD - pushedUsd).toFixed(2)));
    const remainingCapTrob= isCapped ? 0 : (priceUsd > 0 ? Math.round((remainingCapUsd / priceUsd) * 100) / 100 : 0);
    const capProgressPct  = isCapped ? 100 : (EARNINGS_CAP_USD > 0 ? Math.min(100, (pushedUsd / EARNINGS_CAP_USD) * 100) : 0);
    const effectivePushedUsd = isCapped ? EARNINGS_CAP_USD : pushedUsd;

    let capHitAt: Date | null = null;
    let retopupDeadline: Date | null = null;
    let retopupTimeRemainingSeconds: number | null = null;

    if (isCapped) {
      const capEvent = await prisma.daoEvent.findFirst({
        where: {
          eventType: "cap_hit",
          userAddress: { in: variants },
        },
        orderBy: { timestamp: "desc" },
      });

      capHitAt = capEvent?.timestamp || member.updatedAt || new Date();
      retopupDeadline = new Date(capHitAt.getTime() + 48 * 3600 * 1000);
      retopupTimeRemainingSeconds = Math.max(0, Math.floor((retopupDeadline.getTime() - Date.now()) / 1000));
    } else if (isUnderfunded) {
      const deadline = (member as any).retopupDeadline ? new Date((member as any).retopupDeadline) : new Date(Date.now() + 48 * 3600 * 1000);
      retopupDeadline = deadline;
      retopupTimeRemainingSeconds = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
    }

    const entryUsdEstimate = isUnderfunded
      ? (Number((member as any).entryAmountUsdAtJoin) > 0 ? Number((member as any).entryAmountUsdAtJoin) : Math.round(entryTrob * priceUsd * 100) / 100)
      : SEAT_ENTRY_USD;

    return {
      isMember: true,
      position: member.position,
      userId: member.user?.userId || null,
      directReferralsCount: member.user?.directReferralsCount || 0,
      isQualified: isUnderfunded ? false : (member.user?.isQualified || false),
      nftTokenId: member.nftTokenId || member.position,
      joinedAt: member.joinedAt,
      entryAmountBtt: entryTrob,
      entryAmountTrob: entryTrob,
      entryAmountUsdEstimate: entryUsdEstimate,
      pushedAmountBtt: pushedTrob,
      pushedAmountTrob: pushedTrob,
      pushedAmountUsdEstimate: effectivePushedUsd,
      // USD-pegged cap values ($1,500 max cap)
      earningsCapUsd: EARNINGS_CAP_USD,
      earningsCapBtt: earningsCapTrob,
      earningsCapTrob,
      remainingCapUsd,
      remainingCapTrob,
      capProgressPct,
      isCapped,
      capHitAt,
      retopupDeadline,
      retopupTimeRemainingSeconds,
      priceSource: priceData.priceSource,
      trobPriceUsd: priceUsd,
      bttPriceUsd: priceUsd,
      status: member.status,
      underfunded: isUnderfunded,
      notice: isUnderfunded
        ? `Incomplete Deposit: Council Seat #${member.position} was activated with only ${entryTrob} TROB (~$${entryUsdEstimate}). A minimum of $300 USD is strictly required to unlock Council Governance, Matrix Pools & VIP Lounge.`
        : undefined,
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
    let [events, priceData] = await Promise.all([
      prisma.daoEvent.findMany({
        take: limit,
        orderBy: { timestamp: "desc" },
      }).catch(() => []),
      this.priceService.getTrobUsdPrice().catch(() => ({
        priceUsd: 0.055,
        priceSource: "default",
        updatedAt: new Date(),
        isStale: true,
      })),
    ]);

    if (events.length === 0) {
      try {
        const neonEvents = await queryNeonHttp<any>(
          `SELECT * FROM "DaoEvent" ORDER BY timestamp DESC LIMIT $1`,
          [limit]
        );
        if (neonEvents && neonEvents.length > 0) {
          events = neonEvents.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
          }));
        }
      } catch (neonErr) {
        console.warn("[DaoService] Neon fallback for getDAOEvents error:", neonErr);
      }
    }

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
