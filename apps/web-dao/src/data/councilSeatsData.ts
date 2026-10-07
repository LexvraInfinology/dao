import { calculateMemberEarnedUsd } from '@/utils/daoEconomics';

export type SeatStatus = 'claimed' | 'mine' | 'next' | 'defaulted' | 'locked';

export interface CouncilSeatDetail {
  seatNumber: number;
  status: SeatStatus;
  ownerAddress: string;
  lifetimeEarnings: string;
  capProgress: number; // percentage e.g. 85.3
  votingPower: string;
  statusText: string;
  statusBadge: 'Active Member' | '5X Capped' | 'Defaulted Vacancy' | 'Next Available' | 'Locked Future' | 'Underfunded';
  soulboundId: string;
  entryAmount?: string;
  claimedDate?: string;
  alreadyPaidTrob?: number;
  remainingTrob?: number;
}

export interface CouncilActivityItem {
  id: string;
  timeAgo: string;
  title: string;
  seatNumber: number;
  type: 'claimed' | 'defaulted' | 'earnings';
}

export interface RawMemberData {
  position: number;
  address: string;
  nftTokenId?: number;
  entryAmountBtt?: number;
  entryAmountTrob?: number;
  pushedAmountBtt?: number;
  pushedAmountUsdEstimate?: number;
  status?: string;
  joinedAt?: string;
}

/**
 * Dynamically builds the exact 100 sovereign seats from live database / on-chain members.
 * No random hex strings or hardcoded mock accounts.
 */
export function buildLiveCouncilSeats(
  members: RawMemberData[] = [],
  activeAddress?: string | null,
  bttPriceUsd = 0
): CouncilSeatDetail[] {
  const memberMap = new Map<number, RawMemberData>();
  for (const m of members) {
    memberMap.set(m.position, m);
  }

  // Sequential scan from Seat 1 to 100: identify lowest vacant/blank/expired seat
  let lowestVacantSeat: number | null = null;
  for (let s = 1; s <= 100; s++) {
    const m = memberMap.get(s);
    if (!m || m.status === 'blank' || m.status === 'defaulted' || m.status === 'vacant') {
      lowestVacantSeat = s;
      break;
    }
  }

  const nextAvailableSeat = lowestVacantSeat;
  const canonicalMyAddress = activeAddress?.toLowerCase() ?? '';

  return Array.from({ length: 100 }, (_, index) => {
    const seatNumber = index + 1;
    const soulboundId = `#${String(seatNumber).padStart(4, '0')}`;
    const liveMember = memberMap.get(seatNumber);

    const isDefaulted = !!liveMember && (liveMember.status === 'blank' || liveMember.status === 'defaulted' || liveMember.status === 'vacant');

    if (liveMember && !isDefaulted) {
      const isMine =
        !!canonicalMyAddress &&
        liveMember.address.toLowerCase() === canonicalMyAddress;
      const isCapped = liveMember.status === 'capped';
      const isUnderfunded = liveMember.status === 'underfunded';
      const entryTrob = liveMember.entryAmountTrob ?? liveMember.entryAmountBtt ?? 0;
      const effectiveTrobPrice = bttPriceUsd > 0 ? bttPriceUsd : 0.056;
      const fullRequiredTrob = Math.round((300 / effectiveTrobPrice) * 100) / 100;
      const remainingTrob = isUnderfunded ? Math.max(0, Math.round((fullRequiredTrob - entryTrob) * 100) / 100) : 0;
      const pushedBtt = liveMember.pushedAmountBtt ?? 0;
      const exactEarnedUsd = calculateMemberEarnedUsd(seatNumber, liveMember.status, 93);
      const earningsUsd = isUnderfunded ? 0 : isCapped ? 1500 : (exactEarnedUsd > 0 ? exactEarnedUsd : (liveMember.pushedAmountUsdEstimate ?? 0));
      const capPct = isUnderfunded ? 0 : isCapped ? 100 : Math.min(100, Math.round((earningsUsd / 1500) * 100));

      const addr = liveMember.address;
      const shortAddr =
        addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

      const liveTrob = isUnderfunded ? 0 : isCapped
        ? Math.max(pushedBtt, 27530)
        : (pushedBtt > 0 ? pushedBtt : (bttPriceUsd > 0 ? (earningsUsd / bttPriceUsd) : 0));

      return {
        seatNumber,
        status: isMine ? 'mine' : 'claimed',
        ownerAddress: isMine ? `${shortAddr} (You)` : shortAddr,
        lifetimeEarnings: isUnderfunded
          ? '$0.00 USD'
          : isCapped
          ? `$1,500.00 USD (≈ ${Math.round(liveTrob).toLocaleString()} TROB)`
          : liveTrob > 0
          ? `$${earningsUsd.toFixed(2)} USD (≈ ${Math.round(liveTrob).toLocaleString()} TROB)`
          : `$${earningsUsd.toFixed(2)} USD`,
        capProgress: capPct,
        votingPower: '1.0%',
        statusText: liveMember.status === 'capped'
          ? '5X Capped • 48h Retopup Window Active'
          : liveMember.status === 'underfunded'
          ? 'Underfunded Seat • Retopup Required'
          : liveMember.status === 'active'
          ? 'Active & In Good Standing'
          : liveMember.status ?? 'Active Member',
        statusBadge: liveMember.status === 'capped'
          ? '5X Capped'
          : liveMember.status === 'underfunded'
          ? 'Underfunded'
          : 'Active Member',
        soulboundId,
        alreadyPaidTrob: entryTrob,
        remainingTrob,
        claimedDate: liveMember.joinedAt
          ? new Date(liveMember.joinedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Genesis',
      };
    }

    if (seatNumber === nextAvailableSeat) {
      return {
        seatNumber,
        status: 'next',
        ownerAddress: isDefaulted ? 'Vacant Seat (Priority Takeover)' : 'Available for Claim',
        lifetimeEarnings: '$0.00 USD',
        capProgress: 0,
        votingPower: '1.0%',
        statusText: isDefaulted
          ? 'Priority Vacant Seat • Ready for Instant Takeover'
          : 'Next in Queue • Ready for Instant Mint',
        statusBadge: isDefaulted ? 'Defaulted Vacancy' : 'Next Available',
        soulboundId,
        entryAmount: `$300 USD (≈ ${Math.round(300 / (bttPriceUsd > 0 ? bttPriceUsd : 0.056)).toLocaleString()} TROB)`,
      };
    }

    if (isDefaulted) {
      return {
        seatNumber,
        status: 'defaulted',
        ownerAddress: 'Vacant Seat (Open for Claim)',
        lifetimeEarnings: '$0.00 USD',
        capProgress: 0,
        votingPower: '1.0%',
        statusText: 'Vacant Seat • 48h Retopup Expired',
        statusBadge: 'Defaulted Vacancy',
        soulboundId,
        entryAmount: `$300 USD (≈ ${Math.round(300 / (bttPriceUsd > 0 ? bttPriceUsd : 0.056)).toLocaleString()} TROB)`,
      };
    }

    // Locked seats (seatNumber > nextAvailableSeat)
    return {
      seatNumber,
      status: 'locked',
      ownerAddress: 'Locked',
      lifetimeEarnings: '$0.00 USD',
      capProgress: 0,
      votingPower: '1.0%',
      statusText: `Locked • Unlocks after Seat #${lowestVacantSeat || seatNumber - 1} claimed`,
      statusBadge: 'Locked Future',
      soulboundId,
    };
  });
}

// Fallback baseline 100-seat scaffold where Seat #1 is next and all others are locked.
// Zero fake members or random hex addresses.
export const COUNCIL_SEATS_LIST: CouncilSeatDetail[] = buildLiveCouncilSeats([], null, 0);

export const COUNCIL_ACTIVITIES: CouncilActivityItem[] = [];
