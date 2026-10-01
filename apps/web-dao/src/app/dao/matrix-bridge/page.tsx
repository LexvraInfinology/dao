'use client';

import React, { useState } from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import MatrixCountdownCard from '@/components/dao/matrix/MatrixCountdownCard';
import MatrixFeatureCards from '@/components/dao/matrix/MatrixFeatureCards';
import MatrixTreeGraph from '@/components/dao/matrix/MatrixTreeGraph';
import { ProtocolPoolsCard } from '@/components/dao/matrix/ProtocolPoolsCard';
import { MatrixRegisterModal } from '@/components/dao/matrix/MatrixRegisterModal';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember } from '@/hooks/useApi';

export default function MatrixBridgePage() {
  const wallet = useWallet();
  const auth = useAuthContext();
  const { data: memberData } = useDaoMember(wallet.address || auth.user?.address || null);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isRootClaim, setIsRootClaim] = useState(false);

  const userSeat = memberData?.position ?? auth.user?.daoPosition ?? null;

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fadeIn font-sans py-2 sm:py-6 lg:py-8 max-w-5xl mx-auto w-full px-1">
      {/* Header Section (Centered) */}
      <div className="text-center flex flex-col items-center">
        {/* Status Pill Badge: COMING SOON / LIVE READY */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EFF6FF] border border-[#0E62E4]/25 mb-3 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E62E4] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#0E62E4]">
            RETAIL MATRIX BRIDGE
          </span>
        </div>

        {/* Main Heading: The Matrix Is Coming. */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-[#14304A] tracking-tight leading-tight">
          The <span className="text-[#0E62E4]">Matrix</span> Is Coming.
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#4F6D87] max-w-md sm:max-w-xl mx-auto leading-relaxed mt-2 px-2">
          The Retail Matrix will launch on Day 22, seamlessly connecting the Genesis DAO with the wider EQUORA_FI ecosystem.
        </p>
      </div>

      {/* ── Apex Opportunity Showcase: Granted to Last Member with Least Cashback (Frontend Presentation) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#EFF6FF] to-emerald-500/10 border-2 border-amber-300/70 shadow-sm font-sans space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Crown className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                  Algorithmic Balance
                </span>
                <span className="text-xs font-bold text-amber-900">
                  Last DAO Member Apex Root Allocation
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#14304A]">
                The Member with the Lowest Queue Cashback is Designated the Matrix Apex Owner!
              </h3>
              <p className="text-xs text-[#4F6D87] leading-relaxed max-w-2xl">
                Because early council seats receive higher immediate cashbacks (300/N), the Genesis protocol algorithmically designates the <strong>final DAO member</strong> (who received the lowest queue cashback) with prime opportunity to become the top <strong>Apex Root Leader</strong> of the entire Retail Matrix!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center pt-2 sm:pt-0">
            <button
              onClick={() => {
                setIsRootClaim(true);
                setRegisterModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Inspect Apex Eligibility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Countdown Card (with dynamic state transition to open matrix) */}
      <MatrixCountdownCard
        onRegisterClick={() => {
          setIsRootClaim(false);
          setRegisterModalOpen(true);
        }}
      />

      {/* 5 Feature Highlights (Desktop 5-col grid vs Mobile stacked) */}
      <MatrixFeatureCards />

      {/* 4 Automated Protocol Pools with 35% Instant Push to DAO */}
      <ProtocolPoolsCard />

      {/* Tree Graph Start Requirement Info Banner */}
      <div className="bg-white border border-[#E2EEF9] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-xs mt-0.5">
            2×
          </div>
          <div>
            <div className="font-bold text-[#14304A] text-xs sm:text-sm">
              Personal Tree Graph Eligibility
            </div>
            <p className="text-[11px] sm:text-xs text-[#4F6D87] mt-0.5 leading-relaxed max-w-2xl">
              Any member can join Slot 1 ($30). Your personal 14-node tree graph and downline spillover placements officially start once you complete <strong className="text-[#14304A]">2 direct referrals</strong> (Genesis Root Matrix Owner is automatically active as the top apex).
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/80 shrink-0 self-start sm:self-auto">
          <span>Active on 2 Directs</span>
        </div>
      </div>

      {/* 14-Node Visual Matrix Tree Graph */}
      <MatrixTreeGraph />

      {/* Matrix Registration Modal */}
      <MatrixRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        isRootLeaderClaim={isRootClaim}
        seatPosition={userSeat}
      />
    </div>
  );
}
