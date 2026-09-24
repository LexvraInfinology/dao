'use client';

import React, { useState } from 'react';
import { CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TreasuryWithdrawCardProps {
  availableBalance?: number;
  onWithdrawSuccess?: (amount: number) => void;
  variant?: 'desktop' | 'mobile' | 'auto';
}

export const TreasuryWithdrawCard: React.FC<TreasuryWithdrawCardProps> = ({
  availableBalance = 420.50,
  onWithdrawSuccess,
  variant = 'auto',
}) => {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'withdrawing' | 'success'>('idle');
  const [activeChip, setActiveChip] = useState<number | null>(null);

  const trobRate = 0.151688;
  const numAmount = parseFloat(amount) || 0;
  const trobCalculated = numAmount > 0 ? (numAmount / trobRate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : '0.00';

  const handleChipClick = (pct: number) => {
    setActiveChip(pct);
    const calculated = (availableBalance * pct).toFixed(2);
    setAmount(calculated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setActiveChip(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || numAmount > availableBalance || status !== 'idle') return;

    setStatus('withdrawing');
    setTimeout(() => {
      setStatus('success');
      if (onWithdrawSuccess) {
        onWithdrawSuccess(numAmount);
      }
      setTimeout(() => {
        setStatus('idle');
        setAmount('');
        setActiveChip(null);
      }, 3500);
    }, 1500);
  };

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold font-jakarta text-[#071A4A]">
          Withdraw
        </h2>
        {/* Desktop subtitle vs Mobile subtitle */}
        <p className="text-xs text-[#60739A] font-jakarta mt-0.5 hidden lg:block">
          Move available treasury funds to your connected wallet.
        </p>
        <p className="text-xs text-[#60739A] font-jakarta mt-0.5 lg:hidden">
          Available balance to withdraw immediately
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* =========================================================================
            DESKTOP LAYOUT (2 Columns: Left Input & Chips, Right Summary & Button)
           ========================================================================= */}
        {(variant === 'desktop' || variant === 'auto') && (
          <div className={`hidden lg:grid grid-cols-12 gap-6 items-end ${variant === 'desktop' ? '!grid' : ''}`}>
            {/* Left Column: Input + 4 Chips (8 cols) */}
            <div className="col-span-8 space-y-3">
              <label className="block text-xs font-bold font-jakarta text-[#071A4A]">
                Amount
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                  value={amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9] focus:border-[#155EEF] focus:bg-white text-base font-bold text-[#071A4A] placeholder-[#94A3B8] transition-all font-jakarta pr-16 focus:outline-none"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#60739A]">
                  USD
                </span>
              </div>

              {/* 4 Chips */}
              <div className="grid grid-cols-4 gap-3 pt-0.5">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleChipClick(pct)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold font-jakarta transition-all text-center ${
                      activeChip === pct
                        ? 'border-[#155EEF] bg-[#EEF5FF] text-[#155EEF]'
                        : 'border-[#E2ECF9] bg-[#F8FAFC] hover:bg-[#EEF5FF] hover:border-blue-200 text-[#071A4A]'
                    }`}
                  >
                    {pct === 1 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: "You will receive" box + Action Button (4 cols) */}
            <div className="col-span-4 space-y-3">
              {/* You will receive Box */}
              <div className="rounded-2xl border border-[#E2ECF9] bg-[#F8FAFC] p-3.5 sm:p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E2ECF9] flex items-center justify-center text-[#155EEF] shrink-0 shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-medium font-jakarta text-[#60739A]">
                    You will receive
                  </div>
                  <div className="text-sm sm:text-base font-black font-jakarta text-[#071A4A] truncate">
                    {trobCalculated} TROB
                  </div>
                  <div className="text-[10px] font-medium font-jakarta text-[#94A3B8]">
                    ≈ ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'} USD
                  </div>
                </div>
              </div>

              {/* Withdraw Button */}
              <button
                type="submit"
                disabled={status !== 'idle' || numAmount <= 0 || numAmount > availableBalance}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {status === 'withdrawing' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Withdrawn!</span>
                  </>
                ) : (
                  <>
                    <span>Withdraw to Wallet</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MOBILE LAYOUT (Stacked: Amount Input -> 4 Chips -> Withdraw Button)
           ========================================================================= */}
        {(variant === 'mobile' || variant === 'auto') && (
          <div className={`space-y-4 ${variant === 'auto' ? 'lg:hidden' : ''}`}>
            <div className="space-y-2">
              <label className="block text-xs font-bold font-jakarta text-[#071A4A]">
                Amount
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                  value={amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] focus:border-[#155EEF] focus:bg-white text-base font-bold text-[#071A4A] placeholder-[#94A3B8] transition-all font-jakarta pr-14 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#60739A]">
                  USD
                </span>
              </div>

              {/* 4 Preset Chips */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleChipClick(pct)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold font-jakarta transition-all text-center ${
                      activeChip === pct
                        ? 'border-[#155EEF] bg-[#EEF5FF] text-[#155EEF]'
                        : 'border-[#E2ECF9] bg-[#F8FAFC] hover:bg-[#EEF5FF] text-[#071A4A]'
                    }`}
                  >
                    {pct === 1 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              type="submit"
              disabled={status !== 'idle' || numAmount <= 0 || numAmount > availableBalance}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#155EEF] hover:bg-[#0052E6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(21,94,239,0.32)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {status === 'withdrawing' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Withdrawn!</span>
                </>
              ) : (
                <>
                  <span>Withdraw to Wallet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Success Notification Alert */}
      {status === 'success' && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2.5 text-xs text-[#047857] font-semibold font-jakarta animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>
            Successfully submitted withdrawal of ${numAmount.toFixed(2)} USD to connected wallet 0x8A...91F2!
          </span>
        </div>
      )}
    </div>
  );
};
