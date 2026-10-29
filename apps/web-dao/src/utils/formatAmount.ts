/**
 * Clean numeric formatters for USD and TROB amounts
 * - Whole numbers (300, 150, 100, 75, 60, 50) format without trailing decimals (e.g. $300, $150).
 * - Fractional amounts format with max 2 decimals (e.g. $42.86, 2,626.97 TROB).
 * - Eliminates ugly 6-7 trailing decimals or raw floating-point strings.
 */

export function formatUsd(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(n)) return '0';
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 0.005) {
    return Math.round(n).toLocaleString('en-US');
  }
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatTrob(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(n)) return '0';
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 0.005) {
    return Math.round(n).toLocaleString('en-US');
  }
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
