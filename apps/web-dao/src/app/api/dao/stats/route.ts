import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions, syncOnChainMembersState } from '../../_lib/blockchainSync';
import { TROB_PRICE_API_URL } from '@/config/env';

export const dynamic = 'force-dynamic';

// Ultra-fast in-memory cache (3s for live DB stats, 30s for TROB market price)
let cachedStatsData: any = null;
let cachedStatsTime = 0;
let cachedTrobPrice = 0.057097;
let cachedTrobPriceTime = 0;

export async function GET() {
  const now = Date.now();
  if (cachedStatsData && now - cachedStatsTime < 3000) {
    return NextResponse.json({ success: true, data: cachedStatsData });
  }

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>('/api/dao/stats');
  if (backendRes && backendRes.success && backendRes.data && (backendRes.data.memberCount || 0) > 0) {
    cachedStatsData = backendRes.data;
    cachedStatsTime = now;
    return NextResponse.json(backendRes);
  }

  // Trigger real-time on-chain state sync in background
  syncOnChainMembersState().catch(() => {});
  getOnChainDaoTransactions().catch(() => {});

  // Live market price with 30s cache
  if (now - cachedTrobPriceTime > 30_000 || cachedTrobPrice <= 0) {
    try {
      const pRes = await fetch(TROB_PRICE_API_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(1200),
      });
      if (pRes.ok) {
        const pJson = await pRes.json();
        const pVal = Number(pJson?.data?.priceUsd ?? pJson?.priceUsd);
        if (Number.isFinite(pVal) && pVal > 0) {
          cachedTrobPrice = pVal;
          cachedTrobPriceTime = now;
        }
      }
    } catch {}
  }

  const trobPriceUsd = cachedTrobPrice;
  const bttPriceUsd = trobPriceUsd;
  const entryFeeUsd = 300;
  const earningsCapUsd = 1500;
  const entryFeeBtt = Math.ceil((entryFeeUsd / trobPriceUsd) * 100) / 100;
  const earningsCapBtt = Math.ceil((earningsCapUsd / trobPriceUsd) * 100) / 100;

  let memberCount = 0;
  let totalCollectedBTT = 0;
  let totalDistributedBTT = 0;

  // Single combined live query to Neon DB
  try {
    const combinedRes = await queryNeon<{
      total_count: string;
      active_count: string;
      total_collected: string;
      total_distributed: string;
    }>(
      `SELECT 
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE LOWER(status) NOT IN ('vacant', 'blank')) as active_count,
        COALESCE(SUM("entryAmountBtt"), 0) as total_collected,
        COALESCE(SUM("pushedAmountBtt"), 0) as total_distributed
       FROM "DaoMember"`
    );
    if (combinedRes.rows.length > 0) {
      memberCount = parseInt(combinedRes.rows[0].active_count || combinedRes.rows[0].total_count, 10) || 0;
      totalCollectedBTT = parseFloat(combinedRes.rows[0].total_collected) || 0;
      totalDistributedBTT = parseFloat(combinedRes.rows[0].total_distributed) || 0;
    }
  } catch (err) {
    console.warn('[dao stats] Neon DB combined query note:', err);
  }

  // Fallback directly to TrobChain on-chain contract if DB returned 0
  if (memberCount === 0) {
    try {
      const fullNode = process.env.FULLNODE_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://fullnode-one.trobchain.com';
      const daoHex = '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4';
      const ocRes = await fetch(`${fullNode}/wallet/triggerconstantcontract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_address: daoHex,
          contract_address: daoHex,
          function_selector: 'getAllMembers()',
          parameter: '',
        }),
        signal: AbortSignal.timeout(3000),
      });
      if (ocRes.ok) {
        const ocJson = await ocRes.json();
        if (ocJson.constant_result?.[0]) {
          const { Interface } = await import('ethers');
          const iface = new Interface(['function getAllMembers() view returns (address[])']);
          const mList: string[] = iface.decodeFunctionResult('getAllMembers', '0x' + ocJson.constant_result[0])[0];
          if (Array.isArray(mList) && mList.length > 0) {
            memberCount = mList.length;
            if (totalCollectedBTT === 0) {
              totalCollectedBTT = memberCount * entryFeeBtt;
            }
          }
        }
      }
    } catch (ocErr) {
      console.warn('[dao stats] On-chain fallback note:', ocErr);
    }
  }

  const remainingPositions = Math.max(0, 100 - memberCount);

  const payload = {
    memberCount,
    activeMembers: memberCount,
    capacity: 100,
    remainingPositions,
    entryFeeUsd,
    earningsCapUsd,
    entryFeeBtt,
    entryFeeTrob: entryFeeBtt,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    totalCollectedBTT,
    totalCollectedTROB: totalCollectedBTT,
    totalDistributedBTT,
    totalDistributedTROB: totalDistributedBTT,
    isClosed: memberCount >= 100,
    bttPriceUsd,
    trobPriceUsd: bttPriceUsd,
    priceSource: 'trobchain-market',
    priceUpdatedAt: new Date().toISOString(),
    dividendYieldApy: '0%',
    treasurySnapshotUsd: 0,
  };

  cachedStatsData = payload;
  cachedStatsTime = Date.now();

  return NextResponse.json({
    success: true,
    data: payload,
  });
}
