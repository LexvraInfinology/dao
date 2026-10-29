export interface BlockchainLogCursor {
  contractName: string;
  chainId: number;
  lastIndexedBlock: string;
  lastIndexedBlockHash?: string;
  updatedAt: string;
}

export type QueueJobName =
  | "INDEXER_CATCHUP"
  | "STATS_RECALCULATION"
  | "LEADERBOARD_SNAPSHOT"
  | "WEBHOOK_NOTIFICATION";

export interface QueueJob<T = any> {
  id: string;
  name: QueueJobName;
  data: T;
  timestamp: number;
}

export interface IndexerCatchupPayload {
  contractName: string;
  fromBlock: number;
  toBlock: number;
}

export interface StatsRecalculationPayload {
  scope: "all" | "dao" | "matrix" | "ranks";
  triggerSource?: string;
}
