import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';
import { getActiveDaoAddress } from '@/utils/trobAddress';
import { calculateMemberEarnedUsd, calculateMemberCycleAndLifetime } from '@/utils/daoEconomics';
import { toUtcIso } from '../../../_lib/dateUtils';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  if (!address) {
    return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
  }

  // 1. Try Express backend if configured
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/profile/${address}`
  );
  if (backendRes && backendRes.success && backendRes.data && backendRes.data.isMember) {
    const d = backendRes.data;
    let dbStatus = d.status;
    let dbDeadline = d.retopupDeadline;
    let retopupCount = parseInt(d.retopupCount || '0', 10);
    let pushedBtt = parseFloat(d.pushedAmountBtt || d.pushedBtt || '0');

    try {
      const dbRes = await queryNeon<any>(
        `SELECT status, "retopupDeadline", "retopupCount", "pushedAmountBtt" FROM "DaoMember" WHERE LOWER(address) = LOWER($1) OR position = $2 LIMIT 1`,
        [address.trim(), d.position || 0]
      );
      if (dbRes.rows.length > 0) {
        const r = dbRes.rows[0];
        dbStatus = r.status || dbStatus;
        dbDeadline = r.retopupDeadline ? toUtcIso(r.retopupDeadline) : null;
        retopupCount = parseInt(r.retopupCount || '0', 10);
        pushedBtt = parseFloat(r.pushedAmountBtt || String(pushedBtt));
      }
    } catch {}

    const isUnderfunded = dbStatus === 'underfunded';
    const eco = calculateMemberCycleAndLifetime(
      d.position,
      dbStatus,
      93,
      retopupCount,
      pushedBtt,
      0.037757
    );
    const isCapped = !isUnderfunded && (dbStatus === 'capped' || (retopupCount === 0 ? eco.currentCycleCapPct >= 100 : eco.currentCycleCapPct >= 100));

    d.status = dbStatus;
    d.isCapped = isCapped;
    d.retopupCount = retopupCount;
    d.totalEarnedUsd = isCapped ? 1500 : eco.lifetimeUsd;
    d.pushedAmountUsdEstimate = isCapped ? 1500 : eco.lifetimeUsd;
    d.currentCycleUsd = eco.currentCycleUsd;
    d.capProgressPct = isUnderfunded ? 0 : isCapped ? 100 : eco.currentCycleCapPct;
    d.retopupDeadline = (isCapped || isUnderfunded) ? dbDeadline : null;
    d.retopupTimeRemainingSeconds = ((isCapped || isUnderfunded) && dbDeadline) ? Math.max(0, Math.floor((new Date(dbDeadline).getTime() - Date.now()) / 1000)) : null;
    if (d.poolCards && d.poolCards[0]) {
      d.poolCards[0].pushedAmountUsd = d.totalEarnedUsd;
      d.poolCards[0].progressPct = d.capProgressPct;
    }
    return NextResponse.json(backendRes);
  }

  // 2. Direct Serverless Neon DB Query
  let bttPriceUsd = 0.037757;
  try {
    const { TROB_PRICE_API_URL } = await import('@/config/env');
    const pRes = await fetch(TROB_PRICE_API_URL, { cache: 'no-store' });
    if (pRes.ok) {
      const pj = await pRes.json();
      const p = Number(pj?.data?.priceUsd ?? pj?.priceUsd);
      if (Number.isFinite(p) && p > 0) bttPriceUsd = p;
    }
  } catch {}
  try {
    const cleanAddr = address.trim();
    const { toTrobBase58, toTronHex } = await import('@/utils/trobAddress');
    const base58Addr = toTrobBase58(cleanAddr);
    const hexAddr = toTronHex(cleanAddr);

    const { getOnChainMemberPosition } = await import('../../../_lib/txVerifier');
    let onChainPos = await getOnChainMemberPosition(cleanAddr);
    if (onChainPos === 0 && base58Addr !== cleanAddr) {
      onChainPos = await getOnChainMemberPosition(base58Addr);
    }
    if (onChainPos === 0 && hexAddr !== cleanAddr) {
      onChainPos = await getOnChainMemberPosition(hexAddr);
    }

    const memberRes = await queryNeon<any>(
      `SELECT * FROM "DaoMember" 
       WHERE (LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) OR ($4 > 0 AND position = $4))
         AND LOWER(status) IN ('active', 'capped', 'underfunded')
       ORDER BY CASE WHEN LOWER(address) IN (LOWER($1), LOWER($2), LOWER($3)) THEN 0 ELSE 1 END
       LIMIT 1`,
      [cleanAddr, base58Addr, hexAddr, onChainPos]
    );

    let m = memberRes.rows[0];

    // If missing from DB but verified on-chain, auto-sync
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
      const isUnderfunded = m.status === 'underfunded';
      const isCapped = m.status === 'capped';
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || '5357.15');
      const retopupCount = parseInt(m.retopupCount || '0', 10);
      const earningsCapUsd = 1500;
      const eco = calculateMemberCycleAndLifetime(
        m.position,
        m.status,
        93,
        retopupCount,
        pushedBtt,
        bttPriceUsd
      );
      const pushedUsd = isUnderfunded ? 0 : isCapped ? earningsCapUsd : eco.lifetimeUsd;
      const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;
      const capProgressPct = isUnderfunded ? 0 : isCapped ? 100 : eco.currentCycleCapPct;

      const nftBadges = [
        {
          id: `sbt-${m.position}`,
          tokenId: m.nftTokenId || m.position,
          name: `Genesis Council Seat #${m.position}`,
          type: 'Soulbound Token (SBT)',
          contractAddress: getActiveDaoAddress(),
          mintDate: m.joinedAt,
          rarity: 'Genesis Founder (1 of 100)',
          image: '/badges/genesis-founder.png',
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          address: m.address,
          userId: m.position,
          isMember: true,
          underfunded: isUnderfunded,
          position: m.position,
          nftTokenId: m.nftTokenId || m.position,
          sponsorAddress: null,
          joinedAt: m.joinedAt,
          registrationTimestamp: m.joinedAt,
          status: isUnderfunded ? 'underfunded' : (m.status || 'active'),
          retopupCount,
          currentCycleUsd: eco.currentCycleUsd,
          retopupDeadline: (isCapped || isUnderfunded) ? toUtcIso(m.retopupDeadline) : null,
          retopupTimeRemainingSeconds: ((isCapped || isUnderfunded) && m.retopupDeadline) ? Math.max(0, Math.floor((new Date(toUtcIso(m.retopupDeadline)!).getTime() - Date.now()) / 1000)) : null,
          isExpired: ((isCapped || isUnderfunded) && m.retopupDeadline) ? new Date(toUtcIso(m.retopupDeadline)!).getTime() < Date.now() : false,
          txHash: m.txHash,
          highestMatrixSlot: isUnderfunded ? 0 : 1,
          matrixSlots: [],
          nftBadges,
          poolCards: isUnderfunded
            ? []
            : [
                {
                  poolId: 'genesis-cashback',
                  name: 'Genesis 300/N Cashback Pool',
                  pushedAmountBtt: pushedBtt,
                  pushedAmountUsd: pushedUsd,
                  earningsCapUsd,
                  progressPct: capProgressPct,
                  status: (isCapped || pushedUsd >= earningsCapUsd) ? 'Capped' : 'Active',
                },
              ],
          totalEarnedBtt: isUnderfunded ? 0 : pushedBtt,
          totalEarnedUsd: pushedUsd,
          pushedAmountBtt: isUnderfunded ? 0 : pushedBtt,
          pushedAmountUsdEstimate: pushedUsd,
          entryAmountBtt: entryBtt,
          entryAmountUsd: parseFloat(m.entryAmountUsdAtJoin || '300'),
          earningsCapBtt,
          earningsCapUsd,
          capProgressPct,
          isCapped: !isUnderfunded && (isCapped || pushedUsd >= earningsCapUsd),
          bttPriceUsd,
          trobPriceUsd: bttPriceUsd,
          priceSource: 'trobchain-live',
        },
      });
    }
  } catch (dbErr) {
    console.warn('[profile route] Neon query error:', dbErr);
  }

  // Fallback for non-member address
  return NextResponse.json({
    success: true,
    data: {
      address,
      userId: null,
      isMember: false,
      position: null,
      nftTokenId: null,
      sponsorAddress: null,
      joinedAt: null,
      registrationTimestamp: null,
      status: 'unclaimed',
      highestMatrixSlot: 0,
      matrixSlots: [],
      nftBadges: [],
      poolCards: [],
      totalEarnedBtt: 0,
      totalEarnedUsd: 0,
      pushedAmountBtt: 0,
      pushedAmountUsdEstimate: 0,
      entryAmountBtt: 0,
      entryAmountUsd: 0,
      earningsCapBtt: 26785.71,
      earningsCapUsd: 1500,
      capProgressPct: 0,
      isCapped: false,
      bttPriceUsd,
      trobPriceUsd: bttPriceUsd,
      priceSource: 'trobchain-live',
    },
  });
}
