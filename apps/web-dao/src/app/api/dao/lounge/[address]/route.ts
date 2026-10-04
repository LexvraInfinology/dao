import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/lounge/${address}`
  );
  if (backendRes && backendRes.success) {
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
    if (m && (m.status === 'underfunded' || parseFloat(m.entryAmountBtt || '0') < 1000)) {
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
      const rawPushedUsd = Math.round(pushedBtt * bttPriceUsd * 100) / 100;
      const pushedUsd = Math.min(earningsCapUsd, rawPushedUsd); // Strict 5X hard cap ($1,500 max)
      const isCapped = pushedBtt >= capBtt || rawPushedUsd >= earningsCapUsd;
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

      const capProgressPct = capBtt > 0 ? Math.min(100, Math.round((pushedBtt / capBtt) * 100)) : 0;
      const remainingCapBtt = Math.max(0, capBtt - pushedBtt);
      const remainingCapUsd = Math.max(0, earningsCapUsd - pushedUsd);
      const retopupCashbackUsd = parseFloat((300 / (m.position || 1)).toFixed(2));
      const retopupCashbackTrob = Math.round((retopupCashbackUsd / bttPriceUsd) * 100) / 100;
      const currentStatus = isExpired ? 'vacant' : (m.status || (isCapped ? 'capped' : 'active'));

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
          totalReceivedBtt: Math.min(capBtt, pushedBtt),
          totalReceivedUsd: pushedUsd,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          pushedBtt: Math.min(capBtt, pushedBtt),
          pushedTrob: Math.min(capBtt, pushedBtt),
          pushedUsd,
          capProgressPct,
          remainingCapBtt,
          remainingCapTrob: remainingCapBtt,
          remainingCapUsd,
          isCapped,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          retopupCashbackUsd,
          retopupCashbackTrob,
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
              earnedUsd: pushedUsd,
              earnedBtt: pushedBtt,
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
