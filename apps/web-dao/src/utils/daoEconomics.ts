/**
 * DAO Economics & Dividend Earnings Calculator
 *
 * Rules:
 * 1. Genesis Council operates on the deterministic 300 / N on-chain payout model:
 *    - Each seat entry pays $300 USD fixed deposit.
 *    - Upon activation, seat P receives instant cashback = $300 / P USD.
 *    - For every subsequent member activation k (where k > P), seat P receives $300 / k USD.
 * 2. Cumulative lifetime earnings in USD represents the exact accumulated historical USD
 *    payouts recorded across all cycles.
 * 3. Capped seats have hit the strict 5X hard cap ($1,500.00 USD) in their current cycle.
 * 4. When a member re-topups, their current cycle cap progress RESETS to 0% ($0.00 / $1,500.00),
 *    and their 48-hour retopup window is closed.
 * 5. Underfunded / vacant seats receive $0.00 until funded.
 */

// Smart contract constants from EquoraDAOv2
export const CONTRACT_ENTRY_FEE_TROB    = 5357.142857;  // 5,357.14 TROB ($300 USD fixed deposit)
export const CONTRACT_EARNINGS_CAP_TROB = 26785.714285; // 26,785.71 TROB ($1,500 USD 5X cap)
export const CONTRACT_TROB_PEG          = 0.056;        // $0.056 USD per TROB (lastTrobPriceUsd6 in contract)
export const CONTRACT_EARNINGS_CAP_USD  = 1500;
export const CONTRACT_ENTRY_FEE_USD     = 300;

export interface MemberEarningsBreakdown {
  currentCycleUsd: number;
  currentCycleCapPct: number;
  lifetimeUsd: number;
  isCapped: boolean;
}

export function calculateMemberCycleAndLifetime(
  position: number | null | undefined,
  status?: string | null,
  totalActiveSeats: number = 93,
  retopupCount: number = 0,
  currentCyclePushedTrob: number = 0,
  trobPriceUsd: number = CONTRACT_TROB_PEG
): MemberEarningsBreakdown {
  if (!position || position <= 0) {
    return { currentCycleUsd: 0, currentCycleCapPct: 0, lifetimeUsd: 0, isCapped: false };
  }
  const s = status ? status.toLowerCase() : '';
  if (s === 'underfunded' || s === 'vacant' || s === 'blank' || s === 'defaulted') {
    return { currentCycleUsd: 0, currentCycleCapPct: 0, lifetimeUsd: 0, isCapped: false };
  }

  const isCappedStatus = s === 'capped';

  if (retopupCount > 0) {
    // Member has re-topuped at least once!
    // Smart contract resets lifetimeEarnings to 0, starting a new cycle towards 26,785.71 TROB ($1,500).
    const cycleEarnedUsd = isCappedStatus
      ? 1500
      : Math.min(1500, Math.round(currentCyclePushedTrob * CONTRACT_TROB_PEG * 100) / 100);
    const capPct = isCappedStatus
      ? 100
      : Math.min(99.9, Math.round((currentCyclePushedTrob / CONTRACT_EARNINGS_CAP_TROB) * 1000) / 10);
    const lifetimeUsd = Math.round(((retopupCount * 1500) + cycleEarnedUsd) * 100) / 100;
    return {
      currentCycleUsd: cycleEarnedUsd,
      currentCycleCapPct: capPct,
      lifetimeUsd,
      isCapped: isCappedStatus || currentCyclePushedTrob >= CONTRACT_EARNINGS_CAP_TROB,
    };
  }

  // Initial cycle (retopupCount === 0)
  if (isCappedStatus) {
    return { currentCycleUsd: 1500, currentCycleCapPct: 100, lifetimeUsd: 1500, isCapped: true };
  }

  // Active member in initial cycle
  let cycleEarnedUsd = 0;
  let capPct = 0;

  if (currentCyclePushedTrob > 0) {
    // Exact smart contract earnings truth
    cycleEarnedUsd = Math.min(1499.99, Math.round(currentCyclePushedTrob * CONTRACT_TROB_PEG * 100) / 100);
    capPct = Math.min(99.9, Math.round((currentCyclePushedTrob / CONTRACT_EARNINGS_CAP_TROB) * 1000) / 10);
  } else {
    // Theoretical 300 / N model
    let totalTheoretical = 0;
    const maxK = Math.max(position, totalActiveSeats);
    for (let k = position; k <= maxK; k++) {
      totalTheoretical += 300 / k;
    }
    cycleEarnedUsd = Math.min(1499.99, Math.round(totalTheoretical * 100) / 100);
    capPct = Math.min(99.9, Math.round((cycleEarnedUsd / 1500) * 1000) / 10);
  }

  return {
    currentCycleUsd: cycleEarnedUsd,
    currentCycleCapPct: capPct,
    lifetimeUsd: cycleEarnedUsd,
    isCapped: false,
  };
}

export function calculateMemberEarnedUsd(
  position: number | null | undefined,
  status?: string | null,
  totalActiveSeats: number = 93,
  retopupCount: number = 0,
  currentCyclePushedTrob: number = 0,
  trobPriceUsd: number = CONTRACT_TROB_PEG
): number {
  const result = calculateMemberCycleAndLifetime(
    position,
    status,
    totalActiveSeats,
    retopupCount,
    currentCyclePushedTrob,
    trobPriceUsd
  );
  return result.currentCycleUsd;
}
