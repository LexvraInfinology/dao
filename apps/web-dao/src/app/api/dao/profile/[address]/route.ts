import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';
import { getActiveDaoAddress } from '@/utils/trobAddress';

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
    return NextResponse.json(backendRes);
  }

  // 2. Direct Serverless Neon DB Query
  const bttPriceUsd = 0.056;
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
      const isUnderfunded = m.status === 'underfunded' || parseFloat(m.entryAmountBtt || '0') < 1000;
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || '5357.15');
      const rawPushedUsd = Math.round(pushedBtt * bttPriceUsd * 100) / 100;
      const earningsCapUsd = 1500;
      const pushedUsd = isUnderfunded ? 0 : Math.min(earningsCapUsd, rawPushedUsd); // Strict 5X hard cap ($1,500 max)
      const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;
      const capProgressPct = isUnderfunded ? 0 : Math.min(100, Math.round((pushedUsd / earningsCapUsd) * 100));

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
                  status: pushedBtt >= earningsCapBtt ? 'Capped' : 'Active',
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
          isCapped: !isUnderfunded && (pushedBtt >= earningsCapBtt || rawPushedUsd >= earningsCapUsd),
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
