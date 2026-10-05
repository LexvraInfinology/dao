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
  handleSlotAutoUpgraded,
  handleCycleCompleted,
  handleMagicBoxUnlocked,
  handleDaoPoolFunded,
  handleDaoRewardClaimed,
  handleRankPoolFunded,
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
  const dbUrl =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_VzZWl5Td8gxf@ep-super-heart-ax2fet8a.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
  const match = dbUrl.match(/@([^/:]+)/);
  if (!match || !match[1]) return { rows: [] };
  const endpoint = `https://${match[1]}/sql`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Neon-Connection-String": dbUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) {
    throw new Error(`Neon SQL error: ${res.statusText}`);
  }
  const json = (await res.json()) as any;
  return { rows: (json.rows || []) as T[] };
}

export class BlockchainIndexer {
  private client: ReturnType<typeof createPublicClient>;
  private isRunning = false;
  private wasOffline = false;
  private lastOfflineNotification = 0;
  private hasLoggedOnline = false;
  private lastTrobMembersCount = 0;

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
    logger.info(`⏱️ Poll Interval: ${config.pollIntervalMs}ms`);
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
      try {
        if (this.isTrobChain()) {
          await this.syncTrobChain();
        } else {
          await this.syncNewBlocks();
        }
        if (this.wasOffline) {
          logger.success(`Reconnected to blockchain RPC at ${config.rpcUrl}`);
          this.wasOffline = false;
        }
      } catch (err: any) {
        const isConnectionError =
          err?.message?.includes("fetch failed") ||
          err?.message?.includes("ECONNREFUSED") ||
          err?.name === "HttpRequestError";

        if (isConnectionError) {
          const now = Date.now();
          if (!this.wasOffline || now - this.lastOfflineNotification > 15000) {
            logger.warn(`Waiting for blockchain RPC at ${config.rpcUrl} (node offline, will auto-resume when online)`);
            this.lastOfflineNotification = now;
          }
          this.wasOffline = true;
        } else {
          logger.error("Indexer polling error:", err?.message || err);
        }
      }
      await new Promise((r) => setTimeout(r, config.pollIntervalMs));
    }
  }

  private async syncTrobChain() {
    // 1. Check latest block from Java-Tron
    const blockRes = await fetch(`${config.rpcUrl}/wallet/getnowblock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!blockRes.ok) {
      throw new Error(`TrobChain getnowblock HTTP ${blockRes.status}`);
    }
    const blockData = (await blockRes.json()) as any;
    const currentBlock = BigInt(blockData.block_header?.raw_data?.number || 0);

    if (!this.hasLoggedOnline || this.wasOffline) {
      logger.info(`🔗 TrobChain Mainnet Connected (Block #${currentBlock})`);
      this.hasLoggedOnline = true;
      this.wasOffline = false;
    }

    // 2. Query DAO contract members
    const rawDao = process.env.NEXT_PUBLIC_DAO_HEX || process.env.NEXT_PUBLIC_DAO_ADDRESS || "419031dbc5faddd365a9b3d40ddc0c550ca0f369e4";
    const daoHex = (rawDao.startsWith("0x") ? "41" + rawDao.slice(2) : rawDao).toLowerCase();

    const contractRes = await fetch(`${config.rpcUrl}/wallet/triggerconstantcontract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_address: daoHex,
        contract_address: daoHex,
        function_selector: "getAllMembers()",
        parameter: "",
      }),
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

    // Check DB count (include underfunded to match all on-chain seats)
    const dbRes = await queryNeonDirect<{ count: string; max_pos: string }>(
      `SELECT COUNT(*) as count, COALESCE(MAX(position), 0) as max_pos FROM "DaoMember" WHERE LOWER(status) IN ('active', 'capped', 'underfunded')`
    );
    const dbCount = parseInt(dbRes.rows[0]?.count || "0", 10);
    const maxDbPos = parseInt(dbRes.rows[0]?.max_pos || "0", 10);

    if (onChainCount > dbCount || onChainCount > maxDbPos) {
      logger.info(`⚡ [TrobChain] Detected ${onChainCount} on-chain members vs ${dbCount} in DB. Syncing new members...`);

      const detailsAbi = parseAbi([
        "function getMemberDetails(address) view returns (bool isMember, uint256 position, uint256 nftTokenId, uint256 fallbackClaimable, uint256 totalEarned, bool isCapped, uint256 retopupDeadline, bool isBlank, uint256 poolClaimable)"
      ]);

      let added = 0;
      for (let i = 0; i < memberAddresses.length; i++) {
        const rawHex = memberAddresses[i];
        const b58Addr = hexToTrobBase58(rawHex);
        const position = i + 1;

        const checkRes = await queryNeonDirect(
          `SELECT id, address FROM "DaoMember" WHERE position = $1 LIMIT 1`,
          [position]
        );

        if (checkRes.rows.length === 0 || checkRes.rows[0].address.toLowerCase() !== b58Addr.toLowerCase()) {
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
               5084.75, 300, $2, 'trobchain-mainnet', $3, 'active', NOW(), NOW()
             )
             ON CONFLICT (position) DO UPDATE
             SET address = $1, "pushedAmountBtt" = $3, status = CASE WHEN "DaoMember".status = 'underfunded' THEN 'underfunded' ELSE 'active' END, "updatedAt" = NOW()`,
            [b58Addr, position, totalEarnedTrob]
          );

          added++;
        }
      }

      await queryNeonDirect(
        `UPDATE "DaoInstance" SET capacity = 100, "isClosed" = $1, "updatedAt" = NOW() WHERE id = 1`,
        [onChainCount >= 100]
      );

      logger.info(`✅ [TrobChain] Synchronized ${added} new members. Total active: ${onChainCount}/100.`);
    }

    if (this.lastTrobMembersCount !== onChainCount) {
      this.lastTrobMembersCount = onChainCount;
      logger.info(`📊 [TrobChain] Active Council Seats: ${onChainCount}/100 | Remaining: ${Math.max(0, 100 - onChainCount)} | Block #${currentBlock}`);
    }

    // Update cursor
    try {
      await queryNeonDirect(
        `INSERT INTO "IndexerCursor" (id, "contractName", "chainId", "lastIndexedBlock", "updatedAt")
         VALUES (gen_random_uuid(), 'EquoraDAO', $1, $2, NOW())
         ON CONFLICT ("contractName", "chainId") DO UPDATE
         SET "lastIndexedBlock" = $2, "updatedAt" = NOW()`,
        [config.chainId, currentBlock.toString()]
      );
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
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "SlotAutoUpgraded",     fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "CycleCompleted",       fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "MagicBoxUnlocked",     fromBlock, toBlock }),
      this.client.getContractEvents({ address: config.contracts.matrix, abi: MATRIX_ABI, eventName: "DaoPoolFunded",        fromBlock, toBlock }),
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

    // ── SlotAutoUpgraded ─────────────────────────────────────────────────────
    for (const log of autoUpgradedLogs) {
      const { user, fromSlot, toSlot, timestamp } = log.args as any;
      await handleSlotAutoUpgraded({ user, fromSlot: Number(fromSlot), toSlot: Number(toSlot), timestamp, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
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

    // ── DaoPoolFunded ────────────────────────────────────────────────────────
    for (const log of daoPoolFundedLogs) {
      const { amount, newAccRewardPerShare } = log.args as any;
      await handleDaoPoolFunded({ amount, newAccRewardPerShare, txHash: log.transactionHash!, blockNumber: log.blockNumber! });
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

