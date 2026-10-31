'use client';

import React from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { getExplorerAddressUrl } from '@/utils/explorer';
import { IS_MAINNET, NETWORK_NAME } from '@/config/env';

interface TreasuryBalanceCardProps {
  balance?: number;
  totalVaultAssets?: number;
  totalReceivedUsd?: number;
  totalReceivedTrob?: number;
  earningsCapUsd?: number;
  earningsCapTrob?: number;
  remainingCapUsd?: number;
  remainingCapTrob?: number;
  contractAddress?: string;
  trobRate?: number;
  loading?: boolean;
}

export const TreasuryBalanceCard: React.FC<TreasuryBalanceCardProps> = ({
  balance = 0,
  totalVaultAssets,
  totalReceivedUsd,
  totalReceivedTrob,
  earningsCapUsd = 1500,
  earningsCapTrob,
  remainingCapUsd,
  remainingCapTrob,
  contractAddress,
  loading = false,
}) => {
  const CONTRACT_PEG = 0.056;
  const CONTRACT_CAP_TROB = 26785.714285; // Contract constant in EquoraDAOv2 ($1,500 / 0.056)

  const capUsd = earningsCapUsd && earningsCapUsd > 0 ? earningsCapUsd : 1500;
  const capTrob = earningsCapTrob && earningsCapTrob > 0 ? earningsCapTrob : CONTRACT_CAP_TROB;

  const displayUsd = totalReceivedUsd !== undefined && totalReceivedUsd > 0
    ? totalReceivedUsd
    : (totalVaultAssets !== undefined && totalVaultAssets > 0 ? totalVaultAssets : balance);

  const displayTrob = totalReceivedTrob !== undefined && totalReceivedTrob > 0
    ? totalReceivedTrob
    : Math.round((displayUsd / CONTRACT_PEG) * 100) / 100;

  const remainingUsd = remainingCapUsd !== undefined ? remainingCapUsd : Math.max(0, capUsd - displayUsd);
  const remainingTrob = remainingCapTrob !== undefined ? remainingCapTrob : Math.max(0, Math.round((capTrob - displayTrob) * 100) / 100);

  const capProgressPct = Math.min(100, Math.max(0, (displayTrob / capTrob) * 100));

  // ── SKELETON LOADER (Pre-loading state prevents any 0 / $0.00 flash) ──
  if (loading && (!totalReceivedUsd && !totalReceivedTrob)) {
    return (
      <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="space-y-1.5">
              <div className="w-40 h-4 bg-slate-200 rounded" />
              <div className="w-56 h-3 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="w-28 h-5 bg-emerald-50 rounded-full" />
        </div>

        <div className="space-y-2 py-2">
          <div className="w-64 h-10 bg-slate-200 rounded-xl" />
          <div className="w-72 h-4 bg-slate-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl sm:col-span-2 md:col-span-1" />
        </div>
      </div>
    );
  }

  const explorerUrl = contractAddress ? getExplorerAddressUrl(contractAddress) : '#';

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4 sm:space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold font-jakarta text-[#071A4A] truncate">
              Treasury Earnings Payouts
            </h2>
            <p className="text-[10.5px] sm:text-[11px] text-[#60739A] font-jakarta truncate">Direct-to-wallet on-chain dividend stream</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]/60 text-[10px] font-bold text-[#047857] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live On-Chain Push
        </span>
      </div>

      {/* ── Main Received Payout Amount Hero ── */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-black font-jakarta text-[#071A4A] tracking-tight">
            ${displayUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-lg sm:text-xl md:text-2xl font-black font-jakarta text-[#059669]">USD</span>
        </div>
        <div className="text-xs sm:text-sm font-semibold font-jakarta text-[#155EEF] break-words">
          ≈ {displayTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB (Direct Pushed to Wallet)
        </div>
      </div>

      {/* ── Key Cap Metrics Grid (Accurate USD + On-Chain TROB Stop Points) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-xs font-jakarta">
        {/* Box 1: 5X Cap Limit */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1 min-w-0">
          <div className="text-[10px] text-[#60739A] font-bold uppercase tracking-wider truncate">
            5X Cap Limit (Hard Stop)
          </div>
          <div className="font-black text-[#071A4A] text-sm sm:text-base truncate">
            ${capUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-500">USD</span>
          </div>
          <div className="text-[11px] font-bold text-[#155EEF] font-mono truncate">
            ≈ {capTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
          </div>
          <p className="text-[9.5px] text-[#64748B] pt-0.5 leading-tight">
            Ceiling where automated pushes cease
          </p>
        </div>

        {/* Box 2: Remaining Cap */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#ECFDF5]/80 border border-[#A7F3D0]/70 space-y-1 min-w-0">
          <div className="text-[10px] text-[#047857] font-bold uppercase tracking-wider truncate">
            Remaining Until 5X Stop
          </div>
          <div className="font-black text-[#059669] text-sm sm:text-base truncate">
            ${remainingUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-emerald-700/80">USD</span>
          </div>
          <div className="text-[11px] font-bold text-[#047857] font-mono truncate">
            ≈ {remainingTrob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB left
          </div>
          <p className="text-[9.5px] text-[#047857]/80 pt-0.5 leading-tight">
            Distributions before 5X cycle finishes
          </p>
        </div>

        {/* Box 3: Smart Contract Ledger */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9] sm:col-span-2 md:col-span-1 space-y-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] text-[#60739A] font-bold uppercase tracking-wider truncate">
                Smart Contract Ledger
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 md:hidden shrink-0">
                {IS_MAINNET ? 'Mainnet' : 'Testnet'}
              </span>
            </div>
            <div className="pt-0.5">
              {contractAddress ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-[#155EEF] hover:underline text-xs inline-flex items-center gap-1 group truncate max-w-full"
                >
                  <span className="truncate">{contractAddress.slice(0, 10)}…{contractAddress.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              ) : (
                <div className="font-mono text-xs text-[#60739A]">Connecting…</div>
              )}
            </div>
          </div>
          <div className="pt-0.5 flex items-center justify-between text-[9.5px] text-[#64748B]">
            <span className="hidden md:inline font-medium">{NETWORK_NAME}</span>
            <span className="truncate">Immutable rules enforced by code</span>
          </div>
        </div>
      </div>

      {/* ── 5X Progress Bar & Exact On-Chain Stop Threshold Clarity ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF]/50 border border-[#E2ECF9] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-jakarta flex-wrap gap-1">
          <div className="flex items-center gap-1.5 font-bold text-[#071A4A]">
            <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
            <span>5X Earnings Cap Progress</span>
          </div>
          <span className="text-xs font-black text-[#155EEF] font-mono">
            {capProgressPct.toFixed(1)}% Reached
          </span>
        </div>

        {/* Visual Progress Track */}
        <div className="h-2.5 w-full bg-[#E2ECF9] rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              capProgressPct >= 100
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-[#0E62E4] via-blue-500 to-[#10B981]'
            }`}
            style={{ width: `${Math.min(100, capProgressPct)}%` }}
          />
        </div>

        {/* Milestone Threshold Clean 3-Box Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5 text-[10px] font-jakarta">
          <div className="bg-white border border-[#E2ECF9] rounded-xl p-2 text-center">
            <span className="text-[#64748B] block text-[9px] font-medium uppercase tracking-wider">Start</span>
            <span className="font-bold text-[#071A4A] text-[11px] block mt-0.5">0 TROB</span>
            <span className="text-[9.5px] text-slate-400 font-medium">($0 USD)</span>
          </div>
          <div className="bg-white border border-blue-200/90 rounded-xl p-2 text-center">
            <span className="text-[#155EEF] block text-[9px] font-bold uppercase tracking-wider">Current Pushed</span>
            <span className="font-black text-[#071A4A] text-[11px] block mt-0.5 truncate">
              {displayTrob.toLocaleString(undefined, { maximumFractionDigits: 1 })} TROB
            </span>
            <span className="text-[9.5px] text-[#155EEF] font-semibold">(${displayUsd.toFixed(2)})</span>
          </div>
          <div className="bg-white border border-rose-200/90 rounded-xl p-2 text-center col-span-2 sm:col-span-1">
            <span className="text-rose-600 block text-[9px] font-bold uppercase tracking-wider">5X Hard Stop</span>
            <span className="font-black text-[#DC2626] text-[11px] block mt-0.5 truncate">
              {capTrob.toLocaleString(undefined, { maximumFractionDigits: 1 })} TROB
            </span>
            <span className="text-[9.5px] text-rose-500 font-semibold">(${capUsd.toLocaleString()} USD)</span>
          </div>
        </div>

        {/* On-Chain Explanation */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E2ECF9] text-[10.5px] sm:text-[11px] text-[#4F6D87] leading-relaxed font-jakarta flex items-start gap-2">
          <Info className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#071A4A] font-semibold">On-Chain Protocol Rule:</strong> Payouts automatically cease once your account reaches exactly <strong className="text-[#071A4A] font-semibold">{capTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB</strong> (${capUsd.toLocaleString()} USD). You have received <strong className="text-[#059669] font-semibold">{displayTrob.toLocaleString(undefined, { maximumFractionDigits: 2 })} TROB</strong>. Complete a 5X Re-topup within 48h to start a new 5X earnings cycle.
          </p>
        </div>
      </div>
    </div>
  );
};
