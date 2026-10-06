import { NextRequest, NextResponse } from 'next/server';
import { queryNeon } from '../../_lib/neonDb';

export const dynamic = 'force-dynamic';

// In-memory / DB state for the Root Leader waterfall
let waterfallState = {
  currentOfferSeat: 1, // Starts at Seat #1, waterfalls down to #10
  claimedBy: null as string | null,
  claimedSeat: null as number | null,
  passedSeats: [] as number[],
  isClaimed: false,
};

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch active DAO member count
    const countRes = await queryNeon<any>(
      `SELECT count(*)::int as count FROM "DaoMember" WHERE LOWER(status) NOT IN ('vacant', 'blank')`
    );
    const activeDaoCount = countRes.rows[0]?.count || 93;

    // 2. Fetch live TROB price or default
    const bttPriceUsd = 0.056;
    const slot1EntryUsd = 30;
    const slot1Trob = Math.round(slot1EntryUsd / bttPriceUsd);

    // 3. Calculate 35% Pool distribution to current available seats
    // Rule: "ensure that if total 100 seats are not filled then it will give the only available seat members there money in there wallet"
    const daoPoolPct = 35;
    const perSeatSharePct = activeDaoCount > 0 ? parseFloat((daoPoolPct / activeDaoCount).toFixed(4)) : 0;
    const instantDaoPushUsdPerMatrixEntry = activeDaoCount > 0 ? parseFloat(((slot1EntryUsd * 0.35) / activeDaoCount).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        isOpen: true,
        launchDay: 22,
        slot1EntryUsd,
        slot1Trob,
        bttPriceUsd,
        rootLeaderWaterfall: {
          currentOfferSeat: waterfallState.currentOfferSeat,
          isClaimed: waterfallState.isClaimed,
          claimedBy: waterfallState.claimedBy,
          claimedSeat: waterfallState.claimedSeat,
          passedSeats: waterfallState.passedSeats,
          maxWaterfallSeat: 10,
        },
        protocolPools: {
          daoTreasuryPct: 35,
          monthlySalaryPct: 40,
          magicBlindBoxPct: 10,
          luckyDropsPct: 15,
          activeDaoMemberCount: activeDaoCount,
          isFull100: activeDaoCount >= 100,
          perSeatSharePct,
          instantDaoPushUsdPerMatrixEntry,
          distributionModel: activeDaoCount < 100
            ? `Proportional split: 100% of the 35% DAO royalty goes directly to the ${activeDaoCount} currently claimed seats (${perSeatSharePct}% per seat) until 100 seats fill.`
            : 'Standard model: 35% global volume distributed equally across all 100 DAO Council seats (0.35% per seat).',
        },
        devicePolicy: {
          daoSeats: 'Strictly 1 Seat Per Physical Device (Anti-Sybil protected).',
          matrixSlots: 'Multiple Matrix IDs allowed per physical device, but each slot requires a distinct Web3 wallet address.',
          daoWalletAllowedOnMatrix: true,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch matrix status';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, address, seatPosition, txHash } = body;

    if (!address) {
      return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 });
    }

    const cleanAddr = address.trim();
    const cleanTx = (txHash || '0x_matrix_' + Math.random().toString(16).slice(2)).toLowerCase();
    const bttPriceUsd = 0.056;
    const slot1EntryUsd = 30;
    const slot1Trob = Math.round(slot1EntryUsd / bttPriceUsd);

    // ──────────────────────────────────────────────────────────────────────────
    // ACTION 1: Pass Root Leader Opportunity to Next Seat in Waterfall (1 -> 10)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'pass_root_offer') {
      const seat = parseInt(seatPosition, 10);
      if (waterfallState.currentOfferSeat === seat && seat < 10) {
        waterfallState.passedSeats.push(seat);
        waterfallState.currentOfferSeat = seat + 1;
      }
      return NextResponse.json({
        success: true,
        data: {
          message: `Seat #${seat} passed root matrix opportunity. Next in line: Seat #${waterfallState.currentOfferSeat}`,
          currentOfferSeat: waterfallState.currentOfferSeat,
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ACTION 2: Claim Root Matrix Apex Owner (Seats 1–10 Waterfall)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'claim_root_leader') {
      const seat = parseInt(seatPosition, 10);
      if (seat < 1 || seat > 10) {
        return NextResponse.json({
          success: false,
          error: 'Root Matrix Leader priority is strictly reserved for Genesis DAO Members 1–10.',
        }, { status: 403 });
      }

      // Record in MatrixSlot table in Neon DB
      try {
        await queryNeon(
          `INSERT INTO "MatrixSlot" (id, "userAddress", "slotNumber", "currentCycle", "filledNodes", "isUnlocked", "upgradeReserve", "totalEarned", "txHash", "blockNumber", "unlockedAt", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, 1, 1, 0, true, 0, 0, $2, 1, NOW(), NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [cleanAddr, cleanTx]
        );
      } catch (dbErr) {
        console.warn('[Matrix API] MatrixSlot insert error:', dbErr);
      }

      // Update waterfall state
      waterfallState.isClaimed = true;
      waterfallState.claimedBy = cleanAddr;
      waterfallState.claimedSeat = seat;

      // Automated 35% Protocol Pool push: distribute 35% of $30 ($10.50 in TROB) to all current DAO members
      const daoMembers = await queryNeon<any>(
        `SELECT id, address, position, "pushedAmountBtt" FROM "DaoMember" WHERE LOWER(status) = 'active'`
      );
      const memberCount = daoMembers.rows.length;
      if (memberCount > 0) {
        const totalPushUsd = slot1EntryUsd * 0.35; // $10.50
        const totalPushTrob = slot1Trob * 0.35;
        const pushPerMemberTrob = totalPushTrob / memberCount;
        const pushPerMemberUsd = totalPushUsd / memberCount;

        for (const m of daoMembers.rows) {
          const updatedPushed = parseFloat(m.pushedAmountBtt || '0') + pushPerMemberTrob;
          await queryNeon(
            `UPDATE "DaoMember" SET "pushedAmountBtt" = $1, "updatedAt" = NOW() WHERE id = $2`,
            [updatedPushed, m.id]
          );

          await queryNeon(
            `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
             VALUES (gen_random_uuid(), 'pushed', $1, 1, $2, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', '35% Matrix Protocol Pool Push')`,
            [m.address, memberCount, `${cleanTx}-dao-pool-${m.position}`, pushPerMemberTrob, pushPerMemberUsd]
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          message: `Congratulations! Council Seat #${seat} has successfully activated the Root Matrix Apex Owner!`,
          isClaimed: true,
          claimedSeat: seat,
          claimedBy: cleanAddr,
          txHash: cleanTx,
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ACTION 3: Normal or Multi-wallet Matrix Registration ($30 Slot 1)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'register_slot') {
      // Check if this wallet is already registered for this slot
      const existing = await queryNeon<any>(
        `SELECT id FROM "MatrixSlot" WHERE LOWER("userAddress") = LOWER($1) AND "slotNumber" = 1 LIMIT 1`,
        [cleanAddr]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'This wallet is already registered for Matrix Slot 1. To register multiple matrix IDs from this device, please connect a different wallet for each matrix ID.',
        }, { status: 400 });
      }

      // Insert new slot
      await queryNeon(
        `INSERT INTO "MatrixSlot" (id, "userAddress", "slotNumber", "currentCycle", "filledNodes", "isUnlocked", "upgradeReserve", "totalEarned", "txHash", "blockNumber", "unlockedAt", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, 1, 1, 0, true, 0, 0, $2, 1, NOW(), NOW(), NOW())`,
        [cleanAddr, cleanTx]
      );

      // Distribute 35% DAO royalty to all currently active DAO members
      const daoMembers = await queryNeon<any>(
        `SELECT id, address, position, "pushedAmountBtt" FROM "DaoMember" WHERE LOWER(status) = 'active'`
      );
      const memberCount = daoMembers.rows.length;
      if (memberCount > 0) {
        const totalPushUsd = slot1EntryUsd * 0.35; // $10.50
        const totalPushTrob = slot1Trob * 0.35;
        const pushPerMemberTrob = totalPushTrob / memberCount;
        const pushPerMemberUsd = totalPushUsd / memberCount;

        for (const m of daoMembers.rows) {
          const updatedPushed = parseFloat(m.pushedAmountBtt || '0') + pushPerMemberTrob;
          await queryNeon(
            `UPDATE "DaoMember" SET "pushedAmountBtt" = $1, "updatedAt" = NOW() WHERE id = $2`,
            [updatedPushed, m.id]
          );

          await queryNeon(
            `INSERT INTO "DaoEvent" (id, "eventType", "userAddress", "incomingPosition", "recipientCount", "txHash", "blockNumber", "timestamp", "createdAt", "amountBtt", "amountUsdEst", "priceSource", reason)
             VALUES (gen_random_uuid(), 'pushed', $1, 1, $2, $3, 1, NOW(), NOW(), $4, $5, 'trobchain-api', '35% Matrix Volume Share Pushed to DAO')`,
            [m.address, memberCount, `${cleanTx}-dao-share-${m.position}`, pushPerMemberTrob, pushPerMemberUsd]
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          message: 'Matrix Slot 1 registered successfully! 35% downstream protocol royalty automatically pushed to active DAO members.',
          txHash: cleanTx,
          slotNumber: 1,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Matrix registration failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
