/**
 * matrixHelpers.ts
 * Helper functions for Equora.Fi Matrix calculations and visualizations
 */

import { SLOT_COSTS, NODE_ROUTING, NodeEventType } from "../../types/equora";

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
  recipient: string;
} {
  const isFirstCycle = cycle <= 1;

  switch (position) {
    case 0:
      return { label: "Root Node (YOU)", color: "#b9c7e4", description: "Owner of this 14-position binary matrix level", recipient: "You" };
    case 1:
      return { label: "Referral 1", color: "#60a5fa", description: "Direct Referral 1 (Qualification / Downline 1)", recipient: "Direct Sponsor / Downline 1" };
    case 2:
      return { label: "Referral 2", color: "#818cf8", description: "Direct Referral 2 (Qualification - Unlocks Income)", recipient: "Direct Sponsor / Downline 2" };
    case 3:
      return { label: "First Income", color: "#22c55e", description: "First income-generating node (100% to your balance if qualified)", recipient: "You" };
    case 6:
    case 8:
    case 9:
    case 11:
    case 12:
      return { label: "Your Wallet", color: "#22c55e", description: "Direct income to your balance (100%)", recipient: "You" };
    case 4:
      return isFirstCycle
        ? { label: "Upgrade Reserve", color: "#f59e0b", description: "50% of next slot upgrade cost", recipient: "Upgrade Reserve" }
        : { label: "Pool & DAO Share", color: "#a78bfa", description: "50% to Milestone Pool + 50% to DAO Pool", recipient: "Pool & DAO Share" };
    case 5:
      return isFirstCycle
        ? { label: "Auto-Upgrade", color: "#ec4899", description: "50% + automatically unlocks next slot", recipient: "Auto-Upgrade" }
        : { label: "Your Wallet", color: "#22c55e", description: "Direct income to your balance (100%)", recipient: "You" };
    case 7:
    case 10:
      return { label: "Downline 1", color: "#06b6d4", description: "Spillover to Downline 1 (fallback to you if unqualified)", recipient: "Downline 1 / You" };
    case 13:
      return { label: "Downline 2", color: "#0ea5e9", description: "Spillover to Downline 2 (fallback to you if unqualified)", recipient: "Downline 2 / You" };
    case 14:
      return { label: "Recycle", color: "#f97316", description: "Completes level cycle, recycles matrix, and advances to next level", recipient: "Recycle & Advance" };
    default:
      return { label: "Unknown", color: "#6b7280", description: "", recipient: "" };
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
    3: "Alpha Pool Card",
    6: "Prime Pool Card",
    9: "Elite Pool Card",
    12: "Crown Pool Card",
  };
  return ranks[slot] ?? "Unknown";
}

export function formatBTT(amount?: bigint | null, decimals = 2): string {
  if (amount === undefined || amount === null) return "0.00";
  const divisor = BigInt(10 ** 18);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(18, "0").slice(0, decimals);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

export const formatEQR = formatBTT;

export interface MatrixTreeNode {
  position: number;
  address: string | null;
  user?: string | null;
  isFilled: boolean;
}

/**
 * Build matrix node tree structure for visualization
 * Returns a 4-level tree: [level0: YOU, level1: [p1,p2], level2: [p3..p6], level3: [p7..p14]]
 */
export function buildMatrixTree(nodes: string[]): {
  level: number;
  positions: MatrixTreeNode[];
  nodes: MatrixTreeNode[];
}[] {
  const isFilled = (addr?: string | null) =>
    !!addr && addr !== "0x0000000000000000000000000000000000000000";

  const makeNode = (pos: number, addr?: string | null): MatrixTreeNode => ({
    position: pos,
    address: addr || null,
    user: addr || null,
    isFilled: isFilled(addr),
  });

  const level0 = [makeNode(0, null)]; // Root / YOU
  const level1 = [makeNode(1, nodes?.[0]), makeNode(2, nodes?.[1])];
  const level2 = [
    makeNode(3, nodes?.[2]),
    makeNode(4, nodes?.[3]),
    makeNode(5, nodes?.[4]),
    makeNode(6, nodes?.[5]),
  ];
  const level3 = [
    makeNode(7, nodes?.[6]),
    makeNode(8, nodes?.[7]),
    makeNode(9, nodes?.[8]),
    makeNode(10, nodes?.[9]),
    makeNode(11, nodes?.[10]),
    makeNode(12, nodes?.[11]),
    makeNode(13, nodes?.[12]),
    makeNode(14, nodes?.[13]),
  ];

  return [
    { level: 0, positions: level0, nodes: level0 },
    { level: 1, positions: level1, nodes: level1 },
    { level: 2, positions: level2, nodes: level2 },
    { level: 3, positions: level3, nodes: level3 },
  ];
}


