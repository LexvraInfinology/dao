/**
 * contract.ts
 * Utility types for the deployed contracts mapping.
 * Adapted from Scaffold-ETH 2 for B-TITAN.
 */

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: {
      address: string;
      abi: readonly any[];
    };
  };
};

/**
 * Format an Ethereum address to shortened form: 0x1234...5678
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a BigInt amount from 18 decimals to a readable number.
 * Example: 300000000000000000000n → "300.0"
 */
export function formatUnits(amount: bigint, decimals = 18, displayDecimals = 2): string {
  if (amount === undefined || amount === null) return "0";
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, displayDecimals);
  return `${whole.toString()}.${fractionStr}`;
}

/**
 * Parse a display amount (string) to BigInt with 18 decimals.
 * Example: "300" → 300000000000000000000n
 */
export function parseUnits(amount: string, decimals = 18): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Get address from URL referral param (?ref=0x...)
 */
export function getReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && isValidAddress(ref)) return ref;
  return null;
}
