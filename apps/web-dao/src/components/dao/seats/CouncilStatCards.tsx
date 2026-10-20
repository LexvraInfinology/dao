'use client';

import React from 'react';
import { User, Clock, Users, AppWindow } from 'lucide-react';
import { useDaoStats, useTrobPrice } from '@/hooks/useApi';

export const CouncilStatCards: React.FC = () => {
  const { data: stats, loading: statsLoading } = useDaoStats(30_000);
  const { data: price } = useTrobPrice(30_000);

  const isLoaded       = !statsLoading && stats !== null && stats !== undefined && stats.memberCount !== undefined && stats.memberCount > 0;
  const seatsFilled    = stats?.memberCount ?? 0;
  const seatsRemaining = stats?.remainingPositions ?? (100 - seatsFilled);
  const filledPct      = Math.min(100, Math.round((seatsFilled / 100) * 100));
  const nextSeat       = (stats as any)?.nextAvailableSeat ?? Math.min(100, seatsFilled + 1);
  const cashback       = (300 / Math.max(1, nextSeat)).toFixed(2);
  const entryTrob      = price ? price.seatEntryTrob.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';
  return (
    <div className="w-full">
      {/* ── Responsive grid: 2 cols on mobile, 4 cols on desktop ─────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3.5">
        {/* Card 1: Seats Remaining */}
        <div className="p-2.5 xs:p-3 sm:p-4 rounded-xl bg-white border border-[#E2EEF9] shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2 xs:space-y-2.5 hover:border-[#0E62E4]/40 transition-colors min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
              <AppWindow className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </div>
            <div className="text-right min-w-0">
              <div className="text-base xs:text-lg sm:text-xl font-bold font-sans text-[#14304A] truncate">
                {!isLoaded ? (
                  <span className="inline-block w-14 h-5 xs:h-6 bg-[#EFF6FF] rounded animate-pulse" />
                ) : (
                  <>
                    {seatsRemaining}{' '}
                    <span className="text-[10px] xs:text-xs font-normal text-slate-400">/ 100</span>
                  </>
                )}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-[#4F6D87] truncate">Seats Remaining</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E2EEF9]/60 flex items-center justify-between gap-1.5 min-w-0">
            {!isLoaded ? (
              <span className="inline-block w-16 h-3 bg-[#EFF6FF] rounded animate-pulse" />
            ) : (
              <span className="text-[10px] text-[#4F6D87] shrink-0 whitespace-nowrap">{seatsFilled} claimed</span>
            )}
            <div className="flex-1 min-w-[32px] max-w-[64px] sm:max-w-[80px] bg-[#E2EEF9] rounded-full h-1.5 overflow-hidden flex items-center">
              <div className="h-full bg-[#0E62E4] rounded-full transition-all duration-700" style={{ width: `${!isLoaded ? 10 : filledPct}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2: Next Seat in Line */}
        <div className="p-2.5 xs:p-3 sm:p-4 rounded-xl bg-white border border-[#E2EEF9] shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2 xs:space-y-2.5 hover:border-[#0E62E4]/40 transition-colors min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </div>
            <div className="text-right min-w-0">
              <div className="text-base xs:text-lg sm:text-xl font-bold font-sans text-[#14304A] truncate">
                {!isLoaded ? (
                  <span className="inline-block w-10 h-5 xs:h-6 bg-[#EFF6FF] rounded animate-pulse" />
                ) : (
                  `#${nextSeat}`
                )}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-[#4F6D87] truncate">Next in Line</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E2EEF9]/60 flex items-center justify-between gap-1 text-[10px] sm:text-xs min-w-0">
            <span className="text-emerald-700 font-medium truncate">
              {!isLoaded ? (
                <span className="inline-block w-14 h-3 bg-[#EFF6FF] rounded animate-pulse" />
              ) : (
                <>Back: <strong className="text-[#14304A]">${cashback}</strong></>
              )}
            </span>
            <span className="inline-flex items-center gap-1 text-[#0E62E4] font-semibold bg-[#EFF6FF] px-1.5 py-0.5 rounded text-[10px] shrink-0">
              <span className="w-1 h-1 rounded-full bg-[#0E62E4] animate-pulse" />
              Open
            </span>
          </div>
        </div>

        {/* Card 3: Entry Amount */}
        <div className="p-2.5 xs:p-3 sm:p-4 rounded-xl bg-white border border-[#E2EEF9] shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2 xs:space-y-2.5 hover:border-[#0E62E4]/40 transition-colors min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </div>
            <div className="text-right min-w-0">
              <div className="text-base xs:text-lg sm:text-xl font-bold font-sans text-[#14304A] truncate">$300 USD</div>
              <div className="text-[10px] sm:text-xs font-medium text-[#4F6D87] truncate">Seat Entry Cost</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E2EEF9]/60 flex items-center justify-between text-[10px] gap-1 min-w-0">
            <span className="text-[#4F6D87] whitespace-nowrap">Fixed Cost</span>
            <span className="text-[#0E62E4] font-medium whitespace-nowrap">300/N Return</span>
          </div>
        </div>

        {/* Card 4: Referrals */}
        <div className="p-2.5 xs:p-3 sm:p-4 rounded-xl bg-white border border-[#E2EEF9] shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex flex-col justify-between space-y-2 xs:space-y-2.5 hover:border-[#0E62E4]/40 transition-colors min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </div>
            <div className="text-right min-w-0">
              <div className="text-base xs:text-lg sm:text-xl font-bold font-sans text-[#14304A] truncate">0</div>
              <div className="text-[10px] sm:text-xs font-medium text-[#4F6D87] truncate">Referrals Req.</div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#E2EEF9]/60 flex items-center justify-between text-[10px] gap-1 min-w-0">
            <span className="text-emerald-700 font-medium whitespace-nowrap">Open to All</span>
            <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
              Soulbound
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
