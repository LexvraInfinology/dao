'use client';

import React, { useState } from 'react';
import { Crown, ArrowRight, Layers, Sparkles, Users, Calendar, Zap, Lock } from 'lucide-react';
import MatrixCountdownCard from '@/components/dao/matrix/MatrixCountdownCard';
import MatrixTreeGraph from '@/components/dao/matrix/MatrixTreeGraph';
import { ProtocolPoolsCard } from '@/components/dao/matrix/ProtocolPoolsCard';
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember, useTrobPrice } from '@/hooks/useApi';

export default function MatrixBridgePage() {
  const wallet = useWallet();
  const auth = useAuthContext();
  const activeAddress = wallet.base58Address || wallet.hexAddress || auth.user?.address || null;
  const { data: memberData } = useDaoMember(activeAddress);
  const { data: price } = useTrobPrice(30_000);

  const [activeTab, setActiveTab] = useState<'tree' | 'pools'>('tree');

  const userSeat = memberData?.position ?? auth.user?.daoPosition ?? null;
  const trobForSlot1 = price && price.priceUsd > 0 ? Math.round(30 / price.priceUsd) : 536;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-7 animate-fadeIn font-sans py-2 sm:py-5 lg:py-6 max-w-5xl mx-auto w-full px-1">
      <UnderfundedAlertBanner />

      {/* ── Header Section (Crisp & Focused) ── */}
      <div className="text-center flex flex-col items-center">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#0E62E4]/25 mb-2.5 select-none shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E62E4] animate-pulse" />
          <span className="text-[10.5px] sm:text-xs font-bold tracking-wider uppercase text-[#0E62E4]">
            RETAIL MATRIX BRIDGE • DAY 22
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-bold text-[#14304A] tracking-tight leading-tight">
          The <span className="text-[#0E62E4]">Matrix</span> Is Coming.
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#4F6D87] max-w-md sm:max-w-xl mx-auto leading-relaxed mt-1.5 px-2">
          Connecting the Genesis DAO with the wider EQUORA_FI ecosystem upon Day 22 activation.
        </p>
      </div>

      {/* ── Algorithmic Apex Opportunity Card (Responsive, No Text Truncation) ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-amber-50/30 to-white border border-amber-300/80 shadow-xs font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
              <Crown className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9.5px] font-black uppercase tracking-wider">
                  Algorithmic Apex
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-950">
                  Final DAO Member Designated Matrix Apex Owner
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#526B88] leading-relaxed">
                Balances early cashbacks by designating the final council member as the Genesis Apex Root leader.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center pt-1 md:pt-0">
            <div className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 select-none">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Seat Reservations Paused Until Day 22</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Countdown Card ── */}
      <MatrixCountdownCard />

      {/* ── Key Protocol Specs (Clean 4-Card Overview, replaces cluttered cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 font-sans">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2EEF9] p-3 sm:p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#4F6D87] font-semibold uppercase tracking-wider">Slot 1 Entry</div>
            <div className="text-sm sm:text-base font-bold text-[#14304A] tracking-tight">$30 USD</div>
            <div className="text-[10px] text-slate-400 truncate">≈ {trobForSlot1} TROB</div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2EEF9] p-3 sm:p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0E62E4] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#4F6D87] font-semibold uppercase tracking-wider">DAO Share</div>
            <div className="text-sm sm:text-base font-bold text-[#0E62E4] tracking-tight">35% Instant</div>
            <div className="text-[10px] text-slate-400 truncate">To DAO Wallets</div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2EEF9] p-3 sm:p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Tree Start</div>
            <div className="text-sm sm:text-base font-bold text-[#14304A] tracking-tight">2 Directs</div>
            <div className="text-[10px] text-slate-400 truncate">Personal 14-node tree</div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2EEF9] p-3 sm:p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Launch Date</div>
            <div className="text-sm sm:text-base font-bold text-[#14304A] tracking-tight">Day 22</div>
            <div className="text-[10px] text-slate-400 truncate">Global activation</div>
          </div>
        </div>
      </div>

      {/* ── Segmented Protocol Explorer: 14-Node Tree vs 4 Value Pools ── */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-[#F0F4FA] border border-[#E2EEF9] shadow-2xs">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tree'
                  ? 'bg-white text-[#0E62E4] shadow-xs'
                  : 'text-[#4F6D87] hover:text-[#14304A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>14-Node Tree Architecture</span>
            </button>
            <button
              onClick={() => setActiveTab('pools')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pools'
                  ? 'bg-white text-[#0E62E4] shadow-xs'
                  : 'text-[#4F6D87] hover:text-[#14304A]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>4 Protocol Pools (35% DAO)</span>
            </button>
          </div>
        </div>

        {activeTab === 'tree' ? (
          <div className="animate-fadeIn">
            <MatrixTreeGraph />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <ProtocolPoolsCard />
          </div>
        )}
      </div>
    </div>
  );
}
