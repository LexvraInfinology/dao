import { calculateMemberEarnedUsd, calculateMemberCycleAndLifetime } from '@/utils/daoEconomics';
import { toTronHex, toTrobBase58 } from '@/utils/trobAddress';

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
  retopupDeadline?: string | null;
  currentCycleEarningsUsd?: number;
  lifetimeEarningsUsd?: number;
  retopupCount?: number;
  depositCount?: number;
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
  retopupDeadline?: string | null;
  retopupCount?: number;
}

/**
 * Checks whether a seat is vacant, defaulted, blank, or has an expired 48h retopup window.
 */
export function isSeatExpired(m?: RawMemberData): boolean {
  if (!m) return true;
  const st = (m.status || '').toLowerCase();
  if (st === 'blank' || st === 'defaulted' || st === 'vacant') return true;
  if ((st === 'capped' || st === 'underfunded') && m.retopupDeadline) {
    return new Date(m.retopupDeadline).getTime() <= Date.now();
  }
  return false;
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
    if (isSeatExpired(m)) {
      lowestVacantSeat = s;
      break;
    }
  }

  const nextAvailableSeat = lowestVacantSeat;
  const rawAddr = (activeAddress || '').trim().toLowerCase();
  const myHex = rawAddr ? toTronHex(rawAddr).toLowerCase() : '';
  const myB58 = rawAddr ? toTrobBase58(rawAddr).toLowerCase() : '';

  return Array.from({ length: 100 }, (_, index) => {
    const seatNumber = index + 1;
    const soulboundId = `#${String(seatNumber).padStart(4, '0')}`;
    const liveMember = memberMap.get(seatNumber);

    const isDefaulted = !!liveMember && isSeatExpired(liveMember);

    if (liveMember && !isDefaulted) {
      const memAddr = (liveMember.address || '').toLowerCase();
      const isMine =
        Boolean(rawAddr) &&
        (memAddr === rawAddr || (myHex && memAddr === myHex) || (myB58 && memAddr === myB58));
      const isCapped = liveMember.status === 'capped';
      const isUnderfunded = liveMember.status === 'underfunded';
      const entryTrob = liveMember.entryAmountTrob ?? liveMember.entryAmountBtt ?? 0;
      const fullRequiredTrob = bttPriceUsd > 0 ? Math.round((300 / bttPriceUsd) * 100) / 100 : 5357.14;
      const remainingTrob = isUnderfunded ? Math.max(0, Math.round((fullRequiredTrob - entryTrob) * 100) / 100) : 0;
      const pushedBtt = liveMember.pushedAmountBtt ?? 0;
      const retopupCount = liveMember.retopupCount ?? 0;
      const activeCount = members.filter((m) => m.status !== 'blank' && m.status !== 'defaulted' && m.status !== 'vacant').length || 93;

      const effectiveTrobPrice = bttPriceUsd > 0 ? bttPriceUsd : 0.056;
      const eco = calculateMemberCycleAndLifetime(
        seatNumber,
        liveMember.status,
        activeCount,
        retopupCount,
        pushedBtt,
        effectiveTrobPrice
      );

      const capPct = isCapped ? 100 : eco.currentCycleCapPct;
      const currentCycleEarningsUsd = isCapped ? 1500 : eco.currentCycleUsd;
      const lifetimeEarningsUsd = eco.lifetimeUsd;

      const addr = liveMember.address;
      const shortAddr =
        addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

      const cycleLabel = retopupCount > 0 ? ` (Cycle ${retopupCount + 1})` : '';

      return {
        seatNumber,
        status: isMine ? 'mine' : 'claimed',
        ownerAddress: isMine ? `${shortAddr} (You)` : shortAddr,
        currentCycleEarningsUsd,
        lifetimeEarningsUsd,
        retopupCount,
        depositCount: 1 + retopupCount,
        lifetimeEarnings: isUnderfunded
          ? '$0.00 USD'
          : isCapped
          ? '$1,500.00 USD'
          : `$${currentCycleEarningsUsd.toFixed(2)} USD`,
        capProgress: capPct,
        votingPower: '1.0%',
        statusText: isCapped
          ? '5X Capped • 48h Retopup Window Active'
          : isUnderfunded
          ? 'Underfunded Seat • Retopup Required'
          : `Active & In Good Standing${cycleLabel}`,
        statusBadge: isCapped
          ? '5X Capped'
          : isUnderfunded
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
        retopupDeadline: (isCapped || isUnderfunded) && liveMember.retopupDeadline ? String(liveMember.retopupDeadline) : null,
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
        entryAmount: '$300.00 USD (5,357.14 TROB)',
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
        statusText: 'Vacant Seat • Retopup Expired',
        statusBadge: 'Defaulted Vacancy',
        soulboundId,
        entryAmount: '$300.00 USD (5,357.14 TROB)',
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
