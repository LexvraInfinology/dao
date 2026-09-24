export interface MatrixSlotSummaryDTO {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  currentCycle: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
  unlockedAt: Date | null;
}

export interface MatrixNodePlacementDTO {
  position: number;
  filled: boolean;
  placedUser: string | null;
  userId: number | null;
  payoutType: string | null;
  recipientAddress: string | null;
  wasFallback: boolean;
  amount: number;
  timestamp: Date | null;
}

export interface MatrixSlotDetailsDTO {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  currentCycle: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
  nodes: MatrixNodePlacementDTO[];
}

export interface MatrixCycleHistoryDTO {
  cycle: number;
  completedAt: Date;
  txHash: string;
  nodesCount: number;
}

export interface MatrixDaoPoolDTO {
  totalShares: number;
  totalDeposited: number;
  totalClaimed: number;
}

export interface MatrixStatsDTO {
  totalPlacements: number;
  totalRecycles: number;
  daoPool: MatrixDaoPoolDTO;
}

export interface MatrixCycleEventDTO {
  cycleNumber: number;
  nodes: any;
  completedAt: Date;
  txHash: string;
}

export interface MatrixPlacementHistoryItemDTO {
  id: string;
  slotNumber: number;
  position: number;
  cycle: number;
  payoutType: string;
  recipientAddress: string;
  wasFallback: boolean;
  amount: number;
  isIncome: boolean;
  matrixOwner: string;
  placedUser: string;
  txHash: string;
  timestamp: Date;
}

export interface MatrixPlacementHistoryResultDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  history: MatrixPlacementHistoryItemDTO[];
}


