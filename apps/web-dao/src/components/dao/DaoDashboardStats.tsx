'use client';

/**
 * DaoDashboardStats — live stat cards for the DAO Dashboard page.
 * Fetches /api/dao/stats and /api/price/trob, replaces mock values.
 */

import React, { useEffect, useState } from 'react';
import { Users, Clock, UserPlus } from 'lucide-react';
import { useDaoStats, useTrobPrice } from '@/hooks/useApi';
import { useAuthContext } from '@/context/AuthContext';

// Simple countdown hook that ticks every second
function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const d  = Math.floor(remaining / 86400);
  const h  = Math.floor((remaining % 86400) / 3600);
  const m  = Math.floor((remaining % 3600) / 60);
  const s  = remaining % 60;
  return { d, h, m, s };
}

export function DaoDashboardStats() {
  const { data: stats }    = useDaoStats(30_000);
  const { data: price }    = useTrobPrice(30_000);
  const auth               = useAuthContext();

  // Phase 1 ends in ~18 days from now (configurable via env later)
  const PHASE1_DURATION_S = parseInt(process.env.NEXT_PUBLIC_PHASE1_SECONDS ?? String(18 * 86400 + 14 * 3600 + 22 * 60 + 10), 10);
  const cd = useCountdown(PHASE1_DURATION_S);

  const seatsFilled    = stats?.memberCount ?? 0;
  const seatsRemaining = stats?.remainingPositions ?? (100 - seatsFilled);
  const filledPct      = Math.min(100, Math.round((seatsFilled / 100) * 100));

  // Next seat = first available
  const nextSeatNum    = seatsFilled + 1;
  const cashback       = (300 / nextSeatNum).toFixed(2);
  const netInflow      = (300 - Number(cashback)).toFixed(2);
  const netInflowTrob  = (price && price.priceUsd > 0) ? (Number(netInflow) / price.priceUsd).toFixed(2) : '—';

  // If this user owns a seat, show their position
  const myPosition     = auth.user?.daoPosition;

  return (
    <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar">

      {/* ── Card 1: Seats Remaining ───────────────────────────────────── */}
      <div className="min-w-[280px] xs:min-w-[300px] md:min-w-0 flex-1 snap-start p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#60739A] font-jakarta">
            {myPosition ? `Your Seat: #${myPosition}` : 'Seats Remaining'}
          </span>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-black font-jakarta text-[#071A4A]">
            {seatsRemaining}{' '}
            <span className="text-lg sm:text-xl text-[#94A3B8] font-normal">/ 100</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2 rounded-full bg-[#E2ECF9] overflow-hidden">
            <div
              className="h-full bg-[#155EEF] rounded-full transition-all duration-700"
              style={{ width: `${filledPct}%` }}
            />
          </div>
          <div className="text-right text-[11px] font-semibold text-[#64748B]">
            {seatsFilled} seats filled
          </div>
        </div>
      </div>

      {/* ── Card 2: Countdown ─────────────────────────────────────────── */}
      <div className="min-w-[280px] xs:min-w-[300px] md:min-w-0 flex-1 snap-start p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#60739A] font-jakarta">Genesis Phase 1 Ends In</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          {[
            { val: cd.d, label: 'DAYS' },
            { val: cd.h, label: 'HOURS' },
            { val: cd.m, label: 'MINS' },
            { val: cd.s, label: 'SECS' },
          ].map((seg, i, arr) => (
            <React.Fragment key={seg.label}>
              <div className="text-center">
                <div className="text-xl lg:text-2xl xl:text-3xl font-black font-jakarta text-[#071A4A] tabular-nums">
                  {String(seg.val).padStart(2, '0')}
                </div>
                <div className="text-[9px] lg:text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase mt-1">
                  {seg.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="text-base lg:text-lg font-bold text-[#94A3B8] -mt-3">:</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="h-4" />
      </div>

      {/* ── Card 3: Next Seat Preview ─────────────────────────────────── */}
      <div className="min-w-[300px] xs:min-w-[320px] md:min-w-0 flex-1 snap-start p-6 rounded-3xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EEF5FF] text-[#155EEF] flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#60739A] font-jakarta">Next Seat Preview</span>
        </div>

        <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-1 text-left">
          {[
            { val: `#${nextSeatNum}`,  label: 'Position in Line' },
            { val: `$300`,             label: 'Gross Deposit' },
            { val: `$${cashback}`,     label: 'Instant Cashback', green: true },
            { val: `$${netInflow}`,    label: `≈ ${netInflowTrob} TROB` },
          ].map((col) => (
            <div key={col.label}>
              <div className={`text-base sm:text-lg md:text-sm lg:text-lg xl:text-2xl font-black font-jakarta ${col.green ? 'text-[#10B981]' : 'text-[#071A4A]'}`}>
                {col.val}
              </div>
              <div className="text-[9px] lg:text-[10px] xl:text-[11px] text-[#64748B] font-medium mt-1 leading-tight">
                {col.label}
              </div>
            </div>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
