'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Info, DollarSign, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface QueueSlot {
  pos: number;
  status: 'filled' | 'next' | 'open';
}

const EXAMPLE_QUEUE: QueueSlot[] = [
  { pos: 1, status: 'filled' },
  { pos: 2, status: 'filled' },
  { pos: 3, status: 'filled' },
  { pos: 4, status: 'next' },
  { pos: 5, status: 'open' },
  { pos: 6, status: 'open' },
  { pos: 7, status: 'open' },
];

export const LandingSimulator: React.FC = () => {
  const [selectedPos, setSelectedPos] = useState<number>(4);

  return (
    <section id="simulator" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden border-b border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
            <span className="text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
              Interactive Queue Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            Your Seat Is Next.<br />
            <span className="text-[#155EEF]">Your Position Is Automatic.</span>
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-2xl mx-auto">
            Sequential smart contract allocation. Review the protocol position assignment model below.
          </p>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-5 sm:p-8 lg:p-12">
          {/* Top Bar inside Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 sm:pb-8 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
              <span className="text-xs sm:text-sm font-bold font-inter text-[#0B132B] tracking-wide uppercase">
                DAO Queue Assignment Example
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
              <span className="text-xs font-semibold text-[#155EEF] uppercase tracking-wider font-inter">
                Next Slot Assignment: #4
              </span>
            </div>
          </div>

          {/* Queue Selector Row showing 1-2-3 filled and position 4 as next */}
          <div className="py-8 sm:py-10 flex flex-col items-center">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 w-full overflow-x-auto py-4 px-2">
              {EXAMPLE_QUEUE.map((slot) => {
                const isSelected = slot.pos === selectedPos;
                const isPast = slot.status === 'filled';
                const isNext = slot.status === 'next';

                return (
                  <div key={slot.pos} className="relative flex flex-col items-center">
                    {/* Floating Pill above selected / next */}
                    {isNext && (
                      <div className="absolute -top-9 flex flex-col items-center animate-bounce">
                        <div className="px-2.5 py-0.5 rounded-full bg-[#155EEF] text-white text-[10px] font-bold tracking-wider uppercase shadow-md whitespace-nowrap">
                          Assigned to You
                        </div>
                        <div className="w-2 h-2 bg-[#155EEF] rotate-45 -mt-1" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedPos(slot.pos)}
                      className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                        isNext
                          ? 'bg-[#155EEF] text-white shadow-[0_8px_20px_rgba(21,94,239,0.35)] scale-105 z-10'
                          : isPast
                          ? 'bg-[#0B132B] text-white hover:bg-[#1E293B]'
                          : isSelected
                          ? 'bg-[#155EEF] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-bold font-sora">
                        {slot.pos}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-0.5">
                        {isNext ? 'Next' : isPast ? 'Filled' : 'Open'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-inter mt-2 text-center">
              Positions 1, 2, and 3 are filled in this example. Position 4 is next in line and immediately assigned.
            </div>
          </div>

          {/* 2 Output Cards ONLY per Requirement 7: Deposit Contribution $300 Trob + Max Inflow (Cap) $1,500 Trob */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-8">
            {/* Card 1: Deposit Contribution */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-2 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#155EEF] mb-2 mx-auto md:mx-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#155EEF] font-inter">
                Deposit Contribution
              </div>
              <div className="text-3xl sm:text-4xl font-black font-sora text-[#0B132B] tracking-tight">
                $300 <span className="text-lg font-normal text-slate-500">Trob</span>
              </div>
              <div className="text-xs text-[#64748B] font-inter">
                Uniform protocol entry contribution across all Genesis seats.
              </div>
            </div>

            {/* Card 2: Max Inflow (Cap) */}
            <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]/80 space-y-2 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#A7F3D0] flex items-center justify-center text-[#027A48] mb-2 mx-auto md:mx-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#027A48] font-inter">
                Max Inflow (Cap)
              </div>
              <div className="text-3xl sm:text-4xl font-black font-sora text-[#027A48] tracking-tight">
                $1,500 <span className="text-lg font-normal text-emerald-600">Trob</span>
              </div>
              <div className="text-xs text-[#475467] font-inter">
                500% baseline earnings cap on initial deposit with continuous dividend distributions.
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Info className="w-3.5 h-3.5 text-[#155EEF]" />
              <span>Council seats are allocated sequentially by the smart contract upon deposit.</span>
            </div>

            <Link
              href="/dao"
              className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_25px_rgba(21,94,239,0.4)] hover:shadow-[0_12px_30px_rgba(21,94,239,0.5)] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Join Genesis Council ($300 TROB)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
