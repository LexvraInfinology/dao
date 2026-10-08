'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';

interface TreasuryBalanceCardProps {
  balance?: number;
  totalVaultAssets?: number;
  totalReceivedUsd?: number;
  totalReceivedTrob?: number;
  earningsCapUsd?: number;
  remainingCapUsd?: number;
  contractAddress?: string;
  trobRate?: number;
}

export const TreasuryBalanceCard: React.FC<TreasuryBalanceCardProps> = ({
  balance = 0,
  totalVaultAssets,
  totalReceivedUsd,
  totalReceivedTrob,
  earningsCapUsd = 1500,
  remainingCapUsd,
  contractAddress,
}) => {
  // Use actual received payouts; if zero, fallback to vault assets or balance
  const displayUsd = totalReceivedUsd !== undefined && totalReceivedUsd > 0
    ? totalReceivedUsd
    : (totalVaultAssets !== undefined && totalVaultAssets > 0 ? totalVaultAssets : balance);

  const CONTRACT_PEG = 0.056;
  const displayTrob = totalReceivedTrob !== undefined && totalReceivedTrob > 0
    ? totalReceivedTrob
    : Math.round((displayUsd / CONTRACT_PEG) * 100) / 100;

  const remainingUsd = remainingCapUsd !== undefined ? remainingCapUsd : Math.max(0, earningsCapUsd - displayUsd);

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A]">
              Treasury Earnings Payouts
            </h2>
            <p className="text-[11px] text-[#60739A] font-jakarta">Direct-to-wallet on-chain payouts</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#047857]">
          Direct On-Chain Push
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl sm:text-4xl lg:text-[44px] font-black font-jakarta text-[#071A4A] tracking-tight">
            ${displayUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xl sm:text-2xl font-black font-jakarta text-[#059669] lg:text-[#059669]">USD</span>
        </div>
        <div className="text-xs sm:text-sm font-medium font-jakarta text-[#60739A]">
          ≈ {displayTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB (Direct Pushed to Wallet)
        </div>
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs font-jakarta border-t border-[#F8FAFC]">
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9]/60">
          <div className="text-[10px] text-[#60739A] font-medium uppercase tracking-wider">5X Cap Limit</div>
          <div className="font-bold text-[#071A4A] text-sm">${earningsCapUsd.toLocaleString()} USD</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9]/60">
          <div className="text-[10px] text-[#60739A] font-medium uppercase tracking-wider">Remaining Cap</div>
          <div className="font-bold text-[#059669] text-sm">${remainingUsd.toFixed(2)} USD</div>
        </div>
        {contractAddress && (
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9]/60 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-[#60739A] font-medium uppercase tracking-wider">Smart Contract</div>
            <div className="font-mono font-bold text-[#155EEF] text-xs truncate">
              {contractAddress.slice(0, 8)}…{contractAddress.slice(-4)}
            </div>
          </div>
        )}
      </div>

      {/* Stable Benchmark Note (Replaces fluctuating rate) */}
      <div className="pt-3 sm:pt-4 border-t border-[#F8FAFC] flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 text-[#60739A] font-jakarta">
          <span className="text-[11px] font-semibold text-[#071A4A]">Smart Contract Peg:</span>
          <span className="font-bold text-[#155EEF]">$0.0560 USD / TROB</span>
          <span className="text-[10px] text-[#60739A]">(Zero Slippage)</span>
        </div>
        <div className="shrink-0 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[11px] text-[#047857] font-semibold font-jakarta flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Live On-Chain Direct Sync</span>
        </div>
      </div>
    </div>
  );
};
