import { createPublicClient, http, Address, Log } from "viem";
import prisma from "@btitan/database";
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


export class BlockchainIndexer {
  private client: ReturnType<typeof createPublicClient>;
  private isRunning = false;

  constructor() {
    this.client = createPublicClient({
      transport: http(config.rpcUrl),
    });
  }

  async start() {
    console.log(`========================================================`);
    console.log(`📡 B-TITAN Blockchain Event Indexer Starting`);
    console.log(`🔗 RPC: ${config.rpcUrl}`);
    console.log(`🌍 Chain ID: ${config.chainId}`);
    console.log(`⏱️ Poll Interval: ${config.pollIntervalMs}ms`);
    console.log(`========================================================`);

    this.isRunning = true;
    this.pollLoop();
  }

  stop() {
    this.isRunning = false;
    console.log("🛑 Indexer stopped.");
  }

  private async pollLoop() {
    while (this.isRunning) {
      try {
        await this.syncNewBlocks();
      } catch (err: any) {
        console.error("⚠️ [Indexer Polling Error]", err?.message || err);
      }
      await new Promise((r) => setTimeout(r, config.pollIntervalMs));
    }
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
    const fromBlock = (await this.getCursor("BTitanRegistry", currentBlock)) + 1n;
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

    await this.updateCursor("BTitanRegistry", toBlock);
  }

  private async syncDAO(currentBlock: bigint) {
    const fromBlock = (await this.getCursor("BTitanDAO", currentBlock)) + 1n;
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

    await this.updateCursor("BTitanDAO", toBlock);
  }

  private async syncMatrix(currentBlock: bigint) {
    const fromBlock = (await this.getCursor("BTitanMatrix", currentBlock)) + 1n;
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

    await this.updateCursor("BTitanMatrix", toBlock);
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

