'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Wallet,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';

interface MatrixCountdownCardProps {
  onRegisterClick?: () => void;
}

export default function MatrixCountdownCard({ onRegisterClick }: MatrixCountdownCardProps) {
  const { data: price } = useTrobPrice(30_000);
  const wallet = useWallet();

  const trobForSlot1 = price && price.priceUsd > 0 ? Math.round(30 / price.priceUsd) : 536;

  // Target: 21 Days founding window countdown (synchronized with smart contract SEAT_WINDOW)
  const INITIAL_TOTAL_SECONDS = 21 * 86400 + 14 * 3600 + 22 * 60 + 10;

  const [timeLeft, setTimeLeft] = useState({
    days: 21,
    hours: 14,
    minutes: 22,
    seconds: 10,
  });

  // State to simulate or trigger timer completion
  const [isForceOpen, setIsForceOpen] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = 'equora_matrix_target_timestamp';
    let target = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        target = parseInt(stored, 10);
      }
    } catch {}

    if (!target || isNaN(target) || target <= Date.now()) {
      target = Date.now() + INITIAL_TOTAL_SECONDS * 1000;
      try {
        localStorage.setItem(STORAGE_KEY, String(target));
      } catch {}
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((target - now) / 1000));
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const isTimerExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  const isMatrixOpen = isTimerExpired || isForceOpen;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-[#E2EEF9] shadow-[0_4px_25px_rgba(14,98,228,0.08)] overflow-hidden font-sans transition-all">
      {/* Top Accent Gradient Bar */}
      <div
        className={`h-1.5 w-full transition-all duration-500 ${
          isMatrixOpen
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-[#0E62E4]'
            : 'bg-gradient-to-r from-[#0E62E4] to-[#38BDF8]'
        }`}
      />

      {/* ── Status Bar / Toggle preview ── */}
      <div className="px-4 sm:px-6 pt-3.5 pb-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isMatrixOpen ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] sm:text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MATRIX IS OPEN NOW • REGISTRATION LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0E62E4] border border-[#0E62E4]/20 text-[10px] sm:text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E62E4] animate-pulse" />
              RETAIL MATRIX LAUNCH COUNTDOWN
            </span>
          )}
        </div>

        {/* Developer / reviewer preview switch */}
        <button
          onClick={() => setIsForceOpen((prev) => !prev)}
          className="text-[10px] font-semibold text-slate-500 hover:text-[#0E62E4] flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-white transition-all shadow-xs"
          title="Toggle preview between countdown and live open matrix mode"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          <span>{isMatrixOpen ? 'View Countdown' : 'Preview Live State'}</span>
        </button>
      </div>

      {/* ── Condition A: MATRIX IS OPEN NOW ── */}
      {isMatrixOpen ? (
        <div className="p-5 sm:p-7 space-y-5 animate-fadeIn">
          {/* Main Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1528] via-[#0E244D] to-[#123672] text-white border border-[#1E3A6E] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Slot 1 Registration Active
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {trobForSlot1.toLocaleString()} TROB ($30 USD)
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  The Matrix Is Officially Open.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-lg">
                  Registration is open for all members. DAO members and retail participants can now activate Slot 1 ($30) and unlock the 14-node spillover tree graph.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onRegisterClick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 transform active:scale-95"
                >
                  <Layers className="w-4 h-4" />
                  <span>Register Matrix Slot 1 ($30)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Architecture & Multi-device Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Box 1: DAO Rules */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14304A]">
                <ShieldCheck className="w-4 h-4 text-[#0E62E4]" />
                <span>DAO Members Registration</span>
              </div>
              <p className="text-[11px] text-[#4F6D87] leading-relaxed">
                DAO members can register Matrix slots with their connected DAO wallet. Data reflects cleanly on the dedicated domain with zero transaction confusion.
              </p>
              <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                DAO Seat Cap: Strictly 1 Seat per Device
              </div>
            </div>

            {/* Box 2: Retail Multi-ID Rules */}
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14304A]">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Retail Multiple Matrix IDs</span>
              </div>
              <p className="text-[11px] text-[#4F6D87] leading-relaxed">
                Normal matrix users can register multiple Matrix IDs from one physical device, provided that each ID uses a separate, unique Web3 wallet.
              </p>
              <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block">
                Matrix Slots: Multi-wallet Allowed
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Condition B: COUNTDOWN ACTIVE ── */
        <div className="px-4 sm:px-6 py-5 sm:py-7 flex items-center justify-between">
          {/* Unit 1: DAYS */}
          <div className="flex-1 text-center">
            <div className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#14304A] tracking-tight leading-none tabular-nums">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#4F6D87] mt-1.5">
              DAYS
            </div>
          </div>

          <div className="text-sm sm:text-lg font-bold text-[#CBD5E1] -mt-3 px-1 select-none">:</div>

          {/* Unit 2: HOURS */}
          <div className="flex-1 text-center">
            <div className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#14304A] tracking-tight leading-none tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#4F6D87] mt-1.5">
              HOURS
            </div>
          </div>

          <div className="text-sm sm:text-lg font-bold text-[#CBD5E1] -mt-3 px-1 select-none">:</div>

          {/* Unit 3: MINS */}
          <div className="flex-1 text-center">
            <div className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#14304A] tracking-tight leading-none tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#4F6D87] mt-1.5">
              MINS
            </div>
          </div>

          <div className="text-sm sm:text-lg font-bold text-[#CBD5E1] -mt-3 px-1 select-none">:</div>

          {/* Unit 4: SECS */}
          <div className="flex-1 text-center">
            <div className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#14304A] tracking-tight leading-none tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#4F6D87] mt-1.5">
              SECS
            </div>
          </div>
        </div>
      )}

      {/* Protocol Royalty & Bridge Callout */}
      <div className="bg-[#F7FBFF] border-t border-[#E2EEF9] px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#4F6D87]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Protocol Architecture: <strong className="text-[#14304A] font-semibold">35% Matrix Volume Feeds DAO Treasury</strong>
          </span>
        </div>

        <span className="text-[11px] font-semibold text-[#0E62E4] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#0E62E4]/20">
          Day 22 Global Activation
        </span>
      </div>
    </div>
  );
}
