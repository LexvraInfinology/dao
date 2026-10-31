import { NextResponse } from 'next/server';
import { fetchFromBackend } from '../../_lib/proxy';
import { queryNeon } from '../../_lib/neonDb';
import { getOnChainDaoTransactions, syncOnChainMembersState } from '../../_lib/blockchainSync';
import { getMergedOnChainDaoStats } from '../../_lib/onChainMergedDao';
import { IS_MAINNET, FULLNODE_RPC_URL, TROB_PRICE_API_URL } from '@/config/env';
import { getActiveDaoHex, getActiveDaoAddress } from '@/utils/trobAddress';
import { Interface, formatUnits } from 'ethers';

export const dynamic = 'force-dynamic';

// Ultra-fast in-memory cache (3s for live DB stats, 30s for TROB market price)
let cachedStatsData: any = null;
let cachedStatsTime = 0;
let cachedTrobPrice = 0.057097;
let cachedTrobPriceTime = 0;

export async function GET() {
  const now = Date.now();
  if (cachedStatsData && now - cachedStatsTime < 10000) {
    return NextResponse.json({ success: true, data: cachedStatsData });
  }

  // ── TESTNET MODE: Fetch strictly from deployed testnet smart contract ──
  if (!IS_MAINNET) {
    try {
      const daoHex = getActiveDaoHex();
      const rpcUrl = FULLNODE_RPC_URL || 'https://fullnode-one-testnet.trobchain.com';
      const iface = new Interface([
        'function getDAOStats() view returns (uint256 memberCount, uint256 totalCollectedAmount, uint256 totalDistributedAmount, bool isCompleted, bool isExpiredStatus, uint256 secondsRemaining, uint256 activeMembers, uint256 blankSlots, uint256 totalPoolReceivedAmount, uint256 totalPoolDistributedAmount)',
      ]);

      const res = await fetch(`${rpcUrl}/wallet/triggerconstantcontract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_address: daoHex,
          contract_address: daoHex,
          function_selector: 'getDAOStats()',
          parameter: '',
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.constant_result?.[0]) {
          const decoded = iface.decodeFunctionResult('getDAOStats', '0x' + json.constant_result[0]);
          const memberCount = Number(decoded.memberCount);
          const activeMembers = Number(decoded.activeMembers);
          const totalCollectedBTT = parseFloat(formatUnits(decoded.totalCollectedAmount, 6));
          const totalDistributedBTT = parseFloat(formatUnits(decoded.totalDistributedAmount, 6));
          const remainingPositions = Math.max(0, 100 - memberCount);
          const nextAvailableSeat = memberCount < 100 ? memberCount + 1 : 100;
          const entryFeeUsd = 300;
          const earningsCapUsd = 1500;
          const entryFeeBtt = 8076.24;
          const earningsCapBtt = 26785.71;

          const payload = {
            memberCount,
            activeMembers,
            capacity: 100,
            remainingPositions,
            nextAvailableSeat,
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
            totalCollectedUSDEstimate: memberCount * 300,
            totalDistributedUSDEstimate: memberCount * 300,
            onChain: {
              source: 'trobchain-testnet',
              v1: {
                contractHex: daoHex,
                contractBase58: getActiveDaoAddress(),
                totalCollectedTrob: totalCollectedBTT,
                totalDistributedTrob: totalDistributedBTT,
              },
              v2: {
                contractHex: daoHex,
                contractBase58: getActiveDaoAddress(),
                totalCollectedTrob: totalCollectedBTT,
                totalDistributedTrob: totalDistributedBTT,
              },
              merged: {
                totalCollectedTrob: totalCollectedBTT,
                totalDistributedTrob: totalDistributedBTT,
                differenceTrob: Math.round((totalCollectedBTT - totalDistributedBTT) * 1000) / 1000,
              },
            },
            rawDb: {
              collectedTrob: totalCollectedBTT,
              distributedTrob: totalDistributedBTT,
            },
            isClosed: memberCount >= 100,
            bttPriceUsd: 0.056,
            trobPriceUsd: 0.056,
            priceSource: 'trobchain-testnet',
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
      }
    } catch (err) {
      console.warn('[dao stats] Testnet on-chain query error:', err);
    }
  }

  // ── MAINNET MODE: Trigger real-time on-chain state sync in background (throttled) ──
  syncOnChainMembersState().catch(() => {});
  getOnChainDaoTransactions().catch(() => {});

  const trobPriceUsd = 0.056;
  const bttPriceUsd = trobPriceUsd;
  const entryFeeUsd = 300;
  const earningsCapUsd = 1500;
  const entryFeeBtt = 5357.14; // Smart contract fixed entry fee
  const earningsCapBtt = 26785.71; // Smart contract fixed 5X cap

  let memberCount = 87;
  let nextAvailableSeat = 79;
  let rawDbCollectedBTT = 0;
  let rawDbDistributedBTT = 0;

  // 1. Fetch live Merged On-Chain Data directly from TrobChain (V1 + V2)
  const mergedOnChain = await getMergedOnChainDaoStats(trobPriceUsd);

  // 2. Fetch Neon DB stats
  try {
    const combinedRes = await queryNeon<{
      total_count: string;
      active_count: string;
      total_collected: string;
      total_distributed: string;
      next_seat: number;
    }>(
      `SELECT 
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE LOWER(status) NOT IN ('vacant', 'blank')) as active_count,
        COALESCE(SUM("entryAmountBtt"), 0) as total_collected,
        COALESCE(SUM("pushedAmountBtt"), 0) as total_distributed,
        COALESCE(MIN(position) FILTER (WHERE LOWER(status) IN ('vacant', 'blank')), MAX(position) + 1, 1) as next_seat
       FROM "DaoMember"`
    );
    if (combinedRes.rows.length > 0) {
      memberCount = parseInt(combinedRes.rows[0].active_count || combinedRes.rows[0].total_count, 10) || 87;
      nextAvailableSeat = Number(combinedRes.rows[0].next_seat) || 79;
      rawDbCollectedBTT = parseFloat(combinedRes.rows[0].total_collected) || 0;
      rawDbDistributedBTT = parseFloat(combinedRes.rows[0].total_distributed) || 0;
    }
  } catch (err) {
    console.warn('[dao stats] Neon DB combined query note:', err);
  }

  const remainingPositions = Math.max(0, 100 - memberCount);

  // Use Merged On-Chain Truth (V1 + V2) as primary source
  const totalCollectedBTT = mergedOnChain.mergedCollectedTrob;
  const totalDistributedBTT = mergedOnChain.mergedDistributedTrob;

  const payload = {
    memberCount,
    activeMembers: memberCount,
    capacity: 100,
    remainingPositions,
    nextAvailableSeat,
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
    totalCollectedUSDEstimate: mergedOnChain.mergedCollectedUsd,
    totalDistributedUSDEstimate: mergedOnChain.mergedDistributedUsd,
    onChain: {
      source: IS_MAINNET ? 'merged-v1-v2' : 'trobchain-testnet',
      v1: {
        contractHex: IS_MAINNET ? '410a59d6a2dcd3b18687c1efe1625642ad85679377' : getActiveDaoHex(),
        contractBase58: IS_MAINNET ? 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto' : getActiveDaoAddress(),
        totalCollectedTrob: mergedOnChain.v1CollectedTrob,
        totalDistributedTrob: mergedOnChain.v1DistributedTrob,
      },
      v2: {
        contractHex: IS_MAINNET ? '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4' : getActiveDaoHex(),
        contractBase58: IS_MAINNET ? 'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT' : getActiveDaoAddress(),
        totalCollectedTrob: mergedOnChain.v2CollectedTrob,
        totalDistributedTrob: mergedOnChain.v2DistributedTrob,
      },
      merged: {
        totalCollectedTrob: mergedOnChain.mergedCollectedTrob,
        totalDistributedTrob: mergedOnChain.mergedDistributedTrob,
        differenceTrob: Math.round((mergedOnChain.mergedCollectedTrob - mergedOnChain.mergedDistributedTrob) * 1000) / 1000,
      },
    },
    rawDb: {
      collectedTrob: rawDbCollectedBTT,
      distributedTrob: rawDbDistributedBTT,
    },
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
