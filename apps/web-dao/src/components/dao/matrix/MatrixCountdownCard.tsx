'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Wallet,
  Clock,
  Lock,
} from 'lucide-react';
import { useTrobPrice } from '@/hooks/useApi';

export default function MatrixCountdownCard() {
  const { data: price } = useTrobPrice(30_000);
  const trobForSlot1 = price && price.priceUsd > 0 ? Math.round(30 / price.priceUsd) : 536;

  // Target: 21 Days founding window countdown (synchronized with smart contract SEAT_WINDOW)
  const INITIAL_TOTAL_SECONDS = 21 * 86400 + 14 * 3600 + 22 * 60 + 10;

  const [timeLeft, setTimeLeft] = useState({
    days: 21,
    hours: 14,
    minutes: 22,
    seconds: 10,
  });

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

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-[#E2EEF9] shadow-[0_4px_25px_rgba(14,98,228,0.08)] overflow-hidden font-sans transition-all">
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0E62E4] via-blue-500 to-[#38BDF8]" />

      {/* ── Status Bar ── */}
      <div className="px-3.5 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0E62E4] border border-[#0E62E4]/20 text-[10px] sm:text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E62E4] animate-pulse" />
            RETAIL MATRIX LAUNCH • DAY 22
          </span>
        </div>
        <div className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
          <Lock className="w-3 h-3 text-amber-700" />
          <span>Seat Reservations & Buying Paused</span>
        </div>
      </div>

      {/* ── Countdown Timer Display ── */}
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

      {/* Architecture & Multi-device Guidelines */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Box 1: DAO Rules */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#14304A]">
              <ShieldCheck className="w-4 h-4 text-[#0E62E4]" />
              <span>DAO Members Registration</span>
            </div>
            <p className="text-[11px] text-[#4F6D87] leading-relaxed">
              DAO members will be eligible to claim priority Matrix slots with their connected DAO wallet upon Day 22 activation.
            </p>
            <div className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
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
              Matrix users can operate multiple Matrix IDs from one physical device, provided each ID uses a unique Web3 wallet.
            </p>
            <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block">
              Matrix Slots: Multi-wallet Allowed
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Royalty & Bridge Callout */}
      <div className="bg-[#F7FBFF] border-t border-[#E2EEF9] px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#4F6D87]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs">
            Protocol Architecture: <strong className="text-[#14304A] font-semibold">35% Matrix Volume Feeds DAO Treasury</strong>
          </span>
        </div>

        <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#0E62E4] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#0E62E4]/20 self-start md:self-auto shrink-0">
          Day 22 Global Activation
        </span>
      </div>
    </div>
  );
}
