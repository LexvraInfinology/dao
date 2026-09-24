'use client';

import React from 'react';
import { User, Clock, Users, AppWindow } from 'lucide-react';

export const CouncilStatCards: React.FC = () => {
  return (
    <div className="w-full">
      {/* ===================== DESKTOP / TABLET (Grid) ===================== */}
      <div className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Seats Remaining */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex flex-col justify-between space-y-4 hover:border-[#BFDBFE] transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] border border-[#BFDBFE]/60 flex items-center justify-center text-[#155EEF]">
              <AppWindow className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#071A4A]">
                14 <span className="text-sm font-normal text-[#94A3B8]">/ 100</span>
              </div>
              <div className="text-xs font-semibold text-[#60739A] mt-0.5">
                Seats Remaining
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-[#60739A] font-jakarta">86 seats filled</span>
            <div className="w-24 sm:w-28 bg-[#E2ECF9] rounded-full h-2 overflow-hidden flex items-center p-0.5">
              <div className="h-full bg-[#155EEF] rounded-full w-[86%]" />
            </div>
          </div>
        </div>

        {/* Card 2: Next Seat in Line */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex flex-col justify-between space-y-4 hover:border-[#BFDBFE] transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] border border-[#BFDBFE]/60 flex items-center justify-center text-[#155EEF]">
              <User className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#071A4A]">
                87
              </div>
              <div className="text-xs font-semibold text-[#60739A] mt-0.5">
                Next Seat in Line
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-jakarta">
            <span className="text-[#047857] font-semibold">
              Instant Cashback: <strong className="text-[#071A4A]">$3.45</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Ready
            </span>
          </div>
        </div>

        {/* Card 3: Entry Amount */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex flex-col justify-between space-y-4 hover:border-[#BFDBFE] transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] border border-[#BFDBFE]/60 flex items-center justify-center text-[#155EEF]">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#071A4A]">
                $300 TROB
              </div>
              <div className="text-xs font-semibold text-[#60739A] mt-0.5">
                Entry Amount
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-jakarta">
            <span className="text-[#60739A] leading-tight">
              Fixed 100–Seat<br />Supply
            </span>
            <span className="text-right text-[#155EEF] font-bold leading-tight">
              300/N<br />Algorithmic
            </span>
          </div>
        </div>

        {/* Card 4: Referrals Required */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex flex-col justify-between space-y-4 hover:border-[#BFDBFE] transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] border border-[#BFDBFE]/60 flex items-center justify-center text-[#155EEF]">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-2xl lg:text-[26px] font-black font-jakarta text-[#071A4A]">
                0
              </div>
              <div className="text-xs font-semibold text-[#60739A] mt-0.5">
                Referrals Required
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-jakarta gap-1 flex-wrap">
            <span className="text-[#047857] font-semibold text-[11px] sm:text-xs">100% Permissionless</span>
            <span className="text-[#047857] font-semibold text-[11px] sm:text-xs">Soulbound</span>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE HORIZONTAL SCROLL ===================== */}
      <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-3 xs:-mx-4 sm:mx-0 px-3 xs:px-4 sm:px-0">
        {/* Mobile Card 1 */}
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-[#E2ECF9] shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#071A4A]">
              14 <span className="text-xs font-normal text-[#94A3B8]">/100</span>
            </div>
            <div className="text-xs text-[#60739A] font-jakarta mt-0.5">Remaining</div>
          </div>
          <div className="w-full bg-[#E2ECF9] rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-[#155EEF] rounded-full w-[86%]" />
          </div>
        </div>

        {/* Mobile Card 2 */}
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-[#E2ECF9] shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#155EEF]">87</div>
            <div className="text-xs text-[#60739A] font-jakarta mt-0.5">Next in Line</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Queue Active</span>
          </div>
        </div>

        {/* Mobile Card 3 */}
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-[#E2ECF9] shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#071A4A]">$300</div>
            <div className="text-xs text-[#60739A] font-jakarta mt-0.5">Entry Value</div>
          </div>
          <div className="text-xs text-[#60739A] font-jakarta">TROB Fixed</div>
        </div>

        {/* Mobile Card 4 */}
        <div className="min-w-[155px] p-4 rounded-2xl bg-white border border-[#E2ECF9] shadow-xs snap-start flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xl font-black font-jakarta text-[#071A4A]">0</div>
            <div className="text-xs text-[#60739A] font-jakarta mt-0.5">Referrals Req.</div>
          </div>
          <div className="text-xs text-[#047857] font-semibold">Zero Required</div>
        </div>
      </div>
    </div>
  );
};
