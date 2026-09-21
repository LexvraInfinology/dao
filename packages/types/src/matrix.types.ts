export type SlotNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type MatrixPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type PayoutType =
  | "UPLINE_1"
  | "UPLINE_2"
  | "OWNER_DIRECT"
  | "UPGRADE_RESERVE"
  | "AUTO_UPGRADE"
  | "SPILLOVER_DOWNLINE1"
  | "SPILLOVER_DOWNLINE2"
  | "RECYCLE_SPONSOR"
  | "DAO_POOL"
  | "RANK_POOL";

export interface MatrixSlotState {
  slotNumber: SlotNumber;
  isUnlocked: boolean;
  currentCycle: number;
  filledNodes: number;
  upgradeReserve: string;
  totalEarned: string;
  unlockedAt: string | null;
}

export interface MatrixNodePlacement {
  position: MatrixPosition;
  placedUserAddress: string;
  payoutType: PayoutType;
  recipientAddress: string;
  wasFallback: boolean;
  amount: string;
  txHash: string;
  timestamp: string;
}

export interface MatrixSlotDetails {
  userAddress: string;
  slotNumber: SlotNumber;
  currentCycle: number;
  filledNodes: number;
  isUnlocked: boolean;
  upgradeReserve: string;
  totalEarned: string;
  nodes: MatrixNodePlacement[];
}
