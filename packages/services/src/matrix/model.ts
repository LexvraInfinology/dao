export interface MatrixSlotSummaryDTO {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  isLive?: boolean;
  currentCycle: number;
  recyclesCount: number;
  filledNodes: number;
  upgradeReserve: number;
  totalEarned: number;
  unlockedAt: Date | null;
}

export interface MatrixNodePlacementDTO {
  position: number;
  level: number;
  filled: boolean;
  placedUser: string | null;
  userId: number | null;
  payoutType: string | null;
  recipientAddress: string | null;
  wasFallback: boolean;
  amount: number;
  timestamp: Date | null;
  isDirect?: boolean;
  isDirectDeposited?: boolean;
  isSpillover?: boolean;
}

export interface MatrixSlotDetailsDTO {
  slotNumber: number;
  cost: number;
  isUnlocked: boolean;
  isLive?: boolean;
  currentCycle: number;
  recyclesCount: number;
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

export interface MatrixUserProfileDTO {
  address: string;
  userId: number;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  telegram: string | null;
  twitter: string | null;
  sponsorAddress: string | null;
  sponsorUserId: number | null;
  directReferralsCount: number;
  activeDirectsCount?: number;
  isQualified?: boolean;
  teamCount: number;
  rankTier: number;
  rankName: string;
  totalEarnings: number;
  directEarnings: number;
  matrixEarnings: number;
  poolEarnings: number;
  availableBalance: number;
  withdrawnTotal: number;
  recyclesCount: number;
  highestUnlockedSlot: number;
  referralCode?: number | null;
  sponsorCode?: number | null;
  daoSeat?: number | null;
  joinedAt: Date;
}

export interface MatrixDashboardDTO {
  currentSlot: number;
  totalEarnedTrob: number;
  totalEarnedUsd: number;
  availableWithdrawTrob: number;
  availableWithdrawUsd: number;
  recyclesCount: number;
  trobPriceUsd: number;
  isQualified?: boolean;
  activeDirectsCount?: number;
  activeSlotProgress: {
    slotNumber: number;
    filledNodes: number;
    totalNodes: number;
    cycle: number;
    upgradeReserve: number;
    level1Filled: number;
    level2Filled: number;
    level3Filled: number;
  };
  nextPosition: {
    positionNumber: number;
    title: string;
    description: string;
    rewardType: string;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    title: string;
    description: string;
    slotNumber?: number;
    amount?: number;
    timestamp: Date;
    status: string;
  }>;
}

export interface MatrixLeaderboardEntryDTO {
  rank: number;
  address: string;
  userId: number;
  username: string;
  avatarUrl: string | null;
  totalEarned: number;
  totalEarnedUsd: number;
  directCount: number;
  highestSlot: number;
  rankTier: number;
  rankName: string;
}

export interface MatrixTransactionDTO {
  id: string;
  type: string;
  slotNumber: number | null;
  cycle: number | null;
  position: number | null;
  amount: number;
  amountUsd: number | null;
  token: string;
  fromAddress: string | null;
  toAddress: string | null;
  txHash: string | null;
  status: string;
  description: string | null;
  timestamp: Date;
}

export interface MatrixSettingsDTO {
  autoUpgrade: boolean;
  autoReinvest: boolean;
  telegramNotifications: boolean;
  emailNotifications: boolean;
  soundEffects: boolean;
  currency: string;
  theme: string;
  matrixDisplayMode: string;
  hideZeroBalances: boolean;
  email: string | null;
  telegram: string | null;
  notifications?: Record<string, boolean>;
}

export interface MatrixEarningsOverviewDTO {
  totalEarnings: number;
  totalEarningsUsd: number;
  availableBalance: number;
  availableBalanceUsd: number;
  withdrawnTotal: number;
  withdrawnTotalUsd: number;
  trobPriceUsd: number;
  breakdown: {
    directBonus: number;
    matrixPlacements: number;
    upgradeReserves: number;
    poolShares: number;
  };
  chartData: Array<{
    date: string;
    amount: number;
  }>;
  recentPayouts: MatrixTransactionDTO[];
}
