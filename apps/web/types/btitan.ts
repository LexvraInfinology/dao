/**
 * B-TITAN Shared TypeScript Types
 * Used across all components, hooks, and pages
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BTitanRank {
  NONE = 0,
  ALPHA = 1,
  PRIME = 2,
  ELITE = 3,
  CROWN = 4,
}

export const RANK_LABELS: Record<BTitanRank, string> = {
  [BTitanRank.NONE]: "Unranked",
  [BTitanRank.ALPHA]: "Alpha Pool Card",
  [BTitanRank.PRIME]: "Prime Pool Card",
  [BTitanRank.ELITE]: "Elite Pool Card",
  [BTitanRank.CROWN]: "Crown Pool Card",
};

export const RANK_COLORS: Record<BTitanRank, string> = {
  [BTitanRank.NONE]: "#6b7280",
  [BTitanRank.ALPHA]: "#3b82f6",
  [BTitanRank.PRIME]: "#8b5cf6",
  [BTitanRank.ELITE]: "#06b6d4",
  [BTitanRank.CROWN]: "#f59e0b",
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

export interface DAOMemberDetails {
  isMember: boolean;
  position: number;           // 1-100
  nftTokenId?: number;        // Soulbound NFT Token ID
  availableBalance: bigint;   // crystallized withdrawable balance
  withdrawableBalance: bigint;
  pendingDistribution: bigint; // unclaimed share
  totalClaimable?: bigint;     // fallback balance
  totalEarned: bigint;
  totalWithdrawn: bigint;
  isCapped?: boolean;
  retopupDeadline?: number;
  isBlank?: boolean;
  poolShareClaimable?: bigint; // 35% Matrix Volume Pool share
}

export interface DAOStats {
  memberCount: number;
  maxPositions?: number;
  totalCollected: bigint;
  totalDistributed: bigint;
  isCompleted: boolean;
  totalPoolReceived?: bigint;
  totalPoolDistributed?: bigint;
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
  referralCode?: number;
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

// ─── Matrix Node Routing & Payout Types ─────────────────────────────────────

export type NodeEventType =
  | "UPLINE_1"
  | "UPLINE_2"
  | "OWNER_DIRECT"
  | "UPGRADE_RESERVE"
  | "AUTO_UPGRADE"
  | "SPILLOVER_DOWNLINE1"
  | "SPILLOVER_DOWNLINE2"
  | "RECYCLE_SPONSOR"
  | "DAO_POOL"
  | "RANK_POOL"
  | "CYCLE_COMPLETE";

export interface CycleSnapshot {
  cycleNumber: number;
  nodes: string[];
  completedAt: string | Date;
  txHash: string;
}

export const NODE_ROUTING_CYCLE1: Record<number, { type: NodeEventType; label: string; recipient: string; color: string }> = {
  1:  { type: "UPLINE_1",            label: "Upline 1",         recipient: "Direct Sponsor", color: "#3b82f6" },
  2:  { type: "UPLINE_2",            label: "Upline 2",         recipient: "2nd Gen Sponsor", color: "#6366f1" },
  3:  { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",      color: "#10b981" },
  4:  { type: "UPGRADE_RESERVE",     label: "Upgrade Reserve",  recipient: "50% of Next Slot",color: "#f59e0b" },
  5:  { type: "UPGRADE_RESERVE",     label: "Auto-Upgrade",     recipient: "50% + Unlock Next",color: "#ec4899" },
  6:  { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",      color: "#10b981" },
  7:  { type: "SPILLOVER_DOWNLINE1", label: "Downline 1 / You", recipient: "Spillover if Qual", color: "#06b6d4" },
  8:  { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",      color: "#10b981" },
  9:  { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",      color: "#10b981" },
  10: { type: "SPILLOVER_DOWNLINE1", label: "Downline 1 / You", recipient: "Spillover if Qual", color: "#06b6d4" },
  11: { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",      color: "#10b981" },
  12: { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",      color: "#10b981" },
  13: { type: "SPILLOVER_DOWNLINE2", label: "Downline 2 / You", recipient: "Spillover if Qual", color: "#8b5cf6" },
  14: { type: "RECYCLE_SPONSOR",     label: "Recycle (85/15)",  recipient: "85% Sponsor + 15% DAO", color: "#e11d48" },
};

export const NODE_ROUTING_CYCLE2_PLUS: Record<number, { type: NodeEventType; label: string; recipient: string; color: string }> = {
  ...NODE_ROUTING_CYCLE1,
  4:  { type: "RANK_POOL",           label: "Rank & DAO Pool",  recipient: "50% Rank + 50% DAO", color: "#8b5cf6" },
  5:  { type: "OWNER_DIRECT",        label: "Your Wallet",      recipient: "You (100%)",         color: "#10b981" },
};

export const NODE_ROUTING: Record<number, NodeEventType> = {
  1:  "UPLINE_1",
  2:  "UPLINE_2",
  3:  "OWNER_DIRECT",
  4:  "UPGRADE_RESERVE",
  5:  "AUTO_UPGRADE",
  6:  "OWNER_DIRECT",
  7:  "SPILLOVER_DOWNLINE1",
  8:  "OWNER_DIRECT",
  9:  "OWNER_DIRECT",
  10: "SPILLOVER_DOWNLINE1",
  11: "OWNER_DIRECT",
  12: "OWNER_DIRECT",
  13: "SPILLOVER_DOWNLINE2",
  14: "RECYCLE_SPONSOR",
};


// ─── Global Stats ─────────────────────────────────────────────────────────────

export interface GlobalStats {
  totalMembers: bigint;
  totalRecycles: bigint;
  totalVolume: bigint;
  daoPool: bigint;
  rankPool: bigint;
  daoMemberCount: number;
  daoCompleted: boolean;
}

