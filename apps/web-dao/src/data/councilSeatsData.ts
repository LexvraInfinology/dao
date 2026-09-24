export type SeatStatus = 'claimed' | 'mine' | 'next' | 'defaulted' | 'locked';

export interface CouncilSeatDetail {
  seatNumber: number;
  status: SeatStatus;
  ownerAddress: string;
  lifetimeEarnings: string;
  capProgress: number; // percentage e.g. 85.3
  votingPower: string;
  statusText: string;
  statusBadge: 'Active Member' | 'Defaulted Vacancy' | 'Next Available' | 'Locked Future';
  soulboundId: string;
  entryAmount?: string;
  claimedDate?: string;
}

export interface CouncilActivityItem {
  id: string;
  timeAgo: string;
  title: string;
  seatNumber: number;
  type: 'claimed' | 'defaulted' | 'earnings';
}

export const COUNCIL_ACTIVITIES: CouncilActivityItem[] = [
  {
    id: 'act-1',
    timeAgo: '2m ago',
    title: 'Seat Claimed',
    seatNumber: 86,
    type: 'claimed',
  },
  {
    id: 'act-2',
    timeAgo: '12m ago',
    title: 'Seat #23 Defaulted',
    seatNumber: 23,
    type: 'defaulted',
  },
  {
    id: 'act-3',
    timeAgo: '28m ago',
    title: 'Seat Claimed',
    seatNumber: 85,
    type: 'claimed',
  },
  {
    id: 'act-4',
    timeAgo: '1h ago',
    title: 'Earnings Claimed',
    seatNumber: 12,
    type: 'earnings',
  },
];

// Generate exact 100 seats matching Figma:
// Seat 12 = Your Seat (Green)
// Seats 23, 44, 46 = Defaulted Vacancy (Red Dashed)
// Seat 87 = Next Available (Blue Active)
// Seats 88-100 = Locked Future (Gray with Lock)
// All others 1-86 = Claimed (Blue)
export const COUNCIL_SEATS_LIST: CouncilSeatDetail[] = Array.from({ length: 100 }, (_, index) => {
  const seatNumber = index + 1;
  const soulboundId = `#${String(seatNumber).padStart(4, '0')}`;

  if (seatNumber === 12) {
    return {
      seatNumber: 12,
      status: 'mine',
      ownerAddress: '0x4B71...89F2',
      lifetimeEarnings: '$1,280.40 TROB',
      capProgress: 85.3,
      votingPower: '1.0%',
      statusText: 'Active & In Good Standing',
      statusBadge: 'Active Member',
      soulboundId: '#0012',
      entryAmount: '$300 TROB',
      claimedDate: 'Oct 14, 2025',
    };
  }

  if (seatNumber === 23 || seatNumber === 44 || seatNumber === 46) {
    return {
      seatNumber,
      status: 'defaulted',
      ownerAddress: '0x0000...VACANT',
      lifetimeEarnings: '$0.00 TROB',
      capProgress: 0,
      votingPower: '1.0%',
      statusText: 'Defaulted Vacancy • Open for Takeover',
      statusBadge: 'Defaulted Vacancy',
      soulboundId,
      entryAmount: '$300 TROB',
    };
  }

  if (seatNumber === 87) {
    return {
      seatNumber: 87,
      status: 'next',
      ownerAddress: '0x8A3F...91F2 (You are next)',
      lifetimeEarnings: '$0.00 TROB',
      capProgress: 0,
      votingPower: '1.0%',
      statusText: 'Next in Queue • Ready for Instant Mint',
      statusBadge: 'Next Available',
      soulboundId: '#0087',
      entryAmount: '$300 TROB',
    };
  }

  if (seatNumber >= 88) {
    return {
      seatNumber,
      status: 'locked',
      ownerAddress: '0x0000...LOCKED',
      lifetimeEarnings: '$0.00 TROB',
      capProgress: 0,
      votingPower: '1.0%',
      statusText: 'Locked • Unlocks upon previous seat claim',
      statusBadge: 'Locked Future',
      soulboundId,
    };
  }

  // Claimed seats (1 to 86)
  const randomHex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase();
  const earningsVal = (650 + seatNumber * 12.3).toFixed(2);
  const cap = Math.min(100, Math.round(30 + (seatNumber % 60) * 1.1));

  return {
    seatNumber,
    status: 'claimed',
    ownerAddress: `0x${randomHex.slice(0, 4)}...${randomHex.slice(4)}`,
    lifetimeEarnings: `$${earningsVal} TROB`,
    capProgress: cap,
    votingPower: '1.0%',
    statusText: 'Active & In Good Standing',
    statusBadge: 'Active Member',
    soulboundId,
    entryAmount: '$300 TROB',
  };
});
