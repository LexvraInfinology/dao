'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';

interface TreasuryBalanceCardProps {
  balance?: number;
  totalVaultAssets?: number;
  contractAddress?: string;
  trobRate?: number;
}

export const TreasuryBalanceCard: React.FC<TreasuryBalanceCardProps> = ({
  balance = 420.50,
  totalVaultAssets,
  contractAddress,
}) => {
  const { data: priceData } = useTrobPrice(30_000);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((p) => (p <= 1 ? 30 : p - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const trovRate   = priceData?.priceUsd ?? 0;
  const trobAmount = trovRate > 0
    ? (balance / trovRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  const rateDisplay = trovRate > 0 ? trovRate.toFixed(6) : 'Loading…';

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
        <h2 className="text-xs sm:text-sm font-bold font-jakarta text-[#60739A] lg:text-[#071A4A]">
          Treasury Balance
        </h2>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl sm:text-4xl lg:text-[44px] font-black font-jakarta text-[#071A4A] tracking-tight">
            ${balance.toFixed(2)}
          </span>
          <span className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] lg:text-[#60739A] lg:font-bold">USD</span>
        </div>
        <div className="text-xs sm:text-sm font-medium font-jakarta text-[#60739A]">
          ≈ {trobAmount} TROB
        </div>
      </div>

      {/* Extra stats */}
      {totalVaultAssets !== undefined && (
        <div className="flex items-center gap-4 text-xs font-jakarta pt-1 flex-wrap">
          <div>
            <span className="text-[#60739A]">Total Received  </span>
            <span className="font-bold text-[#071A4A]">${totalVaultAssets.toFixed(2)}</span>
          </div>
          {contractAddress && (
            <div>
              <span className="text-[#60739A]">Contract  </span>
              <span className="font-mono font-bold text-[#155EEF]">
                {contractAddress.slice(0, 8)}…
              </span>
            </div>
          )}
        </div>
      )}

      <div className="pt-3 sm:pt-4 border-t border-[#F8FAFC] flex items-center justify-between gap-3 text-xs">
        <div className="hidden md:flex items-center gap-1.5 text-[#60739A] font-jakarta">
          <span>Live TROB rate</span>
          <span className="font-bold text-[#071A4A]">${rateDisplay} USD / TROB</span>
          {priceData?.priceSource === 'offchain-estimate' && (
            <span className="text-[10px] text-amber-500">(estimate)</span>
          )}
        </div>
        <div className="md:hidden space-y-0.5">
          <div className="text-[11px] text-[#94A3B8] font-jakarta">Live TROB rate</div>
          <div className="text-xs font-bold text-[#071A4A] font-jakarta">${rateDisplay} USD / TROB</div>
        </div>
        <div className="shrink-0 px-2.5 py-1 rounded-full bg-[#F8FAFC] sm:bg-transparent border border-[#E2ECF9] sm:border-0 text-[11px] sm:text-xs text-[#60739A] font-medium font-jakarta flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Updates in {countdown}s</span>
        </div>
      </div>
    </div>
  );
};
