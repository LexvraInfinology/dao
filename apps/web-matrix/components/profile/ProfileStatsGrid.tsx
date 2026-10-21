"use client";

import React from "react";
import { MatrixUserProfile } from "@/lib/api";
import { useUserStore } from "@/lib/stores";

export interface ProfileStatsGridProps {
  profile?: MatrixUserProfile | null;
}

export function ProfileStatsGrid(props: ProfileStatsGridProps = {}) {
  const storeProfile = useUserStore((s) => s.profile);
  const profile = props.profile !== undefined ? props.profile : storeProfile;
  const directPartners = profile?.directReferralsCount ?? 4;
  const cycles = profile?.recyclesCount ?? 12;
  const totalVolume = profile?.totalEarnings ?? 4250.0;
  const rank = profile?.rankName || "Operative";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
      {/* Direct Partners */}
      <div className="bg-white rounded-[20px] border border-[#e8ecf1] p-4 lg:p-5 flex flex-col justify-between shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-3 text-[#2563eb]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div>
          <div className="text-[28px] lg:text-[32px] font-black text-[#0f172a] leading-none mb-1.5">{directPartners}</div>
          <div className="text-[13px] font-bold text-[#0f172a] leading-tight">Direct Partners</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">L1 personally invited</div>
        </div>
      </div>

      {/* Matrix Cycles */}
      <div className="bg-white rounded-[20px] border border-[#e8ecf1] p-4 lg:p-5 flex flex-col justify-between shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-3 text-[#2563eb]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </div>
        <div>
          <div className="text-[28px] lg:text-[32px] font-black text-[#0f172a] leading-none mb-1.5">{cycles}</div>
          <div className="text-[13px] font-bold text-[#0f172a] leading-tight">Matrix Cycles</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">14-node board resets</div>
        </div>
      </div>

      {/* Total Volume */}
      <div className="bg-white rounded-[20px] border border-[#e8ecf1] p-4 lg:p-5 flex flex-col justify-between shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-3 text-[#2563eb]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
        </div>
        <div>
          <div className="text-[24px] lg:text-[28px] font-black text-[#0f172a] leading-none mb-1.5">{totalVolume.toFixed(2)}</div>
          <div className="text-[13px] font-bold text-[#0f172a] leading-tight">Total Volume</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">TROB</div>
        </div>
      </div>

      {/* Global Rank */}
      <div className="bg-white rounded-[20px] border border-[#e8ecf1] p-4 lg:p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0]">
            Verified
          </span>
        </div>
        <div>
          <div className="text-[20px] lg:text-[24px] font-black text-[#0f172a] leading-none mb-1.5 truncate">
            {rank}
          </div>
          <div className="text-[13px] font-bold text-[#0f172a] leading-tight">Rank Status</div>
          <div className="text-[11px] text-[#64748b] mt-0.5">Matrix protocol tier</div>
        </div>
      </div>
    </div>
  );
}
