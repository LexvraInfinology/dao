"use client";

import React from "react";
import { useUserStore } from "@/lib/stores";
import { toTrobBase58 } from "@/lib/format";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

export function WelcomeBanner() {
  const profile = useUserStore((s) => s.profile);
  const sponsor = profile?.sponsorAddress;

  const isVaultSponsor = Boolean(
    profile?.isVaultSponsor ||
    (sponsor &&
      (sponsor.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
        (sponsor.startsWith("T") && toTrobBase58(CONTRACT_ADDRESSES.vault) === sponsor)))
  );

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-3 sm:mb-3.5 gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="w-[6px] h-[6px] rounded-full bg-[#2563eb]" />
          <span className="text-[10.5px] font-bold text-[#2563eb] tracking-[0.08em] uppercase">
            WELCOME TO EQUORAFI MATRIX
          </span>
          {isVaultSponsor ? (
            <span className="text-[10.5px] font-semibold text-slate-500 flex items-center gap-1">
              <span>• Genesis Root:</span>
              <span className="font-mono font-bold text-[#2563eb]">
                Protocol Vault (Apex Root)
              </span>
            </span>
          ) : sponsor && sponsor !== "0x0000000000000000000000000000000000000000" ? (
            <span className="text-[10.5px] font-semibold text-slate-500 flex items-center gap-1">
              <span>• Sponsor:</span>
              <span className="font-mono font-bold text-[#2563eb]">
                {profile?.sponsorCode ? `#${profile.sponsorCode} • ` : ""}{toTrobBase58(sponsor).slice(0, 5)}...{toTrobBase58(sponsor).slice(-4)}
              </span>
            </span>
          ) : null}
        </div>
        <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] font-extrabold text-[#0f172a] leading-[1.2] tracking-tight mb-0.5">
          The Matrix. <span className="text-[#2563eb]">Built to Move.</span>
        </h1>
        <p className="text-[12px] sm:text-[12.5px] text-[#64748b] leading-relaxed max-w-[480px]">
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
