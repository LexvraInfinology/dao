'use client';

import React, { useState } from 'react';
import { Database, ArrowRight, CheckCircle2, Info } from 'lucide-react';

interface ClaimableDividendsCardProps {
  initialAmount?: number;
}

export const ClaimableDividendsCard: React.FC<ClaimableDividendsCardProps> = ({
  initialAmount = 420.50,
}) => {
  const [balance, setBalance] = useState<number>(initialAmount);
  const [status, setStatus] = useState<'idle' | 'claiming' | 'success'>('idle');

  const handleWithdraw = () => {
    if (balance <= 0 || status !== 'idle') return;
    setStatus('claiming');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setBalance(0);
        setStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-3xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]/40 text-[#155EEF] flex items-center justify-center shrink-0">
          <Database className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold font-jakarta text-[#071A4A]">
          Claimable Dividends
        </h3>
      </div>

      {/* Main Balance Display */}
      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-black font-jakarta text-[#071A4A] tracking-tight">
          ${balance.toFixed(2)} TROB
        </div>
        <div className="text-xs font-semibold font-jakarta text-[#10B981] flex items-center gap-1.5">
          {balance > 0 ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Ready to withdraw</span>
            </>
          ) : (
            <span className="text-[#94A3B8]">No pending dividends</span>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div>
        <button
          onClick={handleWithdraw}
          disabled={balance === 0 || status !== 'idle'}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm sm:text-base transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2"
        >
          {status === 'claiming' ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Processing On-Chain...</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Transferred to 0x8A...91F2!</span>
            </>
          ) : (
            <>
              <span>Withdraw to Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F8FAFC]">
        <span className="text-[#60739A] font-medium font-jakarta">
          Estimated Gas Fee
        </span>
        <div className="flex items-center gap-1 text-[#071A4A] font-bold font-jakarta">
          <span>&lt; $0.005</span>
          <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
        </div>
      </div>
    </div>
  );
};
