export interface DaoTxItem {
  id: string;
  date: string;
  type: 'seat_distribution' | 'withdrawal' | 'governance' | 'council_seat';
  typeLabel: string;
  amountUsd: string;
  amountTrob: string;
  isPositive: boolean | null; // true: positive, false: negative, null: neutral/0
  fromTitle: string;
  fromAddress: string;
  status: 'Success';
  txHash: string;
  fullTxHash: string;
  badgeType: 'Verified' | 'Outgoing';
}

export const DAO_TRANSACTIONS_LIST: DaoTxItem[] = [];
