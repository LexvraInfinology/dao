'use client';

import React, { useState } from 'react';
import { CouncilSeatsHero } from '@/components/dao/seats/CouncilSeatsHero';
import { CouncilStatCards } from '@/components/dao/seats/CouncilStatCards';
import { CouncilGrid } from '@/components/dao/seats/CouncilGrid';
import { SeatInspector } from '@/components/dao/seats/SeatInspector';
import { CouncilAboutCard } from '@/components/dao/seats/CouncilAboutCard';
import { CouncilRecentActivity } from '@/components/dao/seats/CouncilRecentActivity';
import {
  COUNCIL_SEATS_LIST,
  CouncilSeatDetail,
} from '@/data/councilSeatsData';
import { Check } from 'lucide-react';

export default function CouncilSeatsPage() {
  const [seats, setSeats] = useState<CouncilSeatDetail[]>(COUNCIL_SEATS_LIST);
  // Default selected seat is #12 (Your Seat) matching both Desktop & Mobile Figma mockups!
  const [selectedSeat, setSelectedSeat] = useState<CouncilSeatDetail>(
    COUNCIL_SEATS_LIST.find((s) => s.seatNumber === 12) || COUNCIL_SEATS_LIST[0]
  );
  const [mintNotification, setMintNotification] = useState<string | null>(null);

  const handleSelectSeat = (seat: CouncilSeatDetail) => {
    setSelectedSeat(seat);
  };

  const handleMintSeat = (seatNumber: number) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.seatNumber === seatNumber
          ? {
              ...s,
              status: 'mine',
              ownerAddress: '0x8A3F...91F2 (You)',
              statusText: 'Active & In Good Standing',
              statusBadge: 'Active Member',
              lifetimeEarnings: '$0.00 TROB',
              capProgress: 0,
            }
          : s
      )
    );

    setSelectedSeat((prev) => ({
      ...prev,
      status: 'mine',
      ownerAddress: '0x8A3F...91F2 (You)',
      statusText: 'Active & In Good Standing',
      statusBadge: 'Active Member',
      lifetimeEarnings: '$0.00 TROB',
      capProgress: 0,
    }));

    setMintNotification(`Council Seat #${seatNumber} successfully claimed!`);
    setTimeout(() => setMintNotification(null), 3500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section matching Desktop - 13 & Mobile Designs */}
      <CouncilSeatsHero />

      {/* 2. Stat Cards (4-col grid on desktop, horizontal scroll on mobile) */}
      <CouncilStatCards />

      {/* 3. Main Grid & Seat Inspector Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 100-Seat Council Grid (8 cols on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <CouncilGrid
            seats={seats}
            selectedSeat={selectedSeat}
            onSelectSeat={handleSelectSeat}
          />

          {/* On Desktop, optionally show Recent Activity below Grid or in right col */}
          <div className="hidden lg:block">
            <CouncilRecentActivity />
          </div>
        </div>

        {/* Right Column: Seat Inspector + About Council Seats (4 cols on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Minting Success Notification Toast */}
          {mintNotification && (
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#047857] font-semibold flex items-center gap-2.5 shadow-sm animate-fadeIn">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{mintNotification}</span>
            </div>
          )}

          {/* Seat Inspector Component */}
          <SeatInspector
            seat={selectedSeat}
            onMintSeat={handleMintSeat}
          />

          {/* About Council Seats Card (Desktop Mockup) */}
          <CouncilAboutCard />

          {/* Recent Activity Card (Shown on Mobile directly below Inspector) */}
          <div className="lg:hidden">
            <CouncilRecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
