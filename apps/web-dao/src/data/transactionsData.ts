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

export const DAO_TRANSACTIONS_LIST: DaoTxItem[] = [
  {
    id: 'tx-1',
    date: '2 mins ago',
    type: 'seat_distribution',
    typeLabel: 'Seat Distribution',
    amountUsd: '+$48.20',
    amountTrob: '+317.94 TROB',
    isPositive: true,
    fromTitle: 'Seat #86 • #1042',
    fromAddress: '0x4B71...89F2',
    status: 'Success',
    txHash: '0x9e...3f2',
    fullTxHash: '0x9e5f4a18b2c89012d345e67890123456789013f2',
    badgeType: 'Verified',
  },
  {
    id: 'tx-2',
    date: '28 mins ago',
    type: 'seat_distribution',
    typeLabel: 'Seat Distribution',
    amountUsd: '+$25.00',
    amountTrob: '+164.91 TROB',
    isPositive: true,
    fromTitle: 'Seat #85 • #0987',
    fromAddress: '0x7C21...3A1D',
    status: 'Success',
    txHash: '0x7b...ac1',
    fullTxHash: '0x7b219084cba38210495810293481029481902ac1',
    badgeType: 'Verified',
  },
  {
    id: 'tx-3',
    date: '1 hour ago',
    type: 'withdrawal',
    typeLabel: 'Withdrawal',
    amountUsd: '-$420.50',
    amountTrob: '-2,773.75 TROB',
    isPositive: false,
    fromTitle: 'Your Treasury',
    fromAddress: '0x8A3F...91F2',
    status: 'Success',
    txHash: '0x2d...4fe',
    fullTxHash: '0x2d4fe891024819203948102938471029384014fe',
    badgeType: 'Outgoing',
  },
  {
    id: 'tx-4',
    date: '2 hours ago',
    type: 'seat_distribution',
    typeLabel: 'Seat Distribution',
    amountUsd: '+$48.20',
    amountTrob: '+317.94 TROB',
    isPositive: true,
    fromTitle: 'Seat #84 • #1172',
    fromAddress: '0x9D14...7C21',
    status: 'Success',
    txHash: '0x8c...9d21',
    fullTxHash: '0x8c9d218491028340192840192830192830199d21',
    badgeType: 'Verified',
  },
  {
    id: 'tx-5',
    date: '5 hours ago',
    type: 'governance',
    typeLabel: 'Governance',
    amountUsd: '0.00',
    amountTrob: '0.00 TROB',
    isPositive: null,
    fromTitle: 'Governance Vote #41',
    fromAddress: '0x3E91...6B7F',
    status: 'Success',
    txHash: '0x1e...3b9f',
    fullTxHash: '0x1e3b9f8102938401928301928301928301923b9f',
    badgeType: 'Verified',
  },
  {
    id: 'tx-6',
    date: '2 days ago',
    type: 'council_seat',
    typeLabel: 'Council Seat',
    amountUsd: '+$300.00',
    amountTrob: '+1,977.10 TROB',
    isPositive: true,
    fromTitle: 'External Wallet',
    fromAddress: '0xFD81...9A2E',
    status: 'Success',
    txHash: '0x6d...8e91',
    fullTxHash: '0x6d8e918293019283019283019283019283018e91',
    badgeType: 'Verified',
  },
  {
    id: 'tx-7',
    date: '3 days ago',
    type: 'withdrawal',
    typeLabel: 'Withdrawal',
    amountUsd: '-$150.00',
    amountTrob: '-989.45 TROB',
    isPositive: false,
    fromTitle: 'Your Treasury',
    fromAddress: '0x8A3F...91F2',
    status: 'Success',
    txHash: '0x9f...2ad3',
    fullTxHash: '0x9f2ad38102938102938102938102938102932ad3',
    badgeType: 'Outgoing',
  },
];
