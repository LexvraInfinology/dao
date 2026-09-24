'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';

interface TreasuryBalanceCardProps {
  balance?: number;
  trobRate?: number;
}

export const TreasuryBalanceCard: React.FC<TreasuryBalanceCardProps> = ({
  balance = 420.50,
  trobRate = 0.151688,
}) => {
  const [countdown, setCountdown] = useState(12);

  // Live countdown timer that resets every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const trobAmount = (balance / trobRate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
        <h2 className="text-xs sm:text-sm font-bold font-jakarta text-[#60739A] lg:text-[#071A4A]">
          Treasury Balance
        </h2>
      </div>

      {/* Main Balance Display */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl sm:text-4xl lg:text-[44px] font-black font-jakarta text-[#071A4A] tracking-tight">
            ${balance.toFixed(2)}
          </span>
          <span className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] lg:text-[#60739A] lg:font-bold">
            USD
          </span>
        </div>

        <div className="text-xs sm:text-sm font-medium font-jakarta text-[#60739A]">
          ≈ {trobAmount} TROB
        </div>
      </div>

      {/* Live Rate Footer */}
      <div className="pt-3 sm:pt-4 border-t border-[#F8FAFC] flex items-center justify-between gap-3 text-xs">
        {/* Desktop Left: Single line */}
        <div className="hidden md:flex items-center gap-1.5 text-[#60739A] font-jakarta">
          <span>Live TROB rate</span>
          <span className="font-bold text-[#071A4A]">$0.1516 USD / TROB</span>
        </div>

        {/* Mobile Left: Stacked lines */}
        <div className="md:hidden space-y-0.5">
          <div className="text-[11px] text-[#94A3B8] font-jakarta">
            Live TROB rate
          </div>
          <div className="text-xs font-bold text-[#071A4A] font-jakarta">
            $0.1516 USD / TROB
          </div>
        </div>

        {/* Live Updates Pill */}
        <div className="shrink-0 px-2.5 py-1 rounded-full bg-[#F8FAFC] sm:bg-transparent border border-[#E2ECF9] sm:border-0 text-[11px] sm:text-xs text-[#60739A] font-medium font-jakarta flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Updates in {countdown}s</span>
        </div>
      </div>
    </div>
  );
};
