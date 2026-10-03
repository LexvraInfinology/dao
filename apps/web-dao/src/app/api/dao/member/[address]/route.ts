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

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/member/${address}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

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

    const { rows } = await queryNeon<any>(
      `SELECT * FROM "DaoMember" 
       WHERE (LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) OR ($4 > 0 AND position = $4))
         AND LOWER(status) IN ('active', 'capped')
       ORDER BY CASE WHEN LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) THEN 0 ELSE 1 END
       LIMIT 1`,
      [cleanAddr, base58Addr, hexAddr, onChainPos]
    );

    let m = rows[0];

    // If on-chain position is 0 and no active DB record exists, user is not a member
    if (onChainPos === 0 && !m) {
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

    // If DB record missing but confirmed on-chain, auto-sync 1:1 using canonical Base58 address
    if (!m && onChainPos > 0) {
      const canonicalAddr = base58Addr || cleanAddr;
      await queryNeon(
        `INSERT INTO "User" (id, address, "userId", "registrationTimestamp", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
         ON CONFLICT (address) DO NOTHING`,
        [canonicalAddr, onChainPos]
      );
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
