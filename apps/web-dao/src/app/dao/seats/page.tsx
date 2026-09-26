'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CouncilSeatsHero } from '@/components/dao/seats/CouncilSeatsHero';
import { CouncilStatCards } from '@/components/dao/seats/CouncilStatCards';
import { CouncilGrid } from '@/components/dao/seats/CouncilGrid';
import { SeatInspector } from '@/components/dao/seats/SeatInspector';
import { CouncilAboutCard } from '@/components/dao/seats/CouncilAboutCard';
import { CouncilRecentActivity } from '@/components/dao/seats/CouncilRecentActivity';
import {
  buildLiveCouncilSeats,
  type CouncilSeatDetail,
  type RawMemberData,
} from '@/data/councilSeatsData';
import { useApi, useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { Check, Loader2 } from 'lucide-react';

interface ApiMembersPayload {
  members: RawMemberData[];
  total: number;
  bttPriceUsd: number;
}

export default function CouncilSeatsPage() {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const activeAddress = wallet.base58Address || wallet.hexAddress;

  const { data: price } = useTrobPrice(30_000);
  const { data: memberData, refetch: refetchMember } = useDaoMember(activeAddress);

  // Fetch all 100 members from live backend API
  const { data: membersPayload, loading: membersLoading, refetch: refetchMembers } =
    useApi<ApiMembersPayload>('/api/dao/members?page=1&limit=100');

  const [notification, setNotification] = useState<string | null>(null);
  const [minting, setMinting]           = useState(false);
  const [mintErr, setMintErr]           = useState<string | null>(null);

  // Dynamically build the 100 seats array from live data
  const seats: CouncilSeatDetail[] = useMemo(() => {
    const rawMembers = membersPayload?.members ?? [];
    const bttPrice = membersPayload?.bttPriceUsd ?? price?.priceUsd ?? 0;
    return buildLiveCouncilSeats(rawMembers, activeAddress, bttPrice);
  }, [membersPayload, activeAddress, price?.priceUsd]);

  // Default selected seat: user's own seat → or next available → or first seat
  const mySeatNumber = memberData?.position ?? auth.user?.daoPosition ?? null;

  const defaultSeat = useMemo(() => {
    if (mySeatNumber) {
      const foundMine = seats.find((s) => s.seatNumber === mySeatNumber);
      if (foundMine) return foundMine;
    }
    const next = seats.find((s) => s.status === 'next');
    return next ?? seats[0];
  }, [seats, mySeatNumber]);

  const [selectedSeat, setSelectedSeat] = useState<CouncilSeatDetail>(defaultSeat);

  // Sync selectedSeat when defaultSeat updates on data arrival
  useEffect(() => {
    setSelectedSeat((prev) => {
      const updated = seats.find((s) => s.seatNumber === prev.seatNumber);
      return updated ?? defaultSeat;
    });
  }, [seats, defaultSeat]);

  // ── Mint / claim seat ─────────────────────────────────────────────────────
  const handleMintSeat = async (seatNumber: number) => {
    if (!wallet.isConnected || !price) {
      setMintErr('Please connect your TrobSafe wallet first.');
      return;
    }
    if (memberData?.isMember) {
      setMintErr(`You already own Council Seat #${memberData.position}. Limit 1 seat per wallet.`);
      return;
    }

    setMintErr(null);
    setMinting(true);

    const callValueSun = Math.ceil(price.seatEntryTrob * 1_000_000);
    const daoAddress   = process.env.NEXT_PUBLIC_DAO_ADDRESS ?? '';
    const activeAddr   = wallet.base58Address ?? wallet.hexAddress ?? '';

    try {
      let txId: string | null = null;

      // 1. On-chain call if contract configured
      if (
        daoAddress &&
        daoAddress !== '0x0000000000000000000000000000000000000000' &&
        daoAddress.length > 10
      ) {
        try {
          const result = await wallet.callContract({
            contract_address:  daoAddress,
            function_selector: 'joinDAO()',
            parameter:         '',
            call_value:        callValueSun,
            fee_limit:         100_000_000,
            owner_address:     activeAddr,
          });

          if (result?.result && result.txid) {
            txId = result.txid;
          }
        } catch (onChainErr: unknown) {
          console.warn('[CouncilSeatsPage] On-chain broadcast note:', onChainErr);
        }
      }

      // 2. Synchronize database via API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/dao/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddr, txHash: txId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to register membership.');
      }

      const assignedPosition = data.data?.position ?? seatNumber;
      const cashbackReceived = data.data?.instantCashbackBtt ?? (300 / assignedPosition).toFixed(2);
      setNotification(`🎉 Council Seat #${assignedPosition} claimed! Instant cashback of +$${cashbackReceived} TROB credited directly to your balance. ${txId ? `(Tx: ${txId.slice(0, 10)}…)` : ''}`);
      await Promise.all([refetchMembers(), refetchMember()]);
      setTimeout(() => setNotification(null), 8000);
    } catch (err: unknown) {
      setMintErr(err instanceof Error ? err.message : 'Claim failed.');
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
          <span>Syncing live seat state from database…</span>
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
            onMintSeat={minting || memberData?.isMember ? undefined : handleMintSeat}
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
