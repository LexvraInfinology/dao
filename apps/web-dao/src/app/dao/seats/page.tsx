'use client';

import React, { useState, useMemo } from 'react';
import { CouncilSeatsHero } from '@/components/dao/seats/CouncilSeatsHero';
import { CouncilStatCards } from '@/components/dao/seats/CouncilStatCards';
import { CouncilGrid } from '@/components/dao/seats/CouncilGrid';
import { SeatInspector } from '@/components/dao/seats/SeatInspector';
import { CouncilAboutCard } from '@/components/dao/seats/CouncilAboutCard';
import { CouncilRecentActivity } from '@/components/dao/seats/CouncilRecentActivity';
import { COUNCIL_SEATS_LIST, type CouncilSeatDetail } from '@/data/councilSeatsData';
import { useApi } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useTrobPrice } from '@/hooks/useApi';
import { Check, Loader2 } from 'lucide-react';

// ─── API member shape ─────────────────────────────────────────────────────────
interface ApiMember {
  position: number;
  address: string;
  nftTokenId: number;
  pushedAmountBtt: number;
  pushedAmountUsdEstimate: number;
  status: string;
  joinedAt: string;
  txHash: string;
}
interface ApiMembersPayload {
  members: ApiMember[];
  total: number;
  bttPriceUsd: number;
}

// ─── Map live member → CouncilSeatDetail ──────────────────────────────────────
function mapMemberToSeat(
  m: ApiMember,
  myAddress: string | null,
  bttPriceUsd: number
): CouncilSeatDetail {
  const isMine         = !!myAddress && m.address.toLowerCase() === myAddress.toLowerCase();
  const earningsCapBtt = 900;
  const capPct         = Math.min(100, Math.round((m.pushedAmountBtt / earningsCapBtt) * 100));
  const earningsUsd    = m.pushedAmountUsdEstimate;

  const shortAddr = m.address.length > 10
    ? `${m.address.slice(0, 6)}…${m.address.slice(-4)}`
    : m.address;

  return {
    seatNumber:     m.position,
    status:         isMine ? 'mine' : 'claimed',
    ownerAddress:   isMine ? `${shortAddr} (You)` : shortAddr,
    lifetimeEarnings: `$${earningsUsd.toFixed(2)} TROB`,
    capProgress:    capPct,
    votingPower:    '1.0%',
    statusText:     m.status === 'active' ? 'Active & In Good Standing' : m.status,
    statusBadge:    'Active Member',
    soulboundId:    `#${String(m.position).padStart(4, '0')}`,
    entryAmount:    '$300 TROB',
    claimedDate:    new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CouncilSeatsPage() {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const { data: price } = useTrobPrice(30_000);

  // Fetch all 100 members from API
  const { data: membersPayload, loading: membersLoading } =
    useApi<ApiMembersPayload>('/api/dao/members?page=1&limit=100');

  const [notification, setNotification] = useState<string | null>(null);
  const [minting, setMinting]           = useState(false);
  const [mintErr, setMintErr]           = useState<string | null>(null);

  // Build seat list: overlay API members on top of the static 100-seat scaffold
  const seats: CouncilSeatDetail[] = useMemo(() => {
    if (!membersPayload?.members?.length) return COUNCIL_SEATS_LIST;

    const apiSeats = new Map<number, CouncilSeatDetail>();
    const bttPrice = membersPayload.bttPriceUsd ?? 1;
    const activeAddress = wallet.base58Address || wallet.hexAddress;

    for (const m of membersPayload.members) {
      apiSeats.set(m.position, mapMemberToSeat(m, activeAddress, bttPrice));
    }

    return COUNCIL_SEATS_LIST.map((staticSeat) => {
      const live = apiSeats.get(staticSeat.seatNumber);
      if (live) return live;
      return staticSeat;
    });
  }, [membersPayload, wallet.base58Address, wallet.hexAddress]);

  // Default selected seat: user's own seat → or next available → or first
  const defaultSeat = useMemo(() => {
    if (auth.user?.daoPosition) return seats.find((s) => s.seatNumber === auth.user!.daoPosition) ?? seats[0];
    const next = seats.find((s) => s.status === 'next');
    return next ?? seats[0];
  }, [seats, auth.user]);

  const [selectedSeat, setSelectedSeat] = useState<CouncilSeatDetail>(defaultSeat);

  // ── Mint / claim seat ─────────────────────────────────────────────────────
  const handleMintSeat = async (seatNumber: number) => {
    if (!wallet.isConnected || !price) return;
    setMintErr(null);
    setMinting(true);

    const callValueSun = Math.ceil(price.seatEntryTrob * 1_000_000);
    const daoAddress   = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';

    try {
      const result = await wallet.callContract({
        contract_address:  daoAddress,
        function_selector: 'joinDAO()',
        parameter:         '',
        call_value:        callValueSun,
        fee_limit:         100_000_000,
        owner_address:     wallet.base58Address ?? wallet.hexAddress ?? '',
      });

      if (!result.result) throw new Error('Transaction rejected.');

      setNotification(`Council Seat #${seatNumber} claimed! TX: ${result.txid.slice(0, 12)}…`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: unknown) {
      setMintErr(err instanceof Error ? err.message : 'Transaction failed.');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      <CouncilSeatsHero />

      <CouncilStatCards />

      {/* Loading overlay */}
      {membersLoading && (
        <div className="flex items-center gap-2 text-xs text-[#60739A] font-jakarta">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#155EEF]" />
          <span>Loading live seat data…</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Council Grid */}
        <div className="lg:col-span-8 space-y-6">
          <CouncilGrid
            seats={seats}
            selectedSeat={selectedSeat}
            onSelectSeat={setSelectedSeat}
          />
          <div className="hidden lg:block">
            <CouncilRecentActivity />
          </div>
        </div>

        {/* Right: Inspector + About */}
        <div className="lg:col-span-4 space-y-6">
          {/* Success notification */}
          {notification && (
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#047857] font-semibold flex items-center gap-2.5 shadow-sm animate-fadeIn">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              {notification}
            </div>
          )}

          {/* Mint error */}
          {mintErr && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {mintErr}
            </div>
          )}

          <SeatInspector
            seat={selectedSeat}
            onMintSeat={minting ? undefined : handleMintSeat}
          />
          <CouncilAboutCard />

          <div className="lg:hidden">
            <CouncilRecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
