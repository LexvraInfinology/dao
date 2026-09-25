'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Info, DollarSign, RotateCcw, Wallet } from 'lucide-react';

export const LandingSimulator: React.FC = () => {
  const [selectedSeat, setSelectedSeat] = useState<number>(87);

  // Available seats around selected
  const seatsRange = [84, 85, 86, 87, 88, 89, 90];

  const handlePrev = () => {
    if (selectedSeat > 1) setSelectedSeat((prev) => prev - 1);
  };

  const handleNext = () => {
    if (selectedSeat < 100) setSelectedSeat((prev) => prev + 1);
  };

  const grossDeposit = 300;
  const instantCashback = (300 / selectedSeat).toFixed(2);
  const netOutPocket = (300 - 300 / selectedSeat).toFixed(2);

  return (
    <section id="simulator" className="py-20 lg:py-28 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EFF8FF] border border-[#D1E9FF]">
            <span className="text-[12px] font-semibold tracking-wider text-[#155EEF] font-inter uppercase">
              Interactive Simulator
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold font-inter text-[#0B132B] leading-[1.12] tracking-tight">
            Your Seat Is Next.<br />
            <span className="text-[#155EEF]">Your Position Is Automatic.</span>
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#475467] leading-relaxed font-inter max-w-2xl mx-auto">
            Select your target queue position below to calculate your instant cashback and net entry cost.
          </p>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-6 sm:p-10 lg:p-12">
          {/* Top Bar inside Box */}
          <div className="flex items-center justify-between pb-8 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
              <span className="text-xs sm:text-sm font-bold font-inter text-[#0B132B] tracking-wide">
                CURRENT QUEUE: 71 / 100
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-ping" />
              <span className="text-xs font-semibold text-[#027A48] uppercase tracking-wider font-inter">
                Live Protocol Data
              </span>
            </div>
          </div>

          {/* Queue Selector Row */}
          <div className="py-10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full overflow-x-auto py-4">
              <button
                onClick={handlePrev}
                disabled={selectedSeat <= 1}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 flex items-center justify-center text-[#475467] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Previous Seat"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {seatsRange.map((seatNum) => {
                const isSelected = seatNum === selectedSeat;
                const isPast = seatNum < selectedSeat;

                return (
                  <div key={seatNum} className="relative flex flex-col items-center">
                    {/* Floating Pill above selected */}
                    {isSelected && (
                      <div className="absolute -top-9 flex flex-col items-center animate-bounce">
                        <div className="px-2.5 py-0.5 rounded-full bg-[#155EEF] text-white text-[10px] font-bold tracking-wider uppercase shadow-md">
                          You Are Here
                        </div>
                        <div className="w-2 h-2 bg-[#155EEF] rotate-45 -mt-1" />
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedSeat(seatNum)}
                      className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#155EEF] text-white shadow-[0_8px_20px_rgba(21,94,239,0.35)] scale-105 z-10'
                          : isPast
                          ? 'bg-[#0B132B] text-white hover:bg-[#1E293B]'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-bold font-sora">
                        {seatNum}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                          Next
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}

              <button
                onClick={handleNext}
                disabled={selectedSeat >= 100}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 flex items-center justify-center text-[#475467] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Next Seat"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3 Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 pb-8">
            {/* Card 1: Gross */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1 text-center md:text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#155EEF] mb-3 mx-auto md:mx-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-sora text-[#0B132B] tracking-tight">
                ${grossDeposit} <span className="text-base font-normal text-slate-500">TROB</span>
              </div>
              <div className="text-xs font-semibold text-[#0B132B] font-inter">
                Gross Deposit
              </div>
              <div className="text-[11px] text-[#64748B]">
                Fixed Protocol Entry
              </div>
            </div>

            {/* Card 2: Instant Cashback */}
            <div className="p-5 rounded-2xl bg-[#EFF8FF] border border-[#D1E9FF] space-y-1 text-center md:text-left">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#D1E9FF] flex items-center justify-center text-[#155EEF] mb-3 mx-auto md:mx-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-sora text-[#155EEF] tracking-tight">
                ${instantCashback} <span className="text-base font-normal text-blue-400">TROB</span>
              </div>
              <div className="text-xs font-semibold text-[#155EEF] font-inter">
                Instant Cashback ($300/{selectedSeat})
              </div>
              <div className="text-[11px] text-[#475467]">
                Returned immediately to wallet
              </div>
            </div>

            {/* Card 3: Total In-Flow */}
            <div className="p-5 rounded-2xl bg-[#ECFDF3] border border-[#D1FADF] space-y-1 text-center md:text-left">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#D1FADF] flex items-center justify-center text-[#027A48] mb-3 mx-auto md:mx-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-sora text-[#027A48] tracking-tight">
                ${netOutPocket} <span className="text-base font-normal text-emerald-500">TROB</span>
              </div>
              <div className="text-xs font-semibold text-[#027A48] font-inter">
                Total In-Flow
              </div>
              <div className="text-[11px] text-[#475467]">
                Actual capital deployed
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Info className="w-3.5 h-3.5 text-[#155EEF]" />
              <span>Cashback is paid out automatically the moment the transaction confirms.</span>
            </div>

            <Link
              href="/dao"
              className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_25px_rgba(21,94,239,0.4)] hover:shadow-[0_12px_30px_rgba(21,94,239,0.5)] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Claim Seat #{selectedSeat} for ${netOutPocket} TROB</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
