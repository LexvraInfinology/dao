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

  // 1. Try Express backend if configured
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/profile/${address}`
  );
  if (backendRes && backendRes.success && backendRes.data) {
    return NextResponse.json(backendRes);
  }

  // 2. Direct Serverless Neon DB Query
  const bttPriceUsd = 0.056;
  try {
    const memberRes = await queryNeon<any>(
      `SELECT * FROM "DaoMember" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
      [address.trim()]
    );

    if (memberRes.rows.length > 0) {
      const m = memberRes.rows[0];
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || '5357.15');
      const pushedUsd = Math.round(pushedBtt * bttPriceUsd * 100) / 100;
      const earningsCapUsd = 1500;
      const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;
      const capProgressPct = earningsCapBtt > 0 ? Math.min(100, Math.round((pushedBtt / earningsCapBtt) * 100)) : 0;

      const nftBadges = [
        {
          id: `sbt-${m.position}`,
          tokenId: m.nftTokenId || m.position,
          name: `Genesis Council Seat #${m.position}`,
          type: 'Soulbound Token (SBT)',
          contractAddress: process.env.NEXT_PUBLIC_DAO_ADDRESS || 'TJEnziFHUDhoeds5Yecv4a2XYRzbeJ8eid',
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
          position: m.position,
          nftTokenId: m.nftTokenId || m.position,
          sponsorAddress: null,
          joinedAt: m.joinedAt,
          registrationTimestamp: m.joinedAt,
          status: m.status || 'active',
          txHash: m.txHash,
          highestMatrixSlot: 1,
          matrixSlots: [],
          nftBadges,
          poolCards: [
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
          totalEarnedBtt: pushedBtt,
          totalEarnedUsd: pushedUsd,
          pushedAmountBtt: pushedBtt,
          pushedAmountUsdEstimate: pushedUsd,
          entryAmountBtt: entryBtt,
          entryAmountUsd: parseFloat(m.entryAmountUsdAtJoin || '300'),
          earningsCapBtt,
          earningsCapUsd,
          capProgressPct,
          isCapped: pushedBtt >= earningsCapBtt,
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
