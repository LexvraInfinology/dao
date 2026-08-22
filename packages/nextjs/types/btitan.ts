/**
 * B-TITAN Shared TypeScript Types
 * Used across all components, hooks, and pages
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BTitanRank {
  NONE = 0,
  RISING = 1,
  PRIME = 2,
  ROYAL = 3,
  LEGENDARY = 4,
}

export const RANK_LABELS: Record<BTitanRank, string> = {
  [BTitanRank.NONE]: "Unranked",
  [BTitanRank.RISING]: "Rising Star",
  [BTitanRank.PRIME]: "Prime",
  [BTitanRank.ROYAL]: "Royal",
  [BTitanRank.LEGENDARY]: "Legendary",
};

export const RANK_COLORS: Record<BTitanRank, string> = {
  [BTitanRank.NONE]: "#6b7280",
  [BTitanRank.RISING]: "#f59e0b",
  [BTitanRank.PRIME]: "#8b5cf6",
  [BTitanRank.ROYAL]: "#06b6d4",
  [BTitanRank.LEGENDARY]: "#f97316",
};

// ─── Slot Data ────────────────────────────────────────────────────────────────

export interface SlotData {
  slotNumber: number;
  isUnlocked: boolean;
  currentCycle: number;
  filledNodes: number;
  nodes: string[];        // 14 addresses (0x0 = empty)
  upgradeReserve: bigint;
  totalEarned: bigint;
  cost: bigint;
}

export const SLOT_COSTS: Record<number, bigint> = {
  1:  BigInt("30000000000000000000"),    // 30 BTT
  2:  BigInt("60000000000000000000"),    // 60 BTT
  3:  BigInt("120000000000000000000"),   // 120 BTT
  4:  BigInt("240000000000000000000"),   // 240 BTT
  5:  BigInt("480000000000000000000"),   // 480 BTT
  6:  BigInt("960000000000000000000"),   // 960 BTT
  7:  BigInt("1920000000000000000000"),  // 1920 BTT
  8:  BigInt("3840000000000000000000"),  // 3840 BTT
  9:  BigInt("7680000000000000000000"),  // 7680 BTT
  10: BigInt("15360000000000000000000"), // 15360 BTT
  11: BigInt("30720000000000000000000"), // 30720 BTT
  12: BigInt("61440000000000000000000"), // 61440 BTT
};

// Magic Box milestones
export const MAGIC_BOX_SLOTS = [3, 6, 9, 12] as const;
export type MagicBoxSlot = (typeof MAGIC_BOX_SLOTS)[number];

// ─── DAO Types ────────────────────────────────────────────────────────────────

export interface DAOMemberDetails {
  isMember: boolean;
  position: number;       // 1-50
  availableBalance: bigint;
  totalEarned: bigint;
  totalWithdrawn: bigint;
}

export interface DAOStats {
  memberCount: number;
  totalCollected: bigint;
  totalDistributed: bigint;
  isCompleted: boolean;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  address: string;
  isRegistered: boolean;
  sponsor: string;
  directReferrals: string[];
  directReferralCount: number;
  isQualified: boolean;
  userId: number;
}

// ─── Financial Data ───────────────────────────────────────────────────────────

export interface UserFinancials {
  availableBalance: bigint;
  lifetimeEarned: bigint;
  withdrawn: bigint;
  highestSlot: number;
}

// ─── NFT / Rewards ────────────────────────────────────────────────────────────

export interface UserNFTs {
  hasWelcomePass: boolean;
  welcomePassTokenId: number;
  rank: BTitanRank;
  allTokenIds: number[];
}

export interface VestingLock {
  beneficiary: string;
  amount: bigint;
  unlockTimestamp: bigint;
  claimed: boolean;
  milestoneSlot: number;
}

export interface UserVestingData {
  locks: VestingLock[];
  totalLocked: bigint;
  claimableAmount: bigint;
  equityBps: number;    // e.g., 250 = 2.5%
}

// ─── Matrix Node Routing ──────────────────────────────────────────────────────

export type NodeEventType =
  | "UPLINE_1"
  | "UPLINE_2"
  | "YOUR_WALLET"
  | "NEXT_SLOT_FUND"
  | "ROYAL_POOL"
  | "DOWNLINE_1_SPILLOVER"
  | "DOWNLINE_2_SPILLOVER"
  | "RECYCLE_SPONSOR";

export const NODE_ROUTING: Record<number, NodeEventType> = {
  1:  "UPLINE_1",
  2:  "UPLINE_2",
  3:  "YOUR_WALLET",
  4:  "NEXT_SLOT_FUND",
  5:  "NEXT_SLOT_FUND",
  6:  "YOUR_WALLET",
  7:  "DOWNLINE_1_SPILLOVER",
  8:  "YOUR_WALLET",
  9:  "YOUR_WALLET",
  10: "DOWNLINE_1_SPILLOVER",
  11: "YOUR_WALLET",
  12: "YOUR_WALLET",
  13: "DOWNLINE_2_SPILLOVER",
  14: "RECYCLE_SPONSOR",
};

// ─── Global Stats ─────────────────────────────────────────────────────────────

export interface GlobalStats {
  totalMembers: bigint;
  totalRecycles: bigint;
  totalVolume: bigint;
  royalPool: bigint;
  daoMemberCount: number;
  daoCompleted: boolean;
}
