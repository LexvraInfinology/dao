"use client";

import React from "react";
import { useUserStore } from "@/lib/stores";
import { toTrobBase58 } from "@/lib/format";

export function WelcomeBanner() {
  const profile = useUserStore((s) => s.profile);
  const sponsor = profile?.sponsorAddress;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-5 sm:mb-6 gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="w-[6px] h-[6px] rounded-full bg-[#2563eb]" />
          <span className="text-[11px] font-bold text-[#2563eb] tracking-[0.08em] uppercase">
            WELCOME TO EQUORAFI MATRIX
          </span>
          {sponsor && sponsor !== "0x0000000000000000000000000000000000000000" && (
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <span>• Sponsor:</span>
              <span className="font-mono font-bold text-[#2563eb]">
                {profile?.sponsorCode ? `#${profile.sponsorCode} • ` : ""}{toTrobBase58(sponsor).slice(0, 5)}...{toTrobBase58(sponsor).slice(-4)}
              </span>
            </span>
          )}
        </div>
        <h1 className="text-[24px] sm:text-[30px] lg:text-[36px] font-extrabold text-[#0f172a] leading-[1.2] tracking-tight mb-1">
          The Matrix. <span className="text-[#2563eb]">Built to Move.</span>
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#64748b] leading-relaxed max-w-[480px]">
          Track your position, matrix progress and earnings from one place.
        </p>
      </div>
      <div className="hidden lg:flex flex-col items-end mt-1 shrink-0 text-right">
        <span className="text-[11px] font-bold text-[#475569] tracking-[0.06em] uppercase">
          PEOPLE / PROTOCOL / PROGRESS
        </span>
        <span className="text-[12px] text-[#94a3b8] mt-0.5">
          TrobChain Network • Cycle 01
        </span>
      </div>
    </div>
  );
}
