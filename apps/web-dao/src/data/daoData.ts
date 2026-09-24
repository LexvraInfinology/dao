import {
  DaoSeat,
  DaoProposal,
  DaoTransaction,
  MemberProfile,
} from '@/types';

export const CURRENT_USER: MemberProfile = {
  memberId: '#1042',
  walletAddress: '0x8A3F...91F2',
  seatNumber: 'Seat #86',
  votingPower: '1.0%',
  totalRewardsEarned: '$1,280.40',
  participationRate: '100%',
  status: 'Active Member',
  tier: 'Genesis Council',
  joinDate: 'Jan 12, 2025',
};

export const DAO_COUNCIL_STATS = {
  totalSeats: 100,
  claimedSeats: 86,
  remainingSeats: 14,
  seatPrice: '$300 TROB',
  phase: 'PHASE 1',
  countdown: { days: 18, hours: 14, minutes: 22, seconds: 10 },
  treasurySnapshot: '$300,000.00',
  dividendYield: '25% APY',
};

// Generate 100 Council Seats matching Desktop - 13
export const INITIAL_SEATS: DaoSeat[] = Array.from({ length: 100 }, (_, i) => {
  const seatNum = i + 1;
  const isMine = seatNum === 86;
  const isClaimed = seatNum <= 86;
  return {
    seatNumber: seatNum,
    status: isClaimed ? 'claimed' : 'open',
    owner: isMine
      ? '0x8A3F...91F2 (You)'
      : isClaimed
      ? `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`
      : 'Unclaimed',
    memberId: isClaimed ? `#${(1000 + seatNum).toString()}` : undefined,
    votingPower: '1.0%',
    joinedDate: isClaimed ? 'Jan 2025' : undefined,
  };
});

export const DAO_PROPOSALS: DaoProposal[] = [
  {
    id: 'eip-024',
    title: 'Allocate Treasury Funds for Ecosystem Growth & Liquidity',
    category: 'Treasury & Yield',
    status: 'Active',
    votesFor: 68,
    votesAgainst: 12,
    totalVotes: 80,
    quorum: '85% Quorum',
    endsIn: '3d 12h',
    proposer: '0x3F2A...B419',
    description:
      'Proposal to dynamically allocate $150,000 USD from DAO reserves toward bootstrapping liquidity incentives and security grants for early Matrix rank members.',
  },
  {
    id: 'eip-023',
    title: 'Deploy Cross-Chain Matrix Bridge to Arbitrum & Optimism',
    category: 'Ecosystem Bridge',
    status: 'Active',
    votesFor: 74,
    votesAgainst: 6,
    totalVotes: 80,
    quorum: '80% Quorum',
    endsIn: '4d 08h',
    proposer: '0x99A1...D7C2',
    description:
      'Expand EQUORA matrix smart contracts onto Layer 2 rollups to significantly reduce transaction fees for global participants and expand access.',
  },
  {
    id: 'eip-022',
    title: 'Genesis Council Multi-Sig Verification Threshold Upgrade',
    category: 'Security',
    status: 'Active',
    votesFor: 59,
    votesAgainst: 18,
    totalVotes: 77,
    quorum: '75% Quorum',
    endsIn: '6d 14h',
    proposer: '0x8A3F...91F2 (You)',
    description:
      'Enhance multi-signature threshold verification to require minimum 60% council quorum for any treasury withdrawal exceeding $50,000 USD.',
  },
];

export const PROPOSALS = DAO_PROPOSALS;

export const DAO_TRANSACTIONS: DaoTransaction[] = [
  {
    id: 'tx-01',
    hash: '0x7b4a...9f31',
    type: 'reward',
    amountUsd: 420.50,
    amountTrob: 2772.14,
    from: 'Treasury Vault',
    to: '0x8A3F...91F2 (You)',
    timestamp: '2 hours ago',
    status: 'Confirmed',
  },
  {
    id: 'tx-02',
    hash: '0x3c91...a1e0',
    type: 'vote',
    from: '0x8A3F...91F2 (You)',
    to: 'EIP-024 Contract',
    timestamp: '6 hours ago',
    status: 'Confirmed',
  },
  {
    id: 'tx-03',
    hash: '0x1d2e...55b4',
    type: 'seat_mint',
    amountUsd: 300.00,
    amountTrob: 1978.89,
    from: '0x55B1...29D1',
    to: 'Council Vault',
    timestamp: '14 hours ago',
    status: 'Confirmed',
  },
  {
    id: 'tx-04',
    hash: '0x88f2...cc19',
    type: 'reward',
    amountUsd: 296.55,
    amountTrob: 1956.13,
    from: 'Alpha Pool Contract',
    to: '0x8A3F...91F2 (You)',
    timestamp: '1 day ago',
    status: 'Confirmed',
  },
  {
    id: 'tx-05',
    hash: '0x99a4...1123',
    type: 'withdrawal',
    amountUsd: 150.00,
    amountTrob: 989.44,
    from: '0x8A3F...91F2 (You)',
    to: 'External Wallet',
    timestamp: '3 days ago',
    status: 'Confirmed',
  },
  {
    id: 'tx-06',
    hash: '0x44e1...009a',
    type: 'vote',
    from: '0x8A3F...91F2 (You)',
    to: 'EIP-021 Contract',
    timestamp: '5 days ago',
    status: 'Confirmed',
  },
];

export const TRANSACTIONS = DAO_TRANSACTIONS;

export const TREASURY_METRICS = {
  availableBalance: '$420.50',
  currency: 'USD',
  totalVaultAssets: '$3,420,890.00',
  dailyYieldAccrued: '+$142.30',
  unclaimedRewards: '$123.95',
  contractAddress: '0x3B99...77C1',
  network: 'TROBIUM L1',
};
