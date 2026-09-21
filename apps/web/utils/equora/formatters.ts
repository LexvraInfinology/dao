/**
 * formatters.ts
 * General formatting utilities for the Equora.Fi frontend
 */

/**
 * Format a wallet address to shortened form
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "Empty";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a timestamp (seconds) to a date string
 */
export function formatTimestamp(ts: number | bigint): string {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format seconds to human-readable countdown: "2y 3mo 15d"
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Unlocked!";

  const years = Math.floor(seconds / (365 * 24 * 3600));
  const months = Math.floor((seconds % (365 * 24 * 3600)) / (30 * 24 * 3600));
  const days = Math.floor((seconds % (30 * 24 * 3600)) / (24 * 3600));

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0) parts.push(`${days}d`);
  return parts.join(" ") || "< 1 day";
}

/**
 * Format a percentage from basis points (250 BPS = 2.50%)
 */
export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * Generate a referral URL with the wallet address
 */
export function generateReferralUrl(address: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?ref=${address}`;
}

/**
 * Copy text to clipboard with feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get position label in DAO queue
 */
export function formatDAOPosition(position: number): string {
  if (position === 0) return "Not Joined";
  return `#${position} / 50`;
}

/**
 * Check if address is the zero address
 */
export function isZeroAddress(address: string): boolean {
  return !address || address === "0x0000000000000000000000000000000000000000";
}
