'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Info, DollarSign, TrendingUp, Sparkles, CheckCircle2, Users } from 'lucide-react';

interface QuickPreset {
  pos: number;
  label: string;
}

const PRESETS: QuickPreset[] = [
  { pos: 1, label: 'Seat #1 (Genesis)' },
  { pos: 2, label: 'Seat #2' },
  { pos: 3, label: 'Seat #3' },
  { pos: 10, label: 'Seat #10' },
  { pos: 50, label: 'Seat #50' },
  { pos: 100, label: 'Seat #100 (Final)' },
];

export const LandingSimulator: React.FC = () => {
  const [selectedPos, setSelectedPos] = useState<number>(2);

  const pos = Math.max(1, Math.min(100, selectedPos));
  const deposit = 300;
  const splitPerMember = Number((deposit / pos).toFixed(2));
  const cashbackToYou = splitPerMember;
  const netCost = Number((deposit - cashbackToYou).toFixed(2));
  const priorMembersCount = pos - 1;

  return (
    <section id="simulator" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
            <span className="text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
              Interactive 300 / N Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            300 / N Instant Cashback.<br />
            <span className="text-[#155EEF]">Equal Split to All Members.</span>
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-2xl mx-auto">
            When Member N deposits 300 TROB, the entire 300 TROB is split equally among all N active members.
            The depositing member receives 300 / N instant cashback, and all prior members each receive 300 / N pushed to their wallets.
          </p>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-5 sm:p-8 lg:p-12">
          {/* Top Bar inside Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 sm:pb-8 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
              <span className="text-xs sm:text-sm font-bold font-inter text-[#0B132B] tracking-wide uppercase">
                Interactive Seat Simulator (1 to 100)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
              <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider font-inter">
                Simulating Seat #{pos} of 100
              </span>
            </div>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="pt-6 sm:pt-8 flex flex-col items-center space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-inter">
              Select or test key queue positions:
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {PRESETS.map((preset) => {
                const isActive = pos === preset.pos;
                return (
                  <button
                    key={preset.pos}
                    type="button"
                    onClick={() => setSelectedPos(preset.pos)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#155EEF] text-white shadow-[0_4px_14px_rgba(21,94,239,0.35)] scale-105'
                        : 'bg-[#F1F5F9] text-[#475467] hover:bg-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Slider for smooth 1-100 exploration */}
            <div className="w-full max-w-lg pt-4 pb-2 px-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold font-inter text-slate-600">
                <span>Seat #1 (Genesis)</span>
                <span className="text-[#155EEF] font-black text-sm">Seat #{pos}</span>
                <span>Seat #100 (Final)</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={pos}
                onChange={(e) => setSelectedPos(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#155EEF]"
              />
            </div>
          </div>

          {/* 4 Output Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 pb-6">
            {/* Card 1: Deposit Entry */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#155EEF]">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] font-inter">
                Deposit Entry
              </div>
              <div className="text-2xl sm:text-3xl font-black font-sora text-[#0B132B] tracking-tight">
                300 <span className="text-sm font-normal text-slate-500">TROB</span>
              </div>
              <div className="text-[11px] text-[#64748B] font-inter">
                Fixed entry fee for all 100 council seats.
              </div>
            </div>

            {/* Card 2: Instant Cashback to You (300 / N) */}
            <div className="p-5 rounded-2xl bg-[#EFF8FF] border border-[#BFDBFE] space-y-2 relative overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#BFDBFE] flex items-center justify-center text-[#155EEF]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF] font-inter">
                Your Instant Cashback
              </div>
              <div className="text-2xl sm:text-3xl font-black font-sora text-[#155EEF] tracking-tight">
                +{cashbackToYou} <span className="text-sm font-normal text-[#155EEF]/80">TROB</span>
              </div>
              <div className="text-[11px] text-[#475467] font-inter">
                {pos === 1
                  ? '300 / 1 = 100% instant cashback ($0 net cost!)'
                  : `300 / ${pos} refunded in the exact same transaction block.`}
              </div>
            </div>

            {/* Card 3: Equal Split Per Member */}
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A] font-inter">
                Equal Split Per Member
              </div>
              <div className="text-2xl sm:text-3xl font-black font-sora text-[#16A34A] tracking-tight">
                {splitPerMember} <span className="text-sm font-normal text-emerald-600">TROB</span>
              </div>
              <div className="text-[11px] text-[#475467] font-inter">
                Pushed to all {pos} members (Seat 1 to #{pos}).
              </div>
            </div>

            {/* Card 4: Max Inflow (5X Cap) */}
            <div className="p-5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E9D5FF] flex items-center justify-center text-[#7E22CE]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7E22CE] font-inter">
                Max Inflow (5X Cap)
              </div>
              <div className="text-2xl sm:text-3xl font-black font-sora text-[#7E22CE] tracking-tight">
                1,500 <span className="text-sm font-normal text-purple-600">TROB</span>
              </div>
              <div className="text-[11px] text-[#475467] font-inter">
                5× cap on 300 TROB entry before 48h retopup.
              </div>
            </div>
          </div>

          {/* Mathematical Proof Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B132B] text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
              </div>
              <div>
                <div className="text-xs font-bold font-inter text-slate-300">
                  Mathematical Equilibrium Proof:
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-white">
                  300 TROB Entry = {pos} members × ({deposit} / {pos}) ≡ 300.00 TROB
                </div>
              </div>
            </div>

            <div className="text-xs font-medium text-emerald-400 font-inter bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
              100% P2P Pushed • 0 Platform Fee
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Info className="w-3.5 h-3.5 text-[#155EEF]" />
              <span>Soulbound NFT (#0001 to #0100) minted automatically upon entry.</span>
            </div>

            <Link
              href="/dao"
              className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_25px_rgba(21,94,239,0.4)] hover:shadow-[0_12px_30px_rgba(21,94,239,0.5)] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Claim Genesis Council Seat (300 TROB)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
