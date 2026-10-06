/**
 * DAO Economics & Dividend Earnings Calculator
 *
 * Rules:
 * 1. Genesis Council operates on the deterministic 300 / N on-chain payout model:
 *    - Each seat entry pays $300 USD fixed deposit.
 *    - Upon activation, seat P receives instant cashback = $300 / P USD.
 *    - For every subsequent member activation k (where k > P), seat P receives $300 / k USD.
 * 2. Cumulative lifetime earnings in USD represents the exact accumulated historical USD
 *    payouts recorded at event time, NOT fluctuating with today's live market rate.
 * 3. Capped seats have hit the strict 5X hard cap ($1,500.00 USD).
 * 4. Underfunded / vacant seats have not completed their deposit and receive $0.00 until funded.
 */

export function calculateMemberEarnedUsd(
  position: number | null | undefined,
  status?: string | null,
  totalActiveSeats: number = 93
): number {
  if (!position || position <= 0) return 0;
  const s = status ? status.toLowerCase() : '';
  if (s === 'underfunded' || s === 'vacant' || s === 'blank' || s === 'defaulted') return 0;
  if (s === 'capped') return 1500;

  let totalUsd = 0;
  const maxK = Math.max(position, totalActiveSeats);
  for (let k = position; k <= maxK; k++) {
    totalUsd += 300 / k;
  }
  return Math.min(1500, Math.round(totalUsd * 100) / 100);
}
