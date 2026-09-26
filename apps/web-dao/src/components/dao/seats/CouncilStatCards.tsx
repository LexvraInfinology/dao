'use client';

import React from 'react';
import { User, Clock, Users, AppWindow } from 'lucide-react';
import { useDaoStats, useTrobPrice } from '@/hooks/useApi';

export const CouncilStatCards: React.FC = () => {
  const { data: stats } = useDaoStats(30_000);
  const { data: price } = useTrobPrice(30_000);

  const seatsFilled    = stats?.memberCount ?? 0;
  const seatsRemaining = stats?.remainingPositions ?? (100 - seatsFilled);
  const filledPct      = Math.min(100, Math.round((seatsFilled / 100) * 100));
  const nextSeat       = seatsFilled + 1;
  const cashback       = (300 / Math.max(1, nextSeat)).toFixed(2);
  const entryTrob      = price ? price.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';
  return (
    <div className="w-full">
      {/* ── Desktop grid ─────────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Seats Remaining */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#0B1528] text-white flex items-center justify-center shadow-xs">
              <AppWindow className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#0B132B]">
                {seatsRemaining}{' '}
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Seats Remaining</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-jakarta">{seatsFilled} seats claimed</span>
            <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-2 overflow-hidden flex items-center p-0.5 border border-slate-200/60">
              <div className="h-full bg-gradient-to-r from-[#155EEF] to-[#2563EB] rounded-full transition-all duration-700" style={{ width: `${filledPct}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2: Next Seat in Line */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#155EEF] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#0B132B]">#{nextSeat}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Next Available in Line</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-jakarta">
            <span className="text-emerald-700 font-semibold">
              Cashback: <strong className="text-[#0B132B] font-black">${cashback}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#155EEF] font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
              Open to Mint
            </span>
          </div>
        </div>

        {/* Card 3: Entry Amount */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-xl lg:text-[22px] font-black font-jakarta text-[#0B132B]">{entryTrob} TROB</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Seat Entry Amount</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-jakarta">
            <span className="text-slate-500">Fixed $300 Equivalent</span>
            <span className="text-[#155EEF] font-bold">300/N Algorithmic Return</span>
          </div>
        </div>

        {/* Card 4: Referrals */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#0B132B]">0</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Referrals Required</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-jakarta gap-1 flex-wrap">
            <span className="text-emerald-700 font-semibold text-[11px]">Permissionless</span>
            <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% Soulbound</span>
          </div>
        </div>
      </div>

      {/* ── Mobile horizontal scroll ──────────────────────────────────── */}
      <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-3 xs:-mx-4 sm:mx-0 px-3 xs:px-4 sm:mx-0">
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-slate-200 shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#0B132B]">
              {seatsRemaining} <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <div className="text-xs text-slate-500 font-jakarta mt-0.5">Remaining</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-[#155EEF] rounded-full transition-all" style={{ width: `${filledPct}%` }} />
          </div>
        </div>
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-slate-200 shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#155EEF]">#{nextSeat}</div>
            <div className="text-xs text-slate-500 font-jakarta mt-0.5">Next in Line</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open to Mint</span>
          </div>
        </div>
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-slate-200 shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#0B132B]">{entryTrob}</div>
            <div className="text-xs text-slate-500 font-jakarta mt-0.5">Entry (TROB)</div>
          </div>
          <div className="text-xs text-slate-500 font-jakarta">≈ $300 USD</div>
        </div>
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-slate-200 shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#0B132B]">0</div>
            <div className="text-xs text-slate-500 font-jakarta mt-0.5">Referrals Req.</div>
          </div>
          <div className="text-xs text-emerald-700 font-semibold">Zero Required</div>
        </div>
      </div>
    </div>
  );
};
