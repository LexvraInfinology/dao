'use client';

import React from 'react';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, ShieldCheck, AlertTriangle, Wallet, Armchair } from 'lucide-react';
import type { TransactionItem } from '@/hooks/useApi';
import { formatUsd, formatTrob } from '@/utils/formatAmount';

interface TransactionsMobileMetricsProps {
  transactions?: TransactionItem[];
  totalTransactions?: number;
  bttPriceUsd?: number;
  userInflowUsd?: number;
  userInflowTrob?: number;
  userOutflowUsd?: number;
  userOutflowTrob?: number;
  userNetReturnUsd?: number;
  userMultiplier?: number;
  memberFinancials?: {
    address: string;
    position: number | null;
    isMember: boolean;
    status: 'active' | 'capped' | 'vacant' | 'non-member';
    userInflowUsd: number;
    userInflowTrob: number;
    userOutflowUsd: number;
    userOutflowTrob: number;
    userNetReturnUsd: number;
    userMultiplier: number;
    retopupCount: number;
    underfundedAudit?: {
      wasUnderfunded: boolean;
      unearnedDebtTrob: number;
      initialV1DepositTrob: number;
      completionDepositTrob?: number;
      cashbackReceivedTrob?: number;
      recovered: boolean;
      note: string;
    };
  } | null;
  activeAddress?: string | null;
  onFilterDividends?: () => void;
  onFilterDeposits?: () => void;
}

export const TransactionsMobileMetrics: React.FC<TransactionsMobileMetricsProps> = ({
  transactions = [],
  totalTransactions,
  bttPriceUsd = 0.056,
  userInflowUsd = 0,
  userInflowTrob = 0,
  userOutflowUsd = 0,
  userOutflowTrob = 0,
  userNetReturnUsd = 0,
  userMultiplier = 0,
  memberFinancials,
  activeAddress,
  onFilterDividends,
  onFilterDeposits,
}) => {
  const total = totalTransactions ?? transactions.length;
  const isConnected = !!activeAddress;
  const audit = memberFinancials?.underfundedAudit;
  const isVacant = memberFinancials?.status === 'vacant';
  const position = memberFinancials?.position;

  return (
    <div className="space-y-3.5 transition-all duration-200">
      {/* Total Transactions Card */}
      <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#60739A]">TOTAL TRANSACTIONS</div>
            <div className="text-2xl sm:text-3xl font-black font-jakarta text-[#071A4A] tracking-tight">{total.toLocaleString()}</div>
            <div className="text-[11px] text-[#60739A] font-medium truncate">
              {isConnected && position ? `Council Seat #${position} • On-Chain Ledger` : 'On-Chain Ledger'}
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF5FF] border border-[#BFDBFE]/60 text-xs font-semibold text-[#155EEF] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />Live Sync
        </span>
      </div>

      {/* Member Personal Inflow / Outflow Row */}
      {isConnected ? (
        <div className="grid grid-cols-2 gap-3">
          {/* Member Personal Deposited (Outflow) */}
          <div
            onClick={onFilterDeposits}
            className={`bg-white border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)] space-y-1 transition-all ${
              onFilterDeposits ? 'cursor-pointer active:scale-98 hover:border-blue-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#60739A] font-semibold font-jakarta">Total Deposited</span>
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#155EEF] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black font-jakarta text-[#071A4A] tracking-tight">
              ${formatUsd(userInflowUsd)}
            </div>
            <div className="text-[11px] text-[#60739A] font-medium font-jakarta truncate">
              {formatTrob(userInflowTrob)} TROB Outflow
            </div>
          </div>

          {/* Member Personal Received (Inflow) */}
          <div
            onClick={onFilterDividends}
            className={`bg-white border border-[#E2ECF9] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)] space-y-1 transition-all ${
              onFilterDividends ? 'cursor-pointer active:scale-98 hover:border-emerald-300 ring-1 ring-emerald-400/30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#059669] font-black font-jakarta flex items-center gap-1">
                Total Received
                <span className="text-[8.5px] px-1 py-0.2 rounded bg-emerald-100 text-[#059669]">Tap</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black font-jakarta text-[#059669] tracking-tight">
              ${formatUsd(userOutflowUsd)}
            </div>
            <div className="text-[11px] text-[#60739A] font-medium font-jakarta truncate">
              {formatTrob(userOutflowTrob)} TROB Inflow
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl p-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#64748B] font-jakarta">
            <Wallet className="w-4 h-4 text-[#155EEF]" />
            <span>Connect Wallet for Personal Metrics</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] font-jakarta">
            Connect your wallet to view your personal deposits and dividend payouts.
          </p>
        </div>
      )}

      {/* Underfunded Wallet Special Audit Ledger Card */}
      {isConnected && audit && (
        <div className={`p-3.5 rounded-2xl border text-xs font-jakarta space-y-2 ${
          isVacant ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-blue-50/70 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center gap-1.5">
              {isVacant ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-[#155EEF] shrink-0" />}
              <span>{isVacant ? `Seat #${position} Quarantined Audit` : `Seat #${position} Underfunded Audit`}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-mono font-bold shadow-2xs">
              {isVacant ? 'Recovered • 0 Earnings' : 'Debt Settled • Completed'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-black/5">
            <div>
              <span className="text-[#64748B] block text-[10px]">Unearned Debt:</span>
              <span className="font-bold font-mono">{audit.unearnedDebtTrob.toFixed(2)} TROB</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Initial V1 Credit:</span>
              <span className="font-bold font-mono">{audit.initialV1DepositTrob.toFixed(2)} TROB</span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">{audit.note}</p>
        </div>
      )}

      {/* Personal Net Position Strip */}
      {isConnected && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-xs font-jakarta">
          <div className="flex items-center gap-1.5 text-[#60739A] font-semibold text-[11px]">
            <Armchair className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Seat Return Multiplier:</span>
          </div>
          <div className="font-bold text-[#071A4A] text-xs">
            {userMultiplier > 0 ? `${userMultiplier.toFixed(2)}x` : '0.00x'} ({userNetReturnUsd >= 0 ? `+$${formatUsd(userNetReturnUsd)}` : `-$${formatUsd(Math.abs(userNetReturnUsd))}`})
          </div>
        </div>
      )}
    </div>
  );
};
