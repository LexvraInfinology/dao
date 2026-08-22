/**
 * matrixHelpers.ts
 * Helper functions for B-TITAN Matrix calculations and visualizations
 */

import { SLOT_COSTS, NODE_ROUTING, NodeEventType } from "../../types/btitan";

/**
 * Get human-readable slot cost in BTT numbers (e.g. 30, 60, 120, etc.)
 */
export function getSlotPrice(slot: number): number {
  const prices: Record<number, number> = {
    1: 30,
    2: 60,
    3: 120,
    4: 240,
    5: 480,
    6: 960,
    7: 1920,
    8: 3840,
    9: 7680,
    10: 15360,
    11: 30720,
    12: 61440,
  };
  return prices[slot] ?? 30 * Math.pow(2, slot - 1);
}

/**
 * Get the human-readable label for a node position's payout routing
 */
export function getNodeLabel(position: number, cycle: number): {
  label: string;
  color: string;
  description: string;
} {
  const isFirstCycle = cycle === 1;

  switch (position) {
    case 1:
      return { label: "Upline 1", color: "#60a5fa", description: "Your sponsor receives this" };
    case 2:
      return { label: "Upline 2", color: "#818cf8", description: "Your sponsor's sponsor receives this" };
    case 3:
    case 6:
    case 8:
    case 9:
    case 11:
    case 12:
      return { label: "Your Wallet", color: "#22c55e", description: "Direct income to you" };
    case 4:
      return isFirstCycle
        ? { label: "Next Slot Fund", color: "#f59e0b", description: "Building your next slot reserve (1/2)" }
        : { label: "Royal Pool", color: "#a78bfa", description: "Contributed to Royal Pool" };
    case 5:
      return isFirstCycle
        ? { label: "Next Slot Fund", color: "#f59e0b", description: "Building your next slot reserve (2/2)" }
        : { label: "Your Wallet", color: "#22c55e", description: "Direct income to you" };
    case 7:
    case 10:
      return { label: "Downline 1", color: "#06b6d4", description: "Spillover to your first referral" };
    case 13:
      return { label: "Downline 2", color: "#0ea5e9", description: "Spillover to your second referral" };
    case 14:
      return { label: "Recycle", color: "#f97316", description: "Matrix resets, sponsor gets paid" };
    default:
      return { label: "Unknown", color: "#6b7280", description: "" };
  }
}

/**
 * Calculate total potential earnings for a slot
 * Returns the breakdown across all 14 positions
 */
export function calculateSlotEarnings(slot: number, cycle: number): {
  position: number;
  amount: bigint;
  recipient: string;
}[] {
  const cost = SLOT_COSTS[slot];
  if (!cost) return [];

  return Array.from({ length: 14 }, (_, i) => {
    const position = i + 1;
    const info = getNodeLabel(position, cycle);
    return {
      position,
      amount: cost,
      recipient: info.label,
    };
  });
}

/**
 * Get fill percentage for a slot's current cycle
 */
export function getSlotFillPercentage(filledNodes: number): number {
  return Math.round((filledNodes / 14) * 100);
}

/**
 * Check if a slot is a Magic Box milestone
 */
export function isMagicBoxSlot(slot: number): boolean {
  return [3, 6, 9, 12].includes(slot);
}

/**
 * Get the rank awarded at a Magic Box slot
 */
export function getMagicBoxRank(slot: number): string {
  const ranks: Record<number, string> = {
    3: "Rising Star",
    6: "Prime",
    9: "Royal",
    12: "Legendary",
  };
  return ranks[slot] ?? "Unknown";
}

/**
 * Format BTT amount from BigInt (18 decimals) to human-readable string
 */
export function formatBTT(amount: bigint, decimals = 2): string {
  if (!amount && amount !== BigInt(0)) return "0";
  const divisor = BigInt(10 ** 18);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(18, "0").slice(0, decimals);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

/**
 * Build matrix node tree structure for visualization
 * Returns a 3-level tree: [level1: [p1,p2], level2: [p3,p4,p5,p6], level3: [p7..p14]]
 */
export function buildMatrixTree(nodes: string[]): {
  level: number;
  positions: { position: number; address: string | null }[];
}[] {
  return [
    {
      level: 1,
      positions: [
        { position: 1, address: nodes[0] || null },
        { position: 2, address: nodes[1] || null },
      ],
    },
    {
      level: 2,
      positions: [
        { position: 3, address: nodes[2] || null },
        { position: 4, address: nodes[3] || null },
        { position: 5, address: nodes[4] || null },
        { position: 6, address: nodes[5] || null },
      ],
    },
    {
      level: 3,
      positions: [
        { position: 7, address: nodes[6] || null },
        { position: 8, address: nodes[7] || null },
        { position: 9, address: nodes[8] || null },
        { position: 10, address: nodes[9] || null },
        { position: 11, address: nodes[10] || null },
        { position: 12, address: nodes[11] || null },
        { position: 13, address: nodes[12] || null },
        { position: 14, address: nodes[13] || null },
      ],
    },
  ];
}

