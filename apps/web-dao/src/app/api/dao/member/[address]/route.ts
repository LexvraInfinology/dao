import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  if (!address) {
    return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
  }

  // Blockchain smart contract is the absolute Single Source of Truth.
  // We do not proxy through unverified backend caches.

  const bttPriceUsd = 0.0572;
  const entryAmountUsd = 300;
  const earningsCapUsd = 1500;
  const entryAmountBtt = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
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

    let isUnderfundedReservation = false;
    let reservedPos = 0;

    // Check Neon DB first or alongside on-chain position
    const { rows } = await queryNeon<any>(
      `SELECT * FROM "DaoMember" 
       WHERE (LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) OR (position = $4 AND $4 > 0))
       ORDER BY CASE WHEN LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) THEN 0 ELSE 1 END
       LIMIT 1`,
      [cleanAddr, base58Addr, hexAddr, onChainPos]
    );

    let m = rows[0];

    // If onChainPos was 0 due to network/RPC latency, but DB has active record, use DB position
    if (onChainPos === 0 && m && m.position > 0) {
      onChainPos = m.position;
    }

    if (onChainPos === 0) {
      if (m && m.status === 'underfunded') {
        isUnderfundedReservation = true;
        reservedPos = m.position;
        onChainPos = reservedPos;
      } else {
        // Also check on-chain reservation mapping from EquoraDAOv2
        const { getOnChainUnderfundedReservation } = await import('../../../_lib/txVerifier');
        const onChainRes = (await getOnChainUnderfundedReservation(cleanAddr))
          || (base58Addr !== cleanAddr ? await getOnChainUnderfundedReservation(base58Addr) : null)
          || (hexAddr !== cleanAddr ? await getOnChainUnderfundedReservation(hexAddr) : null);

        if (onChainRes && onChainRes.isReserved) {
          isUnderfundedReservation = true;
          reservedPos = onChainRes.reservedSeat;
          onChainPos = reservedPos;
        }
      }
    }

    // If neither on-chain nor DB record exists, address is not a member
    if (onChainPos === 0 && !isUnderfundedReservation && !m) {
      return NextResponse.json({
        success: true,
        data: {
          isMember: false,
          position: null,
          nftTokenId: null,
          status: 'unclaimed',
          joinedAt: undefined,
          pushedAmountBtt: 0,
          pushedAmountTrob: 0,
          pushedAmountUsdEstimate: 0,
          earningsCapBtt,
          earningsCapTrob: earningsCapBtt,
          earningsCapUsd,
          capProgressPct: 0,
          isCapped: false,
          entryAmountBtt,
          entryAmountTrob: entryAmountBtt,
          entryAmountUsdEstimate: entryAmountUsd,
          directReferralsCount: 0,
          isQualified: false,
          userId: null,
        },
      });
    }

    // If member has underfunded/provisional deposit status, lock governance & rewards
    if (m && (m.status === 'underfunded' || parseFloat(m.entryAmountBtt || '0') < 1000)) {
      const entryTrob = parseFloat(m.entryAmountBtt || '0');
      const entryUsd = parseFloat(m.entryAmountUsdAtJoin || '0') || Math.round(entryTrob * 0.055 * 100) / 100;
      
      let retopupDeadline = m.retopupDeadline;
      if (!retopupDeadline) {
        // Start 48-hour retopup window
        retopupDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        await queryNeon(
          `UPDATE "DaoMember" SET "retopupDeadline" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [retopupDeadline, m.id]
        );
      }
      const diffMs = new Date(retopupDeadline).getTime() - Date.now();
      const retopupTimeRemainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
      const isExpired = retopupTimeRemainingSeconds === 0;

      return NextResponse.json({
        success: true,
        data: {
          isMember: true,
          position: m.position,
          nftTokenId: m.nftTokenId || onChainPos,
          status: isExpired ? 'expired' : 'underfunded',
          joinedAt: m.joinedAt,
          entryAmountBtt: entryTrob,
          entryAmountTrob: entryTrob,
          entryAmountUsdEstimate: entryUsd,
          isQualified: false,
          underfunded: true,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          isExpired,
          notice: `Incomplete Deposit: Council Seat #${m.position} was activated with only ${entryTrob} TROB (~$${entryUsd}). A minimum of $300 USD is strictly required to unlock Council Governance, Matrix Pools & VIP Lounge.`,
          userId: m.id,
        },
      });
    }

    // If DB record missing but confirmed on-chain, auto-sync 1:1 using canonical Base58 address
    if (!m && onChainPos > 0) {
      const canonicalAddr = base58Addr || cleanAddr;
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
      const entryBtt = parseFloat(m.entryAmountBtt || String(entryAmountBtt));
      const capBtt = entryBtt * 5;
      const isCapped = capBtt > 0 && pushedBtt >= capBtt;

      let retopupDeadline = m.retopupDeadline;
      let retopupTimeRemainingSeconds: number | null = null;
      let isExpired = false;

      if (isCapped && !retopupDeadline) {
        // Start 48-hour retopup window on cap hit
        retopupDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        await queryNeon(
          `UPDATE "DaoMember"
           SET "retopupDeadline" = $1, "cappedAt" = NOW(), status = 'capped', "updatedAt" = NOW()
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

      const isMember = !isExpired && m.status !== 'vacant' && m.status !== 'defaulted';

      return NextResponse.json({
        success: true,
        data: {
          isMember,
          position: isMember ? onChainPos : null,
          nftTokenId: m.nftTokenId || onChainPos,
          status: isExpired ? 'vacant' : (m.status || (isCapped ? 'capped' : 'ACTIVE')),
          joinedAt: m.joinedAt,
          pushedAmountBtt: pushedBtt,
          pushedAmountTrob: pushedBtt,
          pushedAmountUsdEstimate: Math.round(pushedBtt * bttPriceUsd * 100) / 100,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          capProgressPct: capBtt > 0 ? Math.min(100, Math.round((pushedBtt / capBtt) * 100)) : 0,
          isCapped,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          entryAmountBtt: entryBtt,
          entryAmountTrob: entryBtt,
          entryAmountUsdEstimate: entryAmountUsd,
          directReferralsCount: 0,
          isQualified: isMember,
          userId: m.id,
        },
      });
    }
  } catch (dbErr) {
    console.warn('[member route] Error:', dbErr);
  }

  // Non-member response
  return NextResponse.json({
    success: true,
    data: {
      isMember: false,
      position: null,
      nftTokenId: null,
      status: 'unclaimed',
      joinedAt: undefined,
      pushedAmountBtt: 0,
      pushedAmountTrob: 0,
      pushedAmountUsdEstimate: 0,
      earningsCapBtt,
      earningsCapTrob: earningsCapBtt,
      earningsCapUsd,
      capProgressPct: 0,
      isCapped: false,
      entryAmountBtt,
      entryAmountTrob: entryAmountBtt,
      entryAmountUsdEstimate: entryAmountUsd,
      directReferralsCount: 0,
      isQualified: false,
      userId: null,
    },
  });
}
