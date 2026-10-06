'use client';

import React, { useState, useEffect } from 'react';
import { Info, Clock, ArrowRight, Zap, X } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { RetopupModal } from './RetopupModal';

interface EarningsCapCardProps {
  variant?: 'desktop' | 'mobile' | 'auto';
  capProgressPct?: number;
  pushedUsd?: number;
  earningsCapUsd?: number;
  trobPriceUsd?: number;
  isCapped?: boolean;
  retopupDeadline?: string | null;
  retopupTimeRemainingSeconds?: number | null;
  position?: number;
  retopupCashbackUsd?: number;
  activeMembersCount?: number;
  bypassedToCouncilUsd?: number;
  newActivationsSinceCap?: number;
  cappedAt?: string | null;
}

export const EarningsCapCard: React.FC<EarningsCapCardProps> = ({
  variant = 'auto',
  capProgressPct = 0,
  pushedUsd = 0,
  earningsCapUsd = 1500,
  trobPriceUsd,
  isCapped = false,
  retopupDeadline,
  position = 1,
  retopupCashbackUsd,
  activeMembersCount = 85,
  bypassedToCouncilUsd = 6.49,
  newActivationsSinceCap = 2,
  cappedAt,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [retopupModalOpen, setRetopupModalOpen] = useState(false);
  const wallet = useWallet();

  // Normalize effective cap: fixed $300 deposit with 5X earnings cap ($1,500 USD)
  const effectiveCapUsd = earningsCapUsd && earningsCapUsd >= 300 ? earningsCapUsd : 1500;
  // If isCapped or cap hit, display 100% and clamp effectivePushedUsd to $1,500
  const isCapReached = Boolean(isCapped || capProgressPct >= 100 || pushedUsd >= effectiveCapUsd);
  const effectivePushedUsd = isCapReached ? effectiveCapUsd : Math.min(effectiveCapUsd, pushedUsd);
  const pct         = isCapReached ? 100 : Math.min(100, Math.max(0, effectiveCapUsd > 0 ? (effectivePushedUsd / effectiveCapUsd) * 100 : capProgressPct));
  const remaining   = isCapReached ? 0 : Math.max(0, effectiveCapUsd - effectivePushedUsd);
  const zone        = isCapReached ? '5X Capped' : pct >= 90 ? 'Danger Zone' : pct >= 70 ? 'Caution' : 'Safe Zone';
  const zoneColor   = isCapReached
    ? 'text-[#B91C1C] bg-red-100 border-red-300'
    : pct >= 90
    ? 'text-[#DC2626] bg-red-50 border-red-200'
    : pct >= 70
    ? 'text-[#D97706] bg-amber-50 border-amber-200'
    : 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]/60';

  const cashbackDisplayUsd = retopupCashbackUsd && retopupCashbackUsd > 0 && retopupCashbackUsd < 300
    ? retopupCashbackUsd
    : 3.53;

  const radius        = 33;
  const circumference = 2 * Math.PI * radius;
  const dashoffset    = circumference * (1 - pct / 100);

  // ── 48-Hour Countdown Timer ────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 48,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!isCapReached) return;

    function updateTimer() {
      let targetMs: number;
      if (retopupDeadline) {
        targetMs = new Date(retopupDeadline).getTime();
      } else {
        targetMs = Date.now() + 48 * 3600 * 1000;
      }

      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCapReached, retopupDeadline]);

  return (
    <div className={`bg-white border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4 sm:space-y-5 transition-all ${
      isCapReached ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E2ECF9]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm sm:text-base font-bold font-jakarta text-[#071A4A]">5X Earnings Cap</h3>
          <button onClick={() => setModalOpen(true)} className="text-[#94A3B8] hover:text-[#155EEF] transition-colors" aria-label="Info">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] sm:bg-transparent text-[11px] sm:text-xs font-semibold sm:font-bold text-[#155EEF] hover:underline transition-all">
          What is this?
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={radius} stroke="#F1F5F9" strokeWidth="7" fill="transparent" />
            <circle cx="42" cy="42" r={radius} stroke={isCapReached ? '#E11D48' : pct >= 70 ? '#F59E0B' : '#00D492'} strokeWidth="7"
              strokeDasharray={circumference} strokeDashoffset={dashoffset}
              strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg sm:text-xl font-black font-jakarta text-[#071A4A]">{Math.round(pct)}%</span>
          </div>
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-black font-jakarta text-[#071A4A] tracking-tight">
              ${effectivePushedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm font-semibold font-jakarta text-[#60739A]">
              / ${effectiveCapUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
            </span>
          </div>
          <div className="text-xs font-medium font-jakarta text-[#60739A]">5X Cap hits at ${effectiveCapUsd.toLocaleString()} earned</div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold ${zoneColor}`}>
            {zone}
          </span>
        </div>
      </div>

      {/* ── 48-HOUR RE-TOPUP COUNTDOWN TIMER (ACTIVATED ON 5X CAP) ── */}
      {isCapReached && (
        <div className="rounded-xl sm:rounded-2xl bg-amber-50/90 border border-amber-300 p-4 sm:p-5 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>48-Hour Re-topup Countdown</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
              {timeLeft.isExpired ? 'Slot Blanking Pending' : 'Window Open'}
            </span>
          </div>

          {/* Large Countdown Units */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="bg-white border border-amber-200 rounded-xl p-2 sm:p-2.5 shadow-xs">
              <div className="text-xl min-[360px]:text-2xl sm:text-3xl font-black font-mono text-[#071A4A]">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[8.5px] sm:text-[10px] uppercase font-bold tracking-wider text-[#60739A] mt-0.5">Hours</div>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-2 sm:p-2.5 shadow-xs">
              <div className="text-xl min-[360px]:text-2xl sm:text-3xl font-black font-mono text-[#071A4A]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[8.5px] sm:text-[10px] uppercase font-bold tracking-wider text-[#60739A] mt-0.5">Minutes</div>
            </div>
            <div className="bg-white border border-amber-200 rounded-xl p-2 sm:p-2.5 shadow-xs">
              <div className="text-xl min-[360px]:text-2xl sm:text-3xl font-black font-mono text-rose-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[8.5px] sm:text-[10px] uppercase font-bold tracking-wider text-[#60739A] mt-0.5">Seconds</div>
            </div>
          </div>

          <div className="text-[11px] sm:text-xs text-amber-950 font-medium leading-relaxed font-jakarta">
            {timeLeft.isExpired
              ? `The 48-hour re-topup deadline has expired. Seat #${position} is now open for queue reallocation.`
              : `Seat #${position} has reached the 5X earnings cap ($1,500 USD). Complete your $300 USD re-topup within 48 hours to reset your cap to zero and resume continuous dividend distributions.`}
          </div>

          {/* 3-Metric Redistribution Cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="bg-white border border-amber-200/90 rounded-xl p-2 sm:p-2.5 text-center shadow-xs min-w-0">
              <div className="text-[8.5px] sm:text-[10px] font-bold text-[#60739A] uppercase tracking-wider truncate">Cap Secured</div>
              <div className="text-xs sm:text-base font-black text-[#071A4A] font-jakarta mt-0.5 truncate">$1,500.00</div>
              <div className="text-[8px] sm:text-[9px] text-emerald-600 font-bold mt-0.5 truncate">5X Hit</div>
            </div>
            <div className="bg-white border border-amber-200/90 rounded-xl p-2 sm:p-2.5 text-center shadow-xs min-w-0">
              <div className="text-[8.5px] sm:text-[10px] font-bold text-[#60739A] uppercase tracking-wider truncate">Redirected</div>
              <div className="text-xs sm:text-base font-black text-rose-600 font-jakarta mt-0.5 truncate">~${bypassedToCouncilUsd.toFixed(2)}</div>
              <div className="text-[8px] sm:text-[9px] text-rose-600 font-bold mt-0.5 truncate">{newActivationsSinceCap} Bypassed</div>
            </div>
            <div className="bg-white border border-amber-200/90 rounded-xl p-2 sm:p-2.5 text-center shadow-xs min-w-0">
              <div className="text-[8.5px] sm:text-[10px] font-bold text-[#60739A] uppercase tracking-wider truncate">Beneficiaries</div>
              <div className="text-xs sm:text-base font-black text-[#071A4A] font-jakarta mt-0.5 truncate">{Math.max(1, activeMembersCount - 1)} Seats</div>
              <div className="text-[8px] sm:text-[9px] text-[#155EEF] font-bold mt-0.5 truncate">Council Peers</div>
            </div>
          </div>

          {/* While-Capped Redistribution Audit & Fund Flow Box */}
          <div className="rounded-xl bg-white border border-amber-200/90 p-3.5 space-y-2.5 text-xs shadow-2xs font-jakarta">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#60739A] font-medium">Current Payout Status:</span>
              <span className="font-bold text-rose-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Dividends Paused at $1,500.00 USD
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
              <span className="text-[#60739A] font-medium">Bypassed While In Capping:</span>
              <span className="font-bold text-[#071A4A]">
                ~${bypassedToCouncilUsd.toFixed(2)} USD redirected to {Math.max(1, activeMembersCount - 1)} peers
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5 text-[11px] leading-relaxed text-[#4F6184]">
              <div className="font-bold text-[#071A4A] flex items-center gap-1">
                <span>On-Chain Surplus & Bypass Audit:</span>
              </div>
              <p>
                • <strong>At Capping Point:</strong> Payouts stopped immediately upon reaching the $1,500 cap. Any surplus from that triggering transaction was automatically pushed on-chain to active members.
              </p>
              <p>
                • <strong>While In 48h Capping Window:</strong> New seat activations (Seats #92 and #93) arrived after capping. To enforce the 5X limit, your seat received $0.00 from these inflows, and the full ~$6.49 USD was split equally among your active council peers (~${cashbackDisplayUsd} USD each).
              </p>
              <p>
                • <strong>Upon Re-topup ($300 USD):</strong> Your $300 deposit will be split equally among all active council members, you will receive instant cashback (~${cashbackDisplayUsd} USD), and your 5X cap will reset to $0.00 to unlock your next $1,500.00 USD earning cycle.
              </p>
            </div>
          </div>

          <button
            onClick={() => setRetopupModalOpen(true)}
            disabled={timeLeft.isExpired}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Re-topup Seat #{position} ($300 USD)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Dedicated Professional Retopup Modal */}
          <RetopupModal
            isOpen={retopupModalOpen}
            onClose={() => setRetopupModalOpen(false)}
            seatPosition={position}
            retopupDeadline={retopupDeadline}
            trobPriceUsd={trobPriceUsd}
            cashbackUsd={cashbackDisplayUsd}
          />
        </div>
      )}

      {(variant === 'desktop' || variant === 'auto') && (
        <div className={`space-y-4 pt-1 ${variant === 'auto' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#60739A] font-medium font-jakarta">Earnings remaining until 5X cap:</span>
              <span className="font-bold font-jakarta text-[#071A4A]">
                ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isCapReached ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#00D492]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          {!isCapReached && (
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] p-3.5 text-xs text-[#60739A] leading-relaxed font-jakarta">
              When your total dividends reach ${effectiveCapUsd.toLocaleString()} USD (5X of the $300 deposit), a $300 re-topup is required within 48 hours to reset your cap and continue earning.
            </div>
          )}
        </div>
      )}

      {(variant === 'mobile' || variant === 'auto') && (
        <div className={`space-y-2 pt-1 ${variant === 'auto' ? 'lg:hidden' : ''}`}>
          <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCapReached ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#00D492]'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-0.5">
            <div className="text-[#60739A] font-medium font-jakarta">
              Remaining: <span className="font-bold text-[#071A4A]">${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-jakarta">Re-top: $300 USD</div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-white border border-[#E2ECF9] rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 cursor-default">
            <div className="flex items-center justify-between border-b border-[#E2ECF9] pb-3">
              <h3 className="text-base font-bold text-[#071A4A] font-jakarta flex items-center gap-2">
                <Info className="w-4 h-4 text-[#155EEF]" />5X Earnings Cap Policy (${effectiveCapUsd.toLocaleString()} USD)
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-[#94A3B8] hover:text-[#071A4A] transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#4F6184] font-jakarta leading-relaxed">
              <p>Each Council Seat earns up to <strong>5X its initial entry cost</strong> ($300 deposit × 5 = <strong>${effectiveCapUsd.toLocaleString()} max cap</strong>).</p>
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/60 space-y-1">
                <div className="font-bold text-[#155EEF]">Current Status: {zone} ({Math.round(pct)}%)</div>
                <div>You have accumulated ${pushedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} with ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining.</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1 text-xs text-amber-950">
                <div className="font-bold text-amber-900">What happens while your seat is capped?</div>
                <p className="text-[11px] leading-relaxed">
                  • <strong>Dividends Paused:</strong> Payouts halt at exactly $1,500.00 USD.<br />
                  • <strong>Surplus Redistribution:</strong> Any surplus beyond $1,500 at the moment of capping was automatically distributed on-chain to other active council members.<br />
                  • <strong>Protocol Inflows:</strong> All new $300 seat deposits and matrix fees bypass your seat and are split equally among active uncapped members during the 48-hour window.<br />
                  • <strong>48-Hour Re-topup:</strong> Completing your $300 re-topup resets your cap to $0.00 and restores continuous dividend distributions.
                </p>
              </div>
              <p className="text-[11px] text-slate-500">If not re-topped up within 48 hours, the slot is permanently blanked and made available for public takeover.</p>
            </div>
            <button onClick={() => setModalOpen(false)} className="w-full py-2.5 rounded-xl bg-[#155EEF] text-white font-bold text-xs hover:bg-[#0052E6] transition-all">
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
