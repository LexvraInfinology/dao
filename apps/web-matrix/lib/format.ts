// ==============================================================================
// EQUORA MATRIX PROTOCOL — FORMATTING & BASE58 UTILITIES (apps/web-matrix/lib/format.ts)
// ==============================================================================

import { toTrobBase58 } from "./contracts";

export { toTrobBase58 };

/**
 * Formats any address (0x hex, 41-hex, or Base58) into TrobSafe native Base58 display format.
 *
 * @param addr The address to format
 * @param variant "short" (TJhwjg...Uckjq), "spaced" (TJhwjg . . . Uckjq), or "full"
 * @param fallback Label when no address is provided
 */
export function formatAddress(
  addr?: string | null,
  variant: "short" | "spaced" | "full" = "short",
  fallback = "Not Connected"
): string {
  if (!addr || !addr.trim() || addr === "0x0" || addr === "0") {
    return fallback;
  }
  const b58 = toTrobBase58(addr.trim());
  if (!b58 || b58.length < 10) {
    return fallback;
  }

  if (variant === "full") {
    return b58;
  }

  const prefix = b58.slice(0, 6);
  const suffix = b58.slice(-4);

  if (variant === "spaced") {
    return `${prefix} . . . ${suffix}`;
  }

  return `${prefix}...${suffix}`;
}

/**
 * Safely parses any date/timestamp string or number without throwing "Invalid Date".
 */
export function formatDateSafe(
  date?: string | number | Date | null,
  fallback = "On-Chain Active"
): string {
  if (!date) return fallback;

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (trimmed === "On-Chain Active" || trimmed === "Active" || trimmed === "New Member" || trimmed === "Active Member") {
      return trimmed;
    }
  }

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return fallback;
    }
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

/**
 * Safely formats date + time without throwing "Invalid Date".
 */
export function formatDateTimeSafe(
  date?: string | number | Date | null,
  fallback = "Active"
): string {
  if (!date) return fallback;

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (trimmed === "On-Chain Active" || trimmed === "Active" || trimmed === "New Member") {
      return trimmed;
    }
  }

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return fallback;
    }
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

/**
 * Formats a TROB amount cleanly with specified decimals.
 */
export function formatTrob(amount?: number | null, decimals = 2): string {
  const val = Number(amount || 0);
  if (isNaN(val)) return "0.00";
  return val.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
