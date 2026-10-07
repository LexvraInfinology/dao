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
  trobPriceUsd: number = 0.037757
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
    // Each past retopup cycle completed earned $1,500.00 USD.
    const cycleEarnedUsd = isCappedStatus
      ? 1500
      : Math.min(1500, Math.round(currentCyclePushedTrob * trobPriceUsd * 100) / 100);
    const capPct = isCappedStatus
      ? 100
      : Math.min(99, Math.round((cycleEarnedUsd / 1500) * 100));
    const lifetimeUsd = Math.round(((retopupCount * 1500) + cycleEarnedUsd) * 100) / 100;
    return {
      currentCycleUsd: cycleEarnedUsd,
      currentCycleCapPct: capPct,
      lifetimeUsd,
      isCapped: isCappedStatus || cycleEarnedUsd >= 1500,
    };
  }

  // Initial cycle (retopupCount === 0)
  if (isCappedStatus) {
    return { currentCycleUsd: 1500, currentCycleCapPct: 100, lifetimeUsd: 1500, isCapped: true };
  }

  // Active member in initial cycle
  let totalTheoretical = 0;
  const maxK = Math.max(position, totalActiveSeats);
  for (let k = position; k <= maxK; k++) {
    totalTheoretical += 300 / k;
  }

  const cycleEarnedUsd = currentCyclePushedTrob > 0
    ? Math.min(1499.99, Math.round(currentCyclePushedTrob * trobPriceUsd * 100) / 100)
    : Math.min(1499.99, Math.round(totalTheoretical * 100) / 100);

  const capPct = Math.min(99, Math.round((cycleEarnedUsd / 1500) * 100));

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
  trobPriceUsd: number = 0.037757
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
