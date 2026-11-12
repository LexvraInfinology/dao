import dns from "node:dns";
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {}

import { createPublicClient, http, Address, Log, decodeFunctionResult, parseAbi } from "viem";
import crypto from "node:crypto";
import prisma from "@equora/database";
import { config } from "./config";
import { REGISTRY_ABI, DAO_ABI, MATRIX_ABI, NFT_ABI, VESTING_ABI, VAULT_ABI } from "./contracts";
import { handleUserRegistered } from "./handlers/registry.handler";
import { handleDepositRouted } from "./handlers/vault.handler";
import {
  handleDAOPositionJoined,
  handleDAOPayoutPushed,
  handleDAOPayoutFallback,
  handleFallbackClaimed,
  handleQueueClosed,
  handleRetopup,
  handleEarningsCapHit,
  handleSlotBlanked,
  handleSlotReactivated,
  handlePoolShareClaimed,
} from "./handlers/dao.handler";
import {
  handleSlotJoined,
  handlePositionFilled,
  handleDistributionExecuted,
  handleSlotAutoActivated,
  handleSlotAutoUpgraded,
  handleProtocolPoolFunded,
  handleCycleCompleted,
  handleMagicBoxUnlocked,
  handleDaoPoolFunded,
  handleDaoRewardClaimed,
  handleRankPoolFunded,
  handleRankAchieved,
} from "./handlers/matrix.handler";

import { createLogger } from "@equora/logger";

const logger = createLogger("Indexer");

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encodeBase58(buffer: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => B58_ALPHABET[d]).join("");
}

function hexToTrobBase58(addr: string): string {
  let clean = addr.trim();
  if (clean.startsWith("T") && clean.length === 34) return clean;
  if (clean.startsWith("0x") || clean.startsWith("0X")) {
    clean = "41" + clean.slice(2);
  } else if (!clean.startsWith("41") && clean.length === 40) {
    clean = "41" + clean;
  }
  clean = clean.toLowerCase();
  const bytes = Buffer.from(clean, "hex");
  const h1 = crypto.createHash("sha256").update(bytes).digest();
  const h2 = crypto.createHash("sha256").update(h1).digest();
  const checksum = h2.subarray(0, 4);
  const total = Buffer.concat([bytes, checksum]);
  return encodeBase58(total);
}

async function queryNeonDirect<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) return { rows: [] };
  const directUrl = dbUrl.replace("-pooler.", ".");
  const match = directUrl.match(/@([^/:]+)/);
  if (match && match[1]) {
    const endpoint = `https://${match[1]}/sql`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Neon-Connection-String": directUrl,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql, params }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const json = (await res.json()) as any;
        return { rows: (json.rows || []) as T[] };
      }
    } catch {
      // Fall through to Prisma queryRaw if HTTP endpoint is unavailable or times out
    }
  }

  try {
    const rows = await prisma.$queryRawUnsafe<T[]>(sql, ...params);
    return { rows: Array.isArray(rows) ? rows : [] };
  } catch (prismaErr) {
    throw prismaErr;
  }
}

export class BlockchainIndexer {
  private client: ReturnType<typeof createPublicClient>;
  private isRunning = false;
  private wasOffline = false;
  private lastOfflineNotification = 0;
  private hasLoggedOnline = false;
  private lastTrobMembersCount = 0;
  private lastProcessedBlock = 0n;
  private matrixSyncTick = 0;

  constructor() {
    this.client = createPublicClient({
      transport: http(config.rpcUrl),
    });
  }

  private isTrobChain(): boolean {
    return config.chainId === 1000 || (Boolean(config.rpcUrl) && config.rpcUrl.includes("trobchain"));
  }

  async start() {
    logger.info("========================================================");
    logger.info("📡 EQUORA Blockchain Event Indexer Starting");
    logger.info(`🔗 RPC: ${config.rpcUrl}`);
    logger.info(`🌍 Chain ID: ${config.chainId}`);
    logger.info(`⏱️ Poll Interval: ${Math.max(3000, config.pollIntervalMs)}ms`);
    logger.info("========================================================");

    this.isRunning = true;
    this.pollLoop();
  }

  stop() {
    this.isRunning = false;
    logger.info("🛑 Indexer stopped.");
  }

  private async pollLoop() {
    while (this.isRunning) {
      let sleepTime = Math.max(3000, config.pollIntervalMs);
      try {
        if (this.isTrobChain()) {
          await this.syncTrobChain();
          await this.syncTrobChainMatrix();
        } else {
          await this.syncNewBlocks();
        }
        if (this.wasOffline) {
          logger.success(`Reconnected to blockchain RPC at ${config.rpcUrl}`);
          this.wasOffline = false;
        }
      } catch (err: any) {
        const msg = String(err?.message || err || "").toLowerCase();
        const errName = String(err?.name || "");
        const isConnectionError =
          errName === "TimeoutError" ||
          errName === "AbortError" ||
          errName === "HttpRequestError" ||
          msg.includes("timeout") ||
          msg.includes("aborted") ||
          msg.includes("fetch failed") ||
          msg.includes("econnrefused") ||
          msg.includes("econnreset") ||
          msg.includes("etimedout") ||
          msg.includes("enotfound") ||
          msg.includes("und_err_connect_timeout") ||
          msg.includes("network error");

        if (isConnectionError) {
          const now = Date.now();
          if (!this.wasOffline || now - this.lastOfflineNotification > 30000) {
            logger.warn(`Waiting for blockchain RPC at ${config.rpcUrl} (node slow/offline, will auto-resume)`);
            this.lastOfflineNotification = now;
          }
          this.wasOffline = true;
          sleepTime = 8000;
        } else {
          logger.error("Indexer polling error:", err?.message || err);
        }
      }
      await new Promise((r) => setTimeout(r, sleepTime));
    }
  }

  private async syncTrobChain() {
    // 1. Check latest block from Java-Tron
    const blockRes = await fetch(`${config.rpcUrl}/wallet/getnowblock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!blockRes.ok) {
      throw new Error(`TrobChain getnowblock HTTP ${blockRes.status}`);
    }
    const blockData = (await blockRes.json()) as any;
    const currentBlock = BigInt(blockData.block_header?.raw_data?.number || 0);

    if (!this.hasLoggedOnline || this.wasOffline) {
      const netName = config.rpcUrl.includes("testnet") ? "TrobChain Testnet" : "TrobChain Mainnet";
      logger.info(`🔗 ${netName} Connected (Block #${currentBlock})`);
      this.hasLoggedOnline = true;
      this.wasOffline = false;
    }

    // Skip heavy member contract call if block has not changed
    if (this.lastProcessedBlock > 0n && currentBlock === this.lastProcessedBlock) {
      return;
    }

    // 2. Query DAO contract members
    const daoHex = (
      process.env.NEXT_PUBLIC_DAO_HEX
        ? (process.env.NEXT_PUBLIC_DAO_HEX.startsWith("0x") ? "41" + process.env.NEXT_PUBLIC_DAO_HEX.slice(2) : process.env.NEXT_PUBLIC_DAO_HEX)
        : ("41" + config.contracts.dao.slice(2))
    ).toLowerCase();

    const contractRes = await fetch(`${config.rpcUrl}/wallet/triggerconstantcontract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_address: daoHex,
        contract_address: daoHex,
        function_selector: "getAllMembers()",
        parameter: "",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!contractRes.ok) return;
    const contractData = (await contractRes.json()) as any;
    if (!contractData.constant_result?.[0]) return;

    const daoAbi = parseAbi(["function getAllMembers() view returns (address[])"]);
    const memberAddresses = decodeFunctionResult({
      abi: daoAbi,
      functionName: "getAllMembers",
      data: ("0x" + contractData.constant_result[0]) as `0x${string}`,
    }) as string[];

    const onChainCount = memberAddresses.length;
    const isZeroAddr = (hex: string) =>
      !hex ||
      /^0x0+$/.test(hex) ||
      /^410+$/.test(hex) ||
      hex === "0x0000000000000000000000000000000000000000";
    const activeMembersCount = memberAddresses.filter((addr) => !isZeroAddr(addr)).length;
    const vacantCount = onChainCount - activeMembersCount;
    const remainingSeats = 100 - activeMembersCount;

    // Check DB max position across all tracked seats (active, capped, vacant)
    const dbRes = await queryNeonDirect<{ count: string; max_pos: string }>(
      `SELECT COUNT(*) as count, COALESCE(MAX(position), 0) as max_pos FROM "DaoMember"`
    );
    const maxDbPos = parseInt(dbRes.rows[0]?.max_pos || "0", 10);

    if (onChainCount > maxDbPos) {
      logger.info(`⚡ [TrobChain] Detected ${onChainCount} on-chain members vs max position ${maxDbPos} in DB. Syncing new members...`);

      const detailsAbi = parseAbi([
        "function getMemberDetails(address) view returns (bool isMember, uint256 position, uint256 nftTokenId, uint256 fallbackClaimable, uint256 totalEarned, bool isCapped, uint256 retopupDeadline, bool isBlank, uint256 poolClaimable)"
      ]);

      let added = 0;
      const startIndex = Math.max(0, maxDbPos);
      for (let i = startIndex; i < memberAddresses.length; i++) {
        const rawHex = memberAddresses[i];
        const isZero = isZeroAddr(rawHex);
        const b58Addr = hexToTrobBase58(rawHex);
        const position = i + 1;

        if (isZero) {
          await queryNeonDirect(
            `INSERT INTO "DaoMember" (
               id, address, position, "joinedAt", "txHash", "blockNumber",
               "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId",
               "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt"
             )
             VALUES (
               gen_random_uuid(), $1, $2, NOW(), 'onchain-live-synced', 1,
               0, 0, $2, config.chainId === 1001 ? 'trobchain-testnet' : 'trobchain-mainnet', 0, 'vacant', NOW(), NOW()
             )
             ON CONFLICT (position) DO UPDATE
             SET status = 'vacant', "updatedAt" = NOW()`,
            [b58Addr, position]
          );
          added++;
          continue;
        }

        let totalEarnedTrob = 0;
        try {
          const detailRes = await fetch(`${config.rpcUrl}/wallet/triggerconstantcontract`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              owner_address: daoHex,
              contract_address: daoHex,
              function_selector: "getMemberDetails(address)",
              parameter: rawHex.replace(/^0x/, "").padStart(64, "0"),
            }),
            signal: AbortSignal.timeout(8000),
          });
          if (detailRes.ok) {
            const dJson = (await detailRes.json()) as any;
            if (dJson.constant_result?.[0]) {
              const dec = decodeFunctionResult({
                abi: detailsAbi,
                functionName: "getMemberDetails",
                data: ("0x" + dJson.constant_result[0]) as `0x${string}`,
              }) as any;
              const earnedBN = dec[4] || 0n;
              totalEarnedTrob = Number(earnedBN) / 1e6;
            }
          }
        } catch {}

        const maxIdRes = await queryNeonDirect(`SELECT COALESCE(MAX("userId"), 0) + 1 AS next_id FROM "User"`);
        const nextUserId = parseInt(maxIdRes.rows[0]?.next_id || "10001", 10);

        await queryNeonDirect(
          `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
           ON CONFLICT (address) DO NOTHING`,
          [b58Addr, nextUserId]
        );

        await queryNeonDirect(
          `INSERT INTO "DaoMember" (
             id, address, position, "joinedAt", "txHash", "blockNumber",
             "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId",
             "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt"
           )
           VALUES (
             gen_random_uuid(), $1, $2, NOW(), 'onchain-live-synced', 1,
             5357.14, 300, $2, config.chainId === 1001 ? 'trobchain-testnet' : 'trobchain-mainnet', $3, 'active', NOW(), NOW()
           )
           ON CONFLICT (position) DO UPDATE
           SET address = $1, "pushedAmountBtt" = $3, status = CASE WHEN "DaoMember".status = 'underfunded' THEN 'underfunded' ELSE 'active' END, "updatedAt" = NOW()`,
          [b58Addr, position, totalEarnedTrob]
        );

        added++;
      }

      await queryNeonDirect(
        `UPDATE "DaoInstance" SET capacity = 100, "isClosed" = $1, "updatedAt" = NOW() WHERE id = 1`,
        [activeMembersCount >= 100]
      );

      logger.info(`✅ [TrobChain] Synchronized ${added} new members. Active: ${activeMembersCount}/100, Vacant/Underfunded: ${vacantCount}.`);
    }

    if (this.lastTrobMembersCount !== activeMembersCount) {
      this.lastTrobMembersCount = activeMembersCount;
      logger.info(`📊 [TrobChain] Active Council Seats: ${activeMembersCount}/100 | Vacant/Underfunded: ${vacantCount} | Total Remaining: ${remainingSeats} | Block #${currentBlock}`);
    }

    this.lastProcessedBlock = currentBlock;

    // Update cursor
    try {
      await this.updateCursor("EquoraDAO", currentBlock);
    } catch {}
  }

  /**
   * Idempotent chunked TrobChain Mainnet Matrix & Registry event indexer.
   * Fetches confirmed transactions from explorer API + fullnode /wallet/gettransactioninfobyid
   * and replays V3 events in strict chronological log order every 3-5s poll cycle.
   */
  private async syncTrobChainMatrix() {
    if (!config.contracts.matrix || config.contracts.matrix === "0x0000000000000000000000000000000000000000") {
      return;
    }

    const TOPIC_USER_REGISTERED      = "b626e6cc43dfdcd60d2e41d199e03d0c90c4c7bb5c76193c8d6c31b88217f96c";
    const TOPIC_SLOT_JOINED          = "7e2b702419ffd2a85ba01fe01ef74fe54d739945e9b49382d02ed7def63f88bf";
    const TOPIC_POSITION_FILLED      = "42d060340aa5f20eedd25f97edb158bec9932d144acabe55a9d25654f43d1190";
    const TOPIC_DISTRIBUTION_EXEC    = "0f79e4865d07257d0cd65a1b0c4f973d40b9560870968cac1e7e8fe0a0478756";
    const TOPIC_SLOT_AUTO_ACTIVATED  = "972fc40fa49e0285cc46ec9cfbaeb31499345d5fa20792e320786cd7f2c871d8";
    const TOPIC_PROTOCOL_POOL_FUNDED = "eff9bcc4fa6ad3f562c89e603ceec41c0088ee21d2d1213004b14a743e934c23";
    const TOPIC_SPILLOVER_RESOLVED   = "efebe7790cea02090dc3214f813c124c663566a2a941d0babcc9653bfb51ac8c";
    const TOPIC_CYCLE_COMPLETED      = "b6e98e22c7e457ea5ccfbee8c4873ca4fe77c1dc9d598cb28fec67999f630445";
    const TOPIC_RANK_ACHIEVED        = "cd128610aee95a512dd8de94c18c10e5dd150ef2ebfa70a286e33946750ed6fc";

    const topicAddr = (topic?: string): string => {
      if (!topic || topic.length < 40) return "0x0000000000000000000000000000000000000000";
      return ("0x" + topic.slice(-40)).toLowerCase();
    };
    const wordHex = (data: string, wordIdx: number): string => {
      const start = wordIdx * 64;
      if (!data || data.length < start + 64) return "0".repeat(64);
      return data.slice(start, start + 64);
    };
    const wordBigInt = (data: string, wordIdx: number): bigint => BigInt("0x" + wordHex(data, wordIdx));
    const wordAddr = (data: string, wordIdx: number): string => ("0x" + wordHex(data, wordIdx).slice(24)).toLowerCase();

    const matrixHex20 = config.contracts.matrix.replace(/^0x/i, "").toLowerCase();
    const matrixBase58 = hexToTrobBase58("41" + matrixHex20);
    const registryHex20 = config.contracts.registry.replace(/^0x/i, "").toLowerCase();
    const salaryHex20 = config.contracts.salary.replace(/^0x/i, "").toLowerCase();
    const salaryTronHex = ("41" + salaryHex20).toLowerCase();

    this.matrixSyncTick++;
    if (this.matrixSyncTick % 5 === 1) {
      await this.syncTrobRoyaltyPools(salaryTronHex).catch(() => {});
    }
    const explorerBase =
      config.chainId === 1001
        ? (process.env.TESTNET_EXPLORER_API_URL || "https://testnet-backend.trobchain.com/v1")
        : (process.env.EXPLORER_API_URL || "https://backend.trobchain.com/v1");

    const cursor = await prisma.indexerCursor.findUnique({
      where: {
        contractName_chainId: {
          contractName: "EquoraMatrixTx",
          chainId: config.chainId,
        },
      },
    }).catch(() => null);

    const lastBlock = Number(cursor?.lastIndexedBlock ?? 0n);
    const pendingTxs: Array<{ hash: string; blockNumber: number; timestampSec: number }> = [];

    for (let page = 0; page < 20; page++) {
      const offset = page * 50;
      const listRes = await fetch(`${explorerBase}/accounts/${matrixBase58}/transactions?limit=50&offset=${offset}`, {
        headers: { "User-Agent": "EquoraIndexer/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!listRes.ok) break;
      const listJson = (await listRes.json()) as any;
      const rows: any[] = Array.isArray(listJson?.data) ? listJson.data : [];
      if (rows.length === 0) break;

      let reachedProcessedHorizon = false;
      for (const tx of rows) {
        if (tx.result && tx.result !== "SUCCESS") continue;
        const hash = String(tx.hash || tx.txID || tx.transaction_id || "").trim().toLowerCase();
        const blockNum = Number(tx.block_number || tx.blockNumber || tx.block || 0);
        if (!hash) continue;
        if (lastBlock > 0 && blockNum > 0 && blockNum < lastBlock) {
          reachedProcessedHorizon = true;
          continue;
        }
        const rawTs = tx.timestamp ? Date.parse(tx.timestamp) : Date.now();
        const tsSec = Number.isFinite(rawTs) ? Math.floor(rawTs / 1000) : Math.floor(Date.now() / 1000);
        pendingTxs.push({ hash, blockNumber: blockNum, timestampSec: tsSec });
      }
      if (reachedProcessedHorizon || rows.length < 50) break;
    }

    if (pendingTxs.length === 0) return;

    // Sort oldest -> newest so slot joins & cascades replay in exact blockchain execution order
    pendingTxs.sort((a, b) => (a.blockNumber - b.blockNumber) || (a.timestampSec - b.timestampSec));
    const batch = pendingTxs.slice(0, 40);
    let maxSyncedBlock = lastBlock;

    // Fetch receipts in chunks of 5 to keep RPC responsive
    for (let i = 0; i < batch.length; i += 5) {
      const chunk = batch.slice(i, i + 5);
      const receipts = await Promise.all(
        chunk.map(async (item) => {
          try {
            const res = await fetch(`${config.rpcUrl}/wallet/gettransactioninfobyid`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value: item.hash }),
              signal: AbortSignal.timeout(8000),
            });
            if (!res.ok) return { item, info: null };
            return { item, info: (await res.json()) as any };
          } catch {
            return { item, info: null };
          }
        })
      );

      for (const { item, info } of receipts) {
        if (!info || (info.receipt?.result && info.receipt.result !== "SUCCESS")) continue;
        const logs: any[] = Array.isArray(info.log) ? info.log : [];
        const blockNumBig = BigInt(info.blockNumber || item.blockNumber || 0);
        const blockTsSec = info.blockTimeStamp ? Math.floor(Number(info.blockTimeStamp) / 1000) : item.timestampSec;
        const activeCtx = new Map<string, { matrixOwner: string; participant: string }>();
        const fallbackCtx = new Map<number, boolean>();
        let lastCtx: { matrixOwner: string; participant: string } | null = null;

        for (const l of logs) {
          const logAddr = String(l.address || "").replace(/^0x/i, "").toLowerCase();
          const topics: string[] = Array.isArray(l.topics) ? l.topics : [];
          if (topics.length === 0) continue;
          const t0 = String(topics[0] || "").toLowerCase();
          const data = String(l.data || "").replace(/^0x/i, "");

          if (logAddr === registryHex20 && t0 === TOPIC_USER_REGISTERED && topics.length >= 4) {
            await handleUserRegistered({
              user: topicAddr(topics[1]),
              sponsor: topicAddr(topics[2]),
              userId: BigInt("0x" + topics[3]),
              timestamp: wordBigInt(data, 0),
              txHash: item.hash,
              blockNumber: blockNumBig,
            });
            continue;
          }

          if (logAddr === salaryHex20 && t0 === TOPIC_RANK_ACHIEVED && topics.length >= 2) {
            await handleRankAchieved({
              user: topicAddr(topics[1]),
              newTier: Number(wordBigInt(data, 0)),
              timestamp: wordBigInt(data, 2),
              txHash: item.hash,
            });
            continue;
          }

          if (logAddr !== matrixHex20) continue;

          if (t0 === TOPIC_SLOT_JOINED && topics.length >= 3) {
            await handleSlotJoined({
              user: topicAddr(topics[1]),
              slot: BigInt("0x" + topics[2]),
              cost: wordBigInt(data, 0),
              sponsor: wordAddr(data, 1),
              timestamp: wordBigInt(data, 2),
              txHash: item.hash,
              blockNumber: blockNumBig,
            });
          } else if (t0 === TOPIC_POSITION_FILLED && topics.length >= 4) {
            const matrixOwner = topicAddr(topics[1]);
            const slot = Number(BigInt("0x" + topics[2]));
            const cycle = BigInt("0x" + topics[3]);
            const position = Number(wordBigInt(data, 0));
            const participant = wordAddr(data, 1);
            const amount = wordBigInt(data, 2);

            const ctxObj = { matrixOwner, participant };
            activeCtx.set(`${slot}-${position}`, ctxObj);
            lastCtx = ctxObj;

            await handlePositionFilled({
              matrixOwner,
              participant,
              slot,
              cycle,
              position,
              amount,
              txHash: item.hash,
              blockNumber: blockNumBig,
              timestamp: BigInt(blockTsSec),
            });
          } else if (t0 === TOPIC_SPILLOVER_RESOLVED && topics.length >= 3) {
            const pos = Number(wordBigInt(data, 0));
            const wasFallback = wordBigInt(data, 1) !== 0n;
            fallbackCtx.set(pos, wasFallback);
          } else if (t0 === TOPIC_DISTRIBUTION_EXEC && topics.length >= 2) {
            const recipient = topicAddr(topics[1]);
            const amount = wordBigInt(data, 0);
            const payoutTypeIndex = Number(wordBigInt(data, 1));
            const slot = Number(wordBigInt(data, 2));
            const cycle = wordBigInt(data, 3);
            const position = Number(wordBigInt(data, 4));

            const ctx = activeCtx.get(`${slot}-${position}`) ?? lastCtx ?? { matrixOwner: recipient, participant: recipient };
            await handleDistributionExecuted({
              recipient,
              amount,
              payoutTypeIndex,
              slot,
              cycle,
              position,
              matrixOwner: ctx.matrixOwner,
              participant: ctx.participant,
              wasFallback: fallbackCtx.get(position) ?? false,
              txHash: item.hash,
              blockNumber: blockNumBig,
              timestamp: BigInt(blockTsSec),
            });
          } else if (t0 === TOPIC_SLOT_AUTO_ACTIVATED && topics.length >= 4) {
            await handleSlotAutoActivated({
              user: topicAddr(topics[1]),
              fromSlot: Number(BigInt("0x" + topics[2])),
              toSlot: Number(BigInt("0x" + topics[3])),
              timestamp: wordBigInt(data, 0),
              txHash: item.hash,
              blockNumber: blockNumBig,
            });
          } else if (t0 === TOPIC_PROTOCOL_POOL_FUNDED && topics.length >= 2) {
            await handleProtocolPoolFunded({
              matrixOwner: topicAddr(topics[1]),
              amount: wordBigInt(data, 0),
              slot: Number(wordBigInt(data, 1)),
              cycle: wordBigInt(data, 2),
              position: Number(wordBigInt(data, 3)),
              timestamp: wordBigInt(data, 4),
              txHash: item.hash,
            });
          } else if (t0 === TOPIC_CYCLE_COMPLETED && topics.length >= 3) {
            await handleCycleCompleted({
              user: topicAddr(topics[1]),
              slot: Number(BigInt("0x" + topics[2])),
              cycleNumber: wordBigInt(data, 0),
              timestamp: wordBigInt(data, 1),
              txHash: item.hash,
              blockNumber: blockNumBig,
            });
          }
        }

        const bNum = Number(blockNumBig);
        if (bNum > maxSyncedBlock) maxSyncedBlock = bNum;
      }

      if (maxSyncedBlock > lastBlock) {
        await this.updateCursor("EquoraMatrixTx", BigInt(maxSyncedBlock)).catch(() => {});
      }
    }

    logger.info(`✅ [TrobChain] Indexed ${batch.length} Matrix transactions up to block #${maxSyncedBlock}`);
  }

  private async syncTrobRoyaltyPools(salaryTronHex: string) {
    try {
      const res = await fetch(`${config.rpcUrl}/wallet/triggerconstantcontract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_address: salaryTronHex,
          contract_address: salaryTronHex,
          function_selector: "getPoolCounts()",
          parameter: "",
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return;
      const json = (await res.json()) as any;
      const raw = String(json?.constant_result?.[0] || "");
      if (raw.length < 256) return;

      const tiers = [
        { tier: 1, tierName: "ALPHA", count: Number(BigInt("0x" + raw.slice(0, 64))) },
        { tier: 2, tierName: "PRIME", count: Number(BigInt("0x" + raw.slice(64, 128))) },
        { tier: 3, tierName: "ELITE", count: Number(BigInt("0x" + raw.slice(128, 192))) },
        { tier: 4, tierName: "CROWN", count: Number(BigInt("0x" + raw.slice(192, 256))) },
      ];

      for (const item of tiers) {
        await prisma.matrixRankPoolState.upsert({
          where: { tier: item.tier },
          create: {
            tier: item.tier,
            tierName: item.tierName,
            qualifierCount: item.count,
          },
          update: {
            tierName: item.tierName,
            qualifierCount: item.count,
          },
        }).catch(() => {});
      }
    } catch {}
  }

  private async getCursor(contractName: string, currentBlock?: bigint): Promise<bigint> {
    const cursor = await prisma.indexerCursor.findUnique({
      where: {
        contractName_chainId: {
          contractName,
          chainId: config.chainId,
        },
      },
    });

    if (!cursor) return config.startBlock;
    if (currentBlock !== undefined && cursor.lastIndexedBlock > currentBlock) {
      return 0n;
    }
    return cursor.lastIndexedBlock;
  }


  private async updateCursor(contractName: string, blockNumber: bigint) {
    await prisma.indexerCursor.upsert({
      where: {
        contractName_chainId: {
          contractName,
          chainId: config.chainId,
        },
      },
      create: {
        contractName,
        chainId: config.chainId,
        lastIndexedBlock: blockNumber,
      },
      update: {
        lastIndexedBlock: blockNumber,
      },
    });
  }

  private async syncNewBlocks() {
    const currentBlock = await this.client.getBlockNumber();

    // 1. Sync Registry events
    if (config.contracts.registry && config.contracts.registry !== "0x0000000000000000000000000000000000000000") {
      await this.syncRegistry(currentBlock);
    }

    // 2. Sync DAO events
    if (config.contracts.dao && config.contracts.dao !== "0x0000000000000000000000000000000000000000") {
      await this.syncDAO(currentBlock);
    }

    // 3. Sync Matrix events
    if (config.contracts.matrix && config.contracts.matrix !== "0x0000000000000000000000000000000000000000") {
      await this.syncMatrix(currentBlock);
    }

    // 4. Sync Vault events
    if (config.contracts.vault && config.contracts.vault !== "0x0000000000000000000000000000000000000000") {
      await this.syncVault(currentBlock);
    }
  }

  private async syncRegistry(currentBlock: bigint) {
    const fromBlock = (await this.getCursor("EquoraRegistry", currentBlock)) + 1n;
    if (fromBlock > currentBlock) return;

    const toBlock = currentBlock - fromBlock > 2000n ? fromBlock + 2000n : currentBlock;

    const logs = await this.client.getContractEvents({
      address: config.contracts.registry,
      abi: REGISTRY_ABI,
      eventName: "UserRegistered",
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      const { user, sponsor, userId, timestamp } = log.args as any;
      await handleUserRegistered({
        user,
        sponsor,
        userId,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    await this.updateCursor("EquoraRegistry", toBlock);
  }

  private async syncDAO(currentBlock: bigint) {
    const fromBlock = (await this.getCursor("EquoraDAO", currentBlock)) + 1n;
    if (fromBlock > currentBlock) return;

    const toBlock = currentBlock - fromBlock > 2000n ? fromBlock + 2000n : currentBlock;

    const [
      joinedLogs,
      pushLogs,
      fallbackLogs,
      claimLogs,
      closedLogs,
      retopupLogs,
      capLogs,
      blankLogs,
      reactivatedLogs,
      poolClaimLogs,
    ] = await Promise.all([
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "DAOPositionJoined",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "DAOPayoutPushed",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "DAOPayoutFallback",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "FallbackClaimed",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "QueueClosed",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "Retopup",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "EarningsCapHit",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "SlotBlanked",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "SlotReactivated",
        fromBlock,
        toBlock,
      }),
      this.client.getContractEvents({
        address: config.contracts.dao,
        abi: DAO_ABI,
        eventName: "PoolShareClaimed",
        fromBlock,
        toBlock,
      }),
    ]);

    for (const log of joinedLogs) {
      const { user, position, tokenId, timestamp } = log.args as any;
      await handleDAOPositionJoined({
        user,
        position,
        tokenId,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of pushLogs) {
      const { recipient, amount, fromPosition, timestamp } = log.args as any;
      await handleDAOPayoutPushed({
        recipient,
        amount,
        fromPosition,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of fallbackLogs) {
      const { recipient, amount, fromPosition, reason, timestamp } = log.args as any;
      await handleDAOPayoutFallback({
        recipient,
        amount,
        fromPosition,
        reason,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of claimLogs) {
      const { user, amount, timestamp } = log.args as any;
      await handleFallbackClaimed({
        user,
        amount,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of closedLogs) {
      const { totalMembers, timestamp } = log.args as any;
      await handleQueueClosed({
        totalMembers,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of retopupLogs) {
      const { member, position, timestamp } = log.args as any;
      await handleRetopup({
        member,
        position,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of capLogs) {
      const { member, lifetimeEarnings, retopupDeadline } = log.args as any;
      await handleEarningsCapHit({
        member,
        lifetimeEarnings,
        retopupDeadline,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of blankLogs) {
      const { member, timestamp } = log.args as any;
      await handleSlotBlanked({
        member,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of reactivatedLogs) {
      const { member, timestamp } = log.args as any;
      await handleSlotReactivated({
        member,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    for (const log of poolClaimLogs) {
      const { member, amount, timestamp } = log.args as any;
      await handlePoolShareClaimed({
        member,
        amount,
        timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    await this.updateCursor("EquoraDAO", toBlock);
  }

  private async syncMatrix(currentBlock: bigint) {
    const fromBlock = (await this.getCursor("EquoraMatrix", currentBlock)) + 1n;
    if (fromBlock > currentBlock) return;

    const toBlock = currentBlock - fromBlock > 2000n ? fromBlock + 2000n : currentBlock;

    const [
      slotJoinedLogs,
      positionFilledLogs,
      distributionLogs,
      spilloverLogs,
      autoUpgradedLogs,
      cycleLogs,
      magicBoxLogs,
      daoPoolFundedLogs,
      daoRewardClaimedLogs,
      rankPoolFundedLogs,
    ] = await Promise.all([
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "SlotJoined",           fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "PositionFilled",       fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "DistributionExecuted", fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "SpilloverResolved",    fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "SlotAutoActivated",    fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "CycleCompleted",       fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "MagicBoxUnlocked",     fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "ProtocolPoolFunded",   fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "DaoRewardClaimed",     fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "RankPoolFunded",       fromBlock, toBlock }),
    ]);

    // ── SlotJoined ──────────────────────────────────────────────────────────
    for (const log of slotJoinedLogs) {
      const { user, slot, cost, sponsor, timestamp } = log.args as any;
      await handleSlotJoined({ user, slot, cost, sponsor, timestamp, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
    }

    // ── PositionFilled (grid state) ──────────────────────────────────────────
    // Build a txHash+logIndex map so DistributionExecuted events can correlate context
    const positionContext = new Map<string, { matrixOwner: string; participant: string; slot: number; cycle: bigint; position: number }>();
    for (const log of positionFilledLogs) {
      const { matrixOwner, participant, slot, cycle, position, amount } = log.args as any;
      const block = await this.client.getBlock({ blockNumber: log.blockNumber! });
      await handlePositionFilled({ matrixOwner, participant, slot: Number(slot), cycle, position: Number(position), amount, txHash: log.transactionHash!, blockNumber: log.blockNumber!, timestamp: block.timestamp });
      // Key: txHash+position — used by DistributionExecuted to recover context
      positionContext.set(`${log.transactionHash!}-${Number(position)}`, { matrixOwner, participant: participant ?? matrixOwner, slot: Number(slot), cycle, position: Number(position) });
    }

    // Build spillover fallback context (txHash+position -> wasFallback)
    const fallbackContext = new Map<string, boolean>();
    for (const log of spilloverLogs) {
      const { position, wasOwnerFallback } = log.args as any;
      fallbackContext.set(`${log.transactionHash!}-${Number(position)}`, Boolean(wasOwnerFallback));
    }

    // ── DistributionExecuted (financial audit) ───────────────────────────────
    for (const log of distributionLogs) {
      const { recipient, amount, payoutType: payoutTypeIndex, slot, cycle, position } = log.args as any;
      const key = `${log.transactionHash!}-${Number(position)}`;
      const ctx = positionContext.get(key) ?? { matrixOwner: recipient, participant: recipient, slot: Number(slot), cycle, position: Number(position) };
      const wasFallback = fallbackContext.get(key) ?? false;
      const block = await this.client.getBlock({ blockNumber: log.blockNumber! });

      await handleDistributionExecuted({
        recipient,
        amount,
        payoutTypeIndex: Number(payoutTypeIndex),
        slot: Number(slot),
        cycle,
        position: Number(position),
        matrixOwner: ctx.matrixOwner,
        participant: ctx.participant,
        wasFallback,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
        timestamp: block.timestamp,
      });
    }

    // ── SlotAutoActivated / SlotAutoUpgraded ─────────────────────────────────
    for (const log of autoUpgradedLogs) {
      const args = log.args as any;
      await handleSlotAutoActivated({
        user: args.user,
        fromSlot: Number(args.fromSlot),
        toSlot: Number(args.activatedSlot ?? args.toSlot),
        timestamp: args.timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    // ── CycleCompleted ───────────────────────────────────────────────────────
    for (const log of cycleLogs) {
      const { user, slot, cycleNumber, timestamp } = log.args as any;
      await handleCycleCompleted({ user, slot: Number(slot), cycleNumber, timestamp, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
    }

    // ── MagicBoxUnlocked ─────────────────────────────────────────────────────
    for (const log of magicBoxLogs) {
      const { user, slot, rank, timestamp } = log.args as any;
      await handleMagicBoxUnlocked({ user, slot, rank: Number(rank), timestamp, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
    }

    // ── ProtocolPoolFunded ───────────────────────────────────────────────────
    for (const log of daoPoolFundedLogs) {
      const args = log.args as any;
      if (args.matrixOwner) {
        await handleProtocolPoolFunded({
          matrixOwner: args.matrixOwner,
          amount: args.amount,
          slot: Number(args.slot),
          cycle: args.cycle,
          position: Number(args.position),
          timestamp: args.timestamp,
          txHash: log.transactionHash!,
        });
      } else {
        await handleDaoPoolFunded({ amount: args.amount, newAccRewardPerShare: args.newAccRewardPerShare, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
      }
    }

    // ── DaoRewardClaimed ─────────────────────────────────────────────────────
    for (const log of daoRewardClaimedLogs) {
      const { member, amount } = log.args as any;
      await handleDaoRewardClaimed({ member, amount, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
    }

    // ── RankPoolFunded ───────────────────────────────────────────────────────
    for (const log of rankPoolFundedLogs) {
      const { amount } = log.args as any;
      await handleRankPoolFunded({ amount, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
    }

    await this.updateCursor("EquoraMatrix", toBlock);
  }

  private async syncVault(currentBlock: bigint) {
    const fromBlock = (await this.getCursor("EquoraVault", currentBlock)) + 1n;
    if (fromBlock > currentBlock) return;

    const toBlock = currentBlock - fromBlock > 2000n ? fromBlock + 2000n : currentBlock;

    const depositLogs = await this.client.getContractEvents({
      address: config.contracts.vault,
      abi: VAULT_ABI,
      eventName: "DepositRouted",
      fromBlock,
      toBlock,
    });

    for (const log of depositLogs) {
      const { user, totalAmount, daoAmount, salaryAmount, magicBoxAmount, rewardsAmount } = log.args as any;
      const block = await this.client.getBlock({ blockNumber: log.blockNumber! });

      await handleDepositRouted({
        user,
        totalAmount,
        daoAmount,
        salaryAmount,
        magicBoxAmount,
        rewardsAmount,
        timestamp: block.timestamp,
        txHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
      });
    }

    await this.updateCursor("EquoraVault", toBlock);
  }
}

