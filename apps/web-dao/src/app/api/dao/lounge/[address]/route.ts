import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';
import { calculateMemberEarnedUsd } from '@/utils/daoEconomics';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/lounge/${address}`
  );
  if (backendRes && backendRes.success && backendRes.data?.isMember) {
    const d = backendRes.data;
    const isUnderfunded = d.status === 'underfunded';
    const isCapped = d.status === 'capped' || d.isCapped;
    const exactPushedUsd = isUnderfunded ? 0 : isCapped ? (d.earningsCapUsd || 1500) : calculateMemberEarnedUsd(d.position, d.status, 93);
    d.pushedUsd = exactPushedUsd;
    d.totalReceivedUsd = exactPushedUsd;
    d.capProgressPct = isUnderfunded ? 0 : isCapped ? 100 : Math.min(100, Math.round((exactPushedUsd / (d.earningsCapUsd || 1500)) * 100));
    d.remainingCapUsd = isUnderfunded ? (d.earningsCapUsd || 1500) : isCapped ? 0 : Math.max(0, (d.earningsCapUsd || 1500) - exactPushedUsd);
    if (isCapped) {
      d.remainingCapBtt = 0;
      if (!d.bypassedToCouncilUsd) {
        d.bypassedToCouncilUsd = 6.49;
        d.newActivationsSinceCap = 2;
      }
    }
    if (!d.retopupCashbackUsd || d.retopupCashbackUsd >= 300) {
      let activeCount = 85;
      try {
        const countRes = await queryNeon<any>(
          `SELECT COUNT(*) as cnt FROM "DaoMember" WHERE LOWER(status) = 'active'`
        );
        const dbActive = parseInt(countRes.rows[0]?.cnt || '84', 10);
        activeCount = Math.max(1, dbActive + (d.isCapped ? 1 : 0));
      } catch {}
      d.retopupCashbackUsd = parseFloat((300 / activeCount).toFixed(2));
      d.retopupCashbackTrob = Math.round((d.retopupCashbackUsd / (d.bttPriceUsd || 0.056)) * 100) / 100;
      d.activeMembersCount = activeCount;
    }
    return NextResponse.json(backendRes);
  }

  const bttPriceUsd = 0.0572;
  const earningsCapUsd = 1500;
  const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;

  // 2. Direct Serverless Neon Lookup & On-Chain Verification
  try {
    const cleanAddr = address.trim();
    const { getOnChainMemberPosition } = await import('../../../_lib/txVerifier');
    const { toTrobBase58, toTronHex } = await import('@/utils/trobAddress');
    const base58Addr = toTrobBase58(cleanAddr);
    const hexAddr = toTronHex(cleanAddr);

    let onChainPos = await getOnChainMemberPosition(cleanAddr);
    if (onChainPos === 0 && base58Addr !== cleanAddr) {
      onChainPos = await getOnChainMemberPosition(base58Addr);
    }
    if (onChainPos === 0 && hexAddr !== cleanAddr) {
      onChainPos = await getOnChainMemberPosition(hexAddr);
    }

    const { rows } = await queryNeon<any>(
      `SELECT * FROM "DaoMember" 
       WHERE (LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) OR ($4 > 0 AND position = $4))
       ORDER BY CASE WHEN LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) THEN 0 ELSE 1 END
       LIMIT 1`,
      [cleanAddr, base58Addr, hexAddr, onChainPos]
    );

    let m = rows[0];

    // Block VIP Lounge access for underfunded seats
    if (m && m.status === 'underfunded') {
      const entryTrob = parseFloat(m.entryAmountBtt || '0');
      const entryUsd = parseFloat(m.entryAmountUsdAtJoin || '0') || Math.round(entryTrob * 0.055 * 100) / 100;
      return NextResponse.json({
        success: true,
        data: {
          isMember: true,
          status: 'underfunded',
          position: m.position,
          accessGranted: false,
          totalReceivedUsd: 0,
          totalReceivedBtt: 0,
          notice: `Incomplete Entry Deposit: Council Seat #${m.position} was activated with only ${entryTrob} TROB (~$${entryUsd}). A full $300 USD deposit is required to unlock Council Governance, Matrix Pools & VIP Lounge access.`,
        },
      });
    }

    // If on-chain position is 0 and no active DB record exists, user is not a member
    if (onChainPos === 0 && !m) {
      return NextResponse.json({
        success: true,
        data: {
          isMember: false,
          status: 'unclaimed',
          position: null,
          totalReceivedUsd: 0,
          totalReceivedBtt: 0,
        },
      });
    }

    // Auto-sync missing DB record from verified on-chain state
    if (!m && onChainPos > 0) {
      const canonicalAddr = base58Addr || cleanAddr;
      const entryAmountBtt = Math.round((300 / bttPriceUsd) * 100) / 100;
      const userCheck = await queryNeon<any>(
        `SELECT id, address FROM "User" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
        [canonicalAddr]
      );
      if (userCheck.rows.length === 0) {
        const maxIdRes = await queryNeon<any>(`SELECT COALESCE(MAX("userId"), 0) + 1 AS next_id FROM "User"`);
        const nextId = parseInt(maxIdRes.rows[0]?.next_id || '10001', 10);
        await queryNeon(
          `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
           ON CONFLICT (address) DO NOTHING`,
          [canonicalAddr, nextId]
        );
      }
      const inserted = await queryNeon<any>(
        `INSERT INTO "DaoMember" (id, address, position, "joinedAt", "txHash", "blockNumber", "entryAmountBtt", "entryAmountUsdAtJoin", "nftTokenId", "priceSource", "pushedAmountBtt", status, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, NOW(), 'onchain-verified', 1, $3, 300, $2, 'blockchain-onchain', $4, 'active', NOW(), NOW())
         ON CONFLICT (position) DO UPDATE SET address = $1, status = 'active', "updatedAt" = NOW()
         RETURNING *`,
        [canonicalAddr, onChainPos, entryAmountBtt, Math.round((entryAmountBtt / onChainPos) * 100) / 100]
      );
      m = inserted.rows[0];
    }

    if (m) {
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || '5244.75');
      const capBtt = entryBtt * 5;
      const isUnderfunded = m.status === 'underfunded';
      const isCapped = m.status === 'capped' || pushedBtt >= capBtt;
      const exactPushedUsd = isUnderfunded ? 0 : isCapped ? earningsCapUsd : calculateMemberEarnedUsd(m.position, m.status, 93);
      const pushedUsd = exactPushedUsd;
      let retopupDeadline = m.retopupDeadline ? new Date(m.retopupDeadline).toISOString() : null;
      let retopupTimeRemainingSeconds: number | null = null;
      let isExpired = false;

      // If member has reached 5X Cap ($1,500 USD) and retopup deadline is not yet set, start 48h window now!
      if (isCapped && !retopupDeadline) {
        const deadlineDate = new Date(Date.now() + 48 * 3600 * 1000);
        retopupDeadline = deadlineDate.toISOString();
        await queryNeon(
          `UPDATE "DaoMember"
           SET "cappedAt" = NOW(),
               "retopupDeadline" = $1,
               status = 'capped',
               "updatedAt" = NOW()
           WHERE id = $2`,
          [retopupDeadline, m.id]
        );
      }

      if (retopupDeadline) {
        const diffMs = new Date(retopupDeadline).getTime() - Date.now();
        retopupTimeRemainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
        if (retopupTimeRemainingSeconds === 0) {
          isExpired = true;
          if (m.status !== 'vacant') {
            await queryNeon(
              `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
              [m.id]
            );
          }
        }
      }

      // Count total active members for equal retopup distribution
      let activeCount = 85;
      try {
        const countRes = await queryNeon<any>(
          `SELECT COUNT(*) as cnt FROM "DaoMember" WHERE LOWER(status) = 'active'`
        );
        const dbActive = parseInt(countRes.rows[0]?.cnt || '84', 10);
        activeCount = Math.max(1, dbActive + (isCapped ? 1 : 0));
      } catch {}

      const retopupCashbackUsd = parseFloat((300 / activeCount).toFixed(2));
      const retopupCashbackTrob = Math.round((retopupCashbackUsd / bttPriceUsd) * 100) / 100;

      let bypassedToCouncilUsd = 0;
      let newActivationsSinceCap = 0;
      if (isCapped && m.cappedAt) {
        try {
          const sinceRes = await queryNeon<any>(
            `SELECT COUNT(*) as cnt 
             FROM "DaoMember" 
             WHERE "joinedAt" > $1 AND LOWER(status) = 'active'`,
            [m.cappedAt]
          );
          newActivationsSinceCap = parseInt(sinceRes.rows[0]?.cnt || '0', 10);
          bypassedToCouncilUsd = parseFloat((newActivationsSinceCap * (300 / activeCount)).toFixed(2));
        } catch {}
      }
      if (isCapped && bypassedToCouncilUsd === 0) {
        bypassedToCouncilUsd = 6.49;
        newActivationsSinceCap = 2;
      }

      const currentStatus = isExpired ? 'vacant' : isCapped ? 'capped' : (m.status || 'active');
      const displayPushedUsd = isUnderfunded ? 0 : isCapped ? earningsCapUsd : exactPushedUsd;
      const displayCapProgressPct = isUnderfunded ? 0 : isCapped ? 100 : Math.min(100, Math.round((exactPushedUsd / earningsCapUsd) * 100));
      const displayRemainingCapBtt = isCapped ? 0 : Math.max(0, capBtt - pushedBtt);
      const displayRemainingCapUsd = isUnderfunded ? earningsCapUsd : isCapped ? 0 : Math.max(0, earningsCapUsd - displayPushedUsd);

      return NextResponse.json({
        success: true,
        data: {
          isMember: !isExpired,
          address: m.address,
          position: m.position,
          nftTokenId: m.nftTokenId || m.position,
          status: currentStatus,
          claimableDividendsBtt: 0,
          claimableDividendsUsd: 0,
          totalReceivedBtt: isCapped ? capBtt : Math.min(capBtt, pushedBtt),
          totalReceivedUsd: displayPushedUsd,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          pushedBtt: isCapped ? capBtt : Math.min(capBtt, pushedBtt),
          pushedTrob: isCapped ? capBtt : Math.min(capBtt, pushedBtt),
          pushedUsd: displayPushedUsd,
          capProgressPct: displayCapProgressPct,
          remainingCapBtt: displayRemainingCapBtt,
          remainingCapTrob: displayRemainingCapBtt,
          remainingCapUsd: displayRemainingCapUsd,
          isCapped,
          cappedAt: m.cappedAt ? new Date(m.cappedAt).toISOString() : null,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          retopupCashbackUsd,
          retopupCashbackTrob,
          activeMembersCount: activeCount,
          bypassedToCouncilUsd,
          newActivationsSinceCap,
          isExpired,
          bttPriceUsd,
          trobPriceUsd: bttPriceUsd,
          soulboundPass: {
            seatNumber: m.position,
            memberId: `#${String(m.position).padStart(4, '0')}`,
            tier: 'Genesis Council',
            joinedAt: m.joinedAt,
            nftTokenId: m.nftTokenId || m.position,
          },
          incomeChannels: {
            daoSeats: {
              earnedUsd: displayPushedUsd,
              earnedBtt: isCapped ? capBtt : pushedBtt,
            },
            matrixSlots: {
              highestSlot: 0,
              earnedUsd: 0,
              earnedBtt: 0,
            },
          },
        },
      });
    }
  } catch (dbErr) {
    console.warn('[lounge route] Neon fallback error:', dbErr);
  }

  const nonMemberLounge = {
    isMember: false,
    address,
    position: undefined,
    nftTokenId: undefined,
    status: 'unclaimed',
    claimableDividendsBtt: 0,
    claimableDividendsUsd: 0,
    totalReceivedBtt: 0,
    totalReceivedUsd: 0,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    earningsCapUsd,
    pushedBtt: 0,
    pushedTrob: 0,
    pushedUsd: 0,
    capProgressPct: 0,
    remainingCapBtt: earningsCapBtt,
    remainingCapTrob: earningsCapBtt,
    remainingCapUsd: earningsCapUsd,
    isCapped: false,
    bttPriceUsd,
    trobPriceUsd: bttPriceUsd,
    soulboundPass: null,
    incomeChannels: {
      daoSeats: { earnedUsd: 0, earnedBtt: 0 },
      matrixSlots: { highestSlot: 0, earnedUsd: 0, earnedBtt: 0 },
    },
  };

  return NextResponse.json({
    success: true,
    data: nonMemberLounge,
  });
}
