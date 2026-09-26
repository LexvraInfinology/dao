import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import * as trpcExpress from "@trpc/server/adapters/express";
import { serverRouter, createContext } from "@equora/trpc";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/requireAuth";
import { daoService, statsService, authService, priceService, servicesConfig } from "@equora/services";
import prisma from "@equora/database";
import { createPublicClient, http, parseAbi } from "viem";

export function createApp(): Express {
  const app = express();

  // ── Security & Standard Middleware ────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  const configuredOrigins = (config.corsOrigin || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.env === "development" || config.corsOrigin === "*") {
          return callback(null, true);
        }
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          configuredOrigins.includes(origin)
        ) {
          return callback(null, true);
        }
        callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Root & Health ─────────────────────────────────────────────────────────
  app.get("/", (_req, res) => {
    res.json({
      message: "EQUORA Protocol API is up and running...",
      service: "@equora/api",
      version: "1.0.0",
      trpcEndpoint: "/trpc",
      healthEndpoint: "/health",
      chainId: config.blockchain.chainId,
    });
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "healthy",
      service: "equora-api",
      timestamp: new Date().toISOString(),
      chainId: config.blockchain.chainId,
    });
  });

  // ── PRICE ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/price/trob
   * Returns the current live TROB/USD price from Chainlink (or fallback).
   * Used by the frontend to calculate how many TROB = $300 for seat minting.
   */
  app.get("/api/price/trob", async (_req, res, next) => {
    try {
      const price = await priceService.getBttUsdPrice();
      if (!price || !price.priceUsd || price.priceUsd <= 0) {
        res.status(503).json({
          success: false,
          error: "Live TROB market rate unavailable: live oracle or API feed required.",
        });
        return;
      }
      const seatEntryUsd = servicesConfig.price.seatEntryUsd;
      const trobAmountForSeat = seatEntryUsd / price.priceUsd;
      res.json({
        success: true,
        data: {
          priceUsd: price.priceUsd,
          priceSource: price.priceSource,
          updatedAt: price.updatedAt,
          isStale: price.isStale,
          seatEntryUsd: seatEntryUsd,
          seatEntryTrob: Math.ceil(trobAmountForSeat * 1000) / 1000,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── AUTH (SIWE + JWT) ─────────────────────────────────────────────────────

  /**
   * POST /api/auth/nonce
   * Body: { address: string }
   * Returns a one-time nonce for EIP-4361 Sign-In With Ethereum.
   */
  app.post("/api/auth/nonce", async (req, res, next) => {
    try {
      const { address } = req.body as { address?: string };
      if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
        res.status(400).json({ success: false, error: "Valid Ethereum address required." });
        return;
      }
      const nonce = await authService.generateNonceForAddress(address);
      res.json({ success: true, data: { nonce } });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/auth/verify
   * Body: { message: string, signature: string }
   * Verifies SIWE message + signature, returns JWT + user profile.
   */
  app.post("/api/auth/verify", async (req, res, next) => {
    try {
      const { message, signature } = req.body as {
        message?: string;
        signature?: string;
      };
      if (!message || !signature) {
        res.status(400).json({ success: false, error: "message and signature are required." });
        return;
      }
      const result = await authService.verifySignature(message, signature);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/auth/session
   * Authorization: Bearer <token>
   * Returns the authenticated user's session profile.
   */
  app.get("/api/auth/session", requireAuth, async (req, res, next) => {
    try {
      const { address } = (req as any).user as { address: string };
      const profile = await authService.getSessionProfile(address);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  });

  // ── DAO STATS & MEMBERS (public) ──────────────────────────────────────────

  /** GET /api/dao/stats */
  app.get("/api/dao/stats", async (_req, res, next) => {
    try {
      const stats = await daoService.getDAOStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  });

  /** GET /api/dao/members?page=&limit= */
  app.get("/api/dao/members", async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
      const members = await daoService.getDAOMembers(page, limit);
      res.json({ success: true, data: members });
    } catch (err) {
      next(err);
    }
  });

  /** GET /api/dao/events?limit= */
  app.get("/api/dao/events", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const events = await daoService.getDAOEvents(limit);
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  });

  /** GET /api/dao/member/:address — basic membership check */
  app.get("/api/dao/member/:address", async (req, res, next) => {
    try {
      const member = await daoService.getMemberByAddress(req.params.address);
      res.json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  });

  /** POST /api/dao/claim — claim or activate council seat membership with blockchain verification & 300/N distribution */
  app.post("/api/dao/claim", async (req, res, next) => {
    try {
      const { address, txHash } = req.body as { address?: string; txHash?: string };
      if (!address || typeof address !== "string") {
        res.status(400).json({ success: false, error: "wallet address is required" });
        return;
      }

      const canonicalAddress = address.trim().toLowerCase();

      // 1. Blockchain On-Chain Verification
      let verifiedBlockNumber = 0n;
      let onchainVerified = false;

      if (txHash && typeof txHash === "string" && /^0x[0-9a-fA-F]{64}$/.test(txHash)) {
        try {
          const client = createPublicClient({
            transport: http(config.blockchain.rpcUrl),
          });
          const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
          if (receipt) {
            verifiedBlockNumber = receipt.blockNumber;
            if (receipt.status === "success") {
              onchainVerified = true;
            }
          }
        } catch (err) {
          console.log(`[DAO Claim] On-chain receipt verification note for ${txHash}:`, (err as Error).message);
        }
      }

      // Check on-chain member status in EquoraDAO contract if configured
      const daoContractAddress = (process.env.NEXT_PUBLIC_DAO_ADDRESS || "0x4b6aB5F819A515382B0dEB6935D793817bB4af28") as `0x${string}`;
      if (daoContractAddress && /^0x[0-9a-fA-F]{40}$/.test(canonicalAddress)) {
        try {
          const client = createPublicClient({
            transport: http(config.blockchain.rpcUrl),
          });
          const isMemberOnchain = await client.readContract({
            address: daoContractAddress,
            abi: parseAbi(["function isDaoMember(address) external view returns (bool)"]),
            functionName: "isDaoMember",
            args: [canonicalAddress as `0x${string}`],
          });
          if (isMemberOnchain) {
            onchainVerified = true;
          }
        } catch (_) {}
      }

      // 2. Ensure user exists in database
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { address: address.trim() },
            { address: canonicalAddress },
          ],
        },
      });

      if (!user) {
        const userCount = await prisma.user.count();
        user = await prisma.user.create({
          data: {
            address: canonicalAddress,
            userId: userCount + 1,
            registrationTimestamp: new Date(),
          },
        });
      }

      // 3. Check if already a member
      const existingMember = await prisma.daoMember.findFirst({
        where: {
          OR: [
            { address: address.trim() },
            { address: canonicalAddress },
            { address: user.address },
          ],
        },
      });

      if (existingMember) {
        res.json({
          success: true,
          data: {
            isMember: true,
            position: existingMember.position,
            address: user.address,
            entryAmountBtt: Number(existingMember.entryAmountBtt),
            pushedAmountBtt: Number(existingMember.pushedAmountBtt),
            txHash: existingMember.txHash,
            alreadyMember: true,
          },
        });
        return;
      }

      // 4. Capacity verification (100 Sovereign Seats)
      const memberCount = await prisma.daoMember.count();
      if (memberCount >= 100) {
        res.status(400).json({ success: false, error: "Genesis DAO Council is full (100/100 seats claimed)." });
        return;
      }
      const nextPosition = memberCount + 1;

      // 5. Calculate 300 / N Cashback & Dividend Distribution
      // In EquoraDAO.sol: ENTRY_FEE = 300 ether; activeCount = nextPosition; amountPerRecipient = ENTRY_FEE / activeCount
      const ENTRY_FEE = 300;
      const cashbackPerMember = Number((ENTRY_FEE / nextPosition).toFixed(4));
      const memberTxHash = txHash || `0x_claim_${Date.now()}`;
      const now = new Date();

      // Fetch all previous active members to receive their dividend push
      const previousActiveMembers = await prisma.daoMember.findMany({
        where: { position: { lt: nextPosition }, status: "active" },
        select: { id: true, address: true, position: true, pushedAmountBtt: true },
      });

      // 6. Execute atomic database transaction
      const [newMember] = await prisma.$transaction([
        // A. Create new member with instant cashback credited directly
        prisma.daoMember.create({
          data: {
            address: user.address,
            position: nextPosition,
            nftTokenId: nextPosition,
            entryAmountBtt: ENTRY_FEE,
            pushedAmountBtt: cashbackPerMember, // Instant Cashback!
            status: "active",
            joinedAt: now,
            txHash: memberTxHash,
            blockNumber: verifiedBlockNumber,
          },
        }),

        // B. Credit dividend share to all previous active members
        prisma.daoMember.updateMany({
          where: { position: { lt: nextPosition }, status: "active" },
          data: {
            pushedAmountBtt: {
              increment: cashbackPerMember,
            },
          },
        }),

        // C. Event: Joined
        prisma.daoEvent.create({
          data: {
            eventType: "joined",
            userAddress: user.address,
            incomingPosition: nextPosition,
            recipientCount: nextPosition,
            amountBtt: ENTRY_FEE,
            txHash: memberTxHash,
            blockNumber: verifiedBlockNumber,
            timestamp: now,
          },
        }),

        // D. Event: Instant cashback for new member
        prisma.daoEvent.create({
          data: {
            eventType: "pushed",
            userAddress: user.address,
            incomingPosition: nextPosition,
            amountBtt: cashbackPerMember,
            reason: `Instant Cashback (Seat #${nextPosition})`,
            txHash: `${memberTxHash}-cashback`,
            blockNumber: verifiedBlockNumber,
            timestamp: now,
          },
        }),

        // E. Update DaoInstance totalDistributedBtt
        prisma.daoInstance.upsert({
          where: { id: 1 },
          create: {
            id: 1,
            capacity: 100,
            isClosed: nextPosition >= 100,
            closedAt: nextPosition >= 100 ? now : null,
            totalDistributedBtt: ENTRY_FEE,
            distributionMode: "push_with_pull_fallback",
          },
          update: {
            totalDistributedBtt: {
              increment: ENTRY_FEE,
            },
            isClosed: nextPosition >= 100,
            closedAt: nextPosition >= 100 ? now : null,
          },
        }),
      ]);

      // Create pushed dividend events for all previous members
      for (const prev of previousActiveMembers) {
        try {
          await prisma.daoEvent.create({
            data: {
              eventType: "pushed",
              userAddress: prev.address,
              incomingPosition: nextPosition,
              amountBtt: cashbackPerMember,
              reason: `Dividend push from incoming Seat #${nextPosition}`,
              txHash: `${memberTxHash}-pushed-${prev.position}`,
              blockNumber: verifiedBlockNumber,
              timestamp: now,
            },
          });
        } catch (evtErr) {
          console.warn("[DAO Claim] Previous member event logging note:", evtErr);
        }
      }

      res.json({
        success: true,
        data: {
          isMember: true,
          position: newMember.position,
          address: user.address,
          entryAmountBtt: ENTRY_FEE,
          instantCashbackBtt: cashbackPerMember,
          totalPushedBtt: cashbackPerMember,
          previousMembersRewarded: previousActiveMembers.length,
          txHash: newMember.txHash,
          onchainVerified,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── DAO PROFILE ───────────────────────────────────────────────────────────

  /**
   * GET /api/dao/profile/:address
   * Full member profile: membership details + matrix slots + badges + stats.
   */
  app.get("/api/dao/profile/:address", async (req, res, next) => {
    try {
      const address = req.params.address.toLowerCase();
      const [memberDetails, priceData] = await Promise.all([
        daoService.getMemberByAddress(address),
        priceService.getBttUsdPrice(),
      ]);

      // Fetch extended profile data from DB
      const user = await prisma.user.findUnique({
        where: { address },
        include: {
          daoMembership: true,
          matrixSlots: {
            orderBy: { slotNumber: "asc" },
            take: 12,
          },
          nftBadges: true,
          vestingLocks: {
            where: { isClaimed: false },
          },
        },
      });

      const highestSlot = user?.matrixSlots?.reduce(
        (max, s) => (s.isUnlocked && s.slotNumber > max ? s.slotNumber : max),
        0
      ) ?? 0;

      const totalEarnedBtt = user?.matrixSlots?.reduce(
        (sum, s) => sum + Number(s.totalEarned),
        0
      ) ?? 0;

      const poolCards = await prisma.poolCard.findMany({
        where: { userAddress: address },
        orderBy: { tier: "asc" },
      });

      res.json({
        success: true,
        data: {
          address,
          ...memberDetails,
          userId: user?.userId ?? null,
          sponsorAddress: user?.sponsorAddress ?? null,
          directReferralsCount: user?.directReferralsCount ?? 0,
          isQualified: user?.isQualified ?? false,
          registrationTimestamp: user?.registrationTimestamp ?? null,
          highestMatrixSlot: highestSlot,
          matrixSlots: user?.matrixSlots?.map((s) => ({
            slotNumber: s.slotNumber,
            isUnlocked: s.isUnlocked,
            currentCycle: s.currentCycle,
            filledNodes: s.filledNodes,
            totalEarned: Number(s.totalEarned),
            totalEarnedUsd: Number(s.totalEarned) * priceData.priceUsd,
          })) ?? [],
          nftBadges: user?.nftBadges?.map((b) => ({
            tokenId: b.tokenId,
            rank: b.rank,
            mintedAt: b.mintedAt,
          })) ?? [],
          poolCards: poolCards.map((c) => ({
            tier: c.tier,
            tierName: c.tierName,
            unlockedAt: c.unlockedAt,
          })),
          totalEarnedBtt,
          totalEarnedUsd: totalEarnedBtt * priceData.priceUsd,
          pendingVestingLocks: user?.vestingLocks?.length ?? 0,
          bttPriceUsd: priceData.priceUsd,
          priceSource: priceData.priceSource,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── DAO LOUNGE ────────────────────────────────────────────────────────────

  /**
   * GET /api/dao/lounge/:address
   * Returns lounge-specific data: soulbound pass, claimable dividends,
   * earnings cap progress, income channels.
   */
  app.get("/api/dao/lounge/:address", async (req, res, next) => {
    try {
      const address = req.params.address.toLowerCase();
      const [memberDetails, priceData] = await Promise.all([
        daoService.getMemberByAddress(address),
        priceService.getBttUsdPrice(),
      ]);

      if (!memberDetails.isMember) {
        res.json({ success: true, data: { isMember: false } });
        return;
      }

      // Calculate claimable dividends from DaoPoolState
      const daoPoolState = await prisma.daoPoolState.findUnique({ where: { id: 1 } });

      // Unclaimed dividends from fallback claims
      const unclaimedFallback = await prisma.pullFallbackClaim.findMany({
        where: { member: { address } },
        include: { member: true },
      });

      const unclaimedTrob = unclaimedFallback.reduce(
        (sum, c) => sum + Number(c.amountBtt),
        0
      );

      const earningsCapBtt = 900; // 3x entry
      const pushedBtt = memberDetails.pushedAmountBtt;
      const capProgressPct = Math.min(100, (pushedBtt / earningsCapBtt) * 100);
      const remainingCapBtt = Math.max(0, earningsCapBtt - pushedBtt);

      // Rank pool cards for income channels
      const poolCards = await prisma.poolCard.findMany({
        where: { userAddress: address },
        orderBy: { tier: "asc" },
      });

      const matrixSlots = await prisma.matrixSlot.findMany({
        where: { userAddress: address },
        orderBy: { slotNumber: "asc" },
      });

      const totalMatrixEarned = matrixSlots.reduce(
        (sum, s) => sum + Number(s.totalEarned),
        0
      );

      res.json({
        success: true,
        data: {
          isMember: true,
          address,
          position: memberDetails.position,
          nftTokenId: memberDetails.nftTokenId,
          status: memberDetails.status,
          // Soulbound pass
          soulboundPass: {
            tokenId: memberDetails.nftTokenId,
            seatNumber: memberDetails.position,
            memberId: `#${String(memberDetails.position).padStart(4, "0")}`,
            tier: "Genesis Council",
            joinedAt: memberDetails.joinedAt,
          },
          // Dividends
          claimableDividendsBtt: unclaimedTrob,
          claimableDividendsUsd: unclaimedTrob * priceData.priceUsd,
          totalReceivedBtt: pushedBtt,
          totalReceivedUsd: pushedBtt * priceData.priceUsd,
          // Earnings cap
          earningsCapBtt,
          earningsCapUsd: earningsCapBtt * priceData.priceUsd,
          pushedBtt,
          pushedUsd: pushedBtt * priceData.priceUsd,
          capProgressPct,
          remainingCapBtt,
          remainingCapUsd: remainingCapBtt * priceData.priceUsd,
          isCapped: pushedBtt >= earningsCapBtt,
          // Income channels
          incomeChannels: {
            daoSeats: {
              label: "Council Seat Distribution",
              earnedBtt: pushedBtt,
              earnedUsd: pushedBtt * priceData.priceUsd,
            },
            matrixSlots: {
              label: "Matrix Spillover",
              earnedBtt: totalMatrixEarned,
              earnedUsd: totalMatrixEarned * priceData.priceUsd,
              highestSlot: matrixSlots.filter((s) => s.isUnlocked).length,
            },
            rankPools: {
              label: "Rank Pool Rewards",
              unlockedPools: poolCards.map((c) => c.tierName),
            },
          },
          bttPriceUsd: priceData.priceUsd,
          priceSource: priceData.priceSource,
          totalPoolShares: daoPoolState?.totalShares ?? 100,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── DAO TRANSACTIONS ──────────────────────────────────────────────────────

  /**
   * GET /api/dao/transactions?address=&page=&limit=
   * Returns paginated transaction history for a given wallet address.
   * Combines: DaoEvent, MatrixPlacement, Withdrawal.
   */
  app.get("/api/dao/transactions", async (req, res, next) => {
    try {
      const address = req.query.address
        ? String(req.query.address).toLowerCase()
        : null;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = Math.min(
        req.query.limit ? parseInt(String(req.query.limit), 10) : 20,
        100
      );
      const skip = (page - 1) * limit;

      const priceData = await priceService.getBttUsdPrice();

      // Build combined filter
      const addressFilter = address ? { userAddress: address } : {};
      const withdrawalFilter = address ? { userAddress: address } : {};

      const [daoEvents, matrixPlacements, withdrawals] = await Promise.all([
        prisma.daoEvent.findMany({
          where: address ? { userAddress: address } : {},
          orderBy: { timestamp: "desc" },
          take: limit * 2,
        }),
        prisma.matrixPlacement.findMany({
          where: address
            ? {
                OR: [
                  { matrixOwnerAddress: address },
                  { placedUserAddress: address },
                  { recipientAddress: address },
                ],
              }
            : {},
          orderBy: { timestamp: "desc" },
          take: limit * 2,
        }),
        prisma.withdrawal.findMany({
          where: withdrawalFilter,
          orderBy: { timestamp: "desc" },
          take: limit * 2,
        }),
      ]);

      // Normalize to a unified transaction shape
      type TxItem = {
        id: string;
        type: string;
        typeLabel: string;
        amountBtt: number;
        amountUsd: number;
        isPositive: boolean | null;
        from: string;
        to: string;
        txHash: string;
        timestamp: Date;
        status: string;
      };

      const txItems: TxItem[] = [];

      for (const e of daoEvents) {
        const amt = Number(e.amountBtt);
        txItems.push({
          id: e.id,
          type: e.eventType,
          typeLabel:
            e.eventType === "joined"
              ? "Council Seat Claim"
              : e.eventType === "pushed"
              ? "Seat Distribution"
              : e.eventType === "fallback_claimed"
              ? "Dividend Claim"
              : e.eventType === "queue_closed"
              ? "Queue Closed"
              : e.eventType,
          amountBtt: amt,
          amountUsd: amt * priceData.priceUsd,
          isPositive: e.eventType === "pushed" || e.eventType === "fallback_claimed",
          from: e.userAddress ?? "Protocol",
          to: e.userAddress ?? "Protocol",
          txHash: e.txHash,
          timestamp: e.timestamp,
          status: "Confirmed",
        });
      }

      for (const p of matrixPlacements) {
        const amt = Number(p.amount);
        const isIncoming = address
          ? p.recipientAddress === address || p.matrixOwnerAddress === address
          : true;
        txItems.push({
          id: p.id,
          type: "matrix_" + p.payoutType.toLowerCase(),
          typeLabel: "Matrix " + p.payoutType.replace(/_/g, " "),
          amountBtt: amt,
          amountUsd: amt * priceData.priceUsd,
          isPositive: isIncoming,
          from: p.placedUserAddress,
          to: p.recipientAddress,
          txHash: p.txHash,
          timestamp: p.timestamp,
          status: "Confirmed",
        });
      }

      for (const w of withdrawals) {
        const amt = Number(w.amount);
        txItems.push({
          id: w.id,
          type: "withdrawal",
          typeLabel: "Withdrawal",
          amountBtt: amt,
          amountUsd: amt * priceData.priceUsd,
          isPositive: false,
          from: w.userAddress,
          to: "External Wallet",
          txHash: w.txHash,
          timestamp: w.timestamp,
          status: "Confirmed",
        });
      }

      // Sort all by timestamp desc, paginate
      txItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const total = txItems.length;
      const paginated = txItems.slice(skip, skip + limit);

      res.json({
        success: true,
        data: {
          transactions: paginated,
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          bttPriceUsd: priceData.priceUsd,
          priceSource: priceData.priceSource,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── DAO PROPOSALS ─────────────────────────────────────────────────────────

  /** GET /api/dao/proposals?limit= */
  app.get("/api/dao/proposals", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const proposals = await daoService.getDAOProposals(limit);
      res.json({ success: true, data: proposals });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/dao/proposals/:id/vote
   * Authorization: Bearer <token>
   * Body: { support: boolean, txHash?: string }
   * Records a governance vote cast on-chain.
   */
  app.post("/api/dao/proposals/:id/vote", requireAuth, async (req, res, next) => {
    try {
      const proposalId = parseInt(req.params.id, 10);
      const { support, txHash } = req.body as {
        support?: boolean;
        txHash?: string;
      };
      const { address } = (req as any).user as { address: string };

      if (typeof support !== "boolean") {
        res.status(400).json({ success: false, error: "support (boolean) is required." });
        return;
      }

      // Check the proposal exists
      const proposal = await prisma.daoProposal.findUnique({
        where: { proposalId },
      });
      if (!proposal) {
        res.status(404).json({ success: false, error: "Proposal not found." });
        return;
      }
      if (proposal.status !== "ACTIVE") {
        res.status(400).json({ success: false, error: "Proposal is not active." });
        return;
      }

      // Upsert vote record
      const memberDetails = await daoService.getMemberByAddress(address);
      const weight = memberDetails.isMember ? 1 : 0;

      await prisma.daoVote.upsert({
        where: { proposalId_voter: { proposalId, voter: address } },
        create: { proposalId, voter: address, support, weight, txHash },
        update: { support, txHash },
      });

      // Update vote tallies
      const allVotes = await prisma.daoVote.findMany({ where: { proposalId } });
      const votesFor = allVotes.filter((v) => v.support).length;
      const votesAgainst = allVotes.filter((v) => !v.support).length;

      await prisma.daoProposal.update({
        where: { proposalId },
        data: { votesFor, votesAgainst },
      });

      res.json({
        success: true,
        data: { proposalId, voter: address, support, votesFor, votesAgainst },
      });
    } catch (err) {
      next(err);
    }
  });

  // ── GLOBAL STATS ──────────────────────────────────────────────────────────

  /** GET /api/stats/overview */
  app.get("/api/stats/overview", async (_req, res, next) => {
    try {
      const overview = await statsService.getGlobalProtocolStats();
      res.json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  });

  // ── tRPC ──────────────────────────────────────────────────────────────────
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: serverRouter,
      createContext,
    })
  );

  // ── 404 & Error Handlers ──────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  return app;
}
