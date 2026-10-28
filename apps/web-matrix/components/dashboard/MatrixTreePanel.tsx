"use client";

import React from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58 } from "@/lib/format";

export interface MatrixTreePanelProps {
  data?: MatrixDashboardOverview | null;
}

export function MatrixTreePanel({ data: propData }: MatrixTreePanelProps = {}) {
  const storeDashboard = useMatrixStore((s) => s.dashboard);
  const slotDetails = useMatrixStore((s) => s.slotDetails);
  const profile = useUserStore((s) => s.profile);
  const data = propData !== undefined ? propData : storeDashboard;

  const currentSlot = data?.currentSlot ?? 1;
  const slotStr = currentSlot.toString().padStart(2, "0");
  const filledCount = slotDetails?.filledNodes ?? (data?.activeSlotProgress?.filledNodes ?? 0);
  const nodes = slotDetails?.nodes || data?.activeSlotProgress?.nodes || [];

  const isNodeFilled = (pos: number) => {
    if (nodes[pos - 1]?.filled) return true;
    return pos <= filledCount;
  };

  const getNodeOccupant = (pos: number) => {
    const n = nodes[pos - 1];
    if (!n || !n.filled) return null;
    if (n.code) return `Operative #${n.code}`;
    if (n.placedUser) return formatAddress(toTrobBase58(n.placedUser));
    return `Operative P${pos}`;
  };

  // Upline / Sponsor display
  const sponsor = profile?.sponsorAddress || data?.sponsorAddress;
  const isVaultSponsor =
    !sponsor ||
    sponsor.toLowerCase() === "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9" ||
    sponsor.toLowerCase() === "415181d06090f16c9bffef71e2ccd7ed17f676aad9";
  const upline2 = profile?.upline2Address;

  return (
    <div className="bg-white rounded-2xl border border-[#e8ecf1] p-3.5 sm:p-4 lg:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] lg:text-[19px] font-extrabold text-[#0f172a] tracking-tight">YOUR MATRIX</h2>
            <span className="hidden sm:inline-flex w-[18px] h-[18px] rounded-full bg-[#eff6ff] items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" stroke="#2563eb" strokeWidth="1" />
                <path d="M5 4v3M5 2.5v.5" stroke="#2563eb" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            14–Node Progression • Slot {slotStr} ({filledCount}/14 Filled)
          </p>
        </div>
        <Link href="/matrix" className="text-[12px] font-semibold text-[#2563eb] flex items-center gap-1 hover:underline">
          View Matrix <span>→</span>
        </Link>
      </div>

      {/* Matrix Tree Visualization */}
      <div className="flex flex-col items-center py-4 lg:py-6">
        {/* UPLINE / SPONSOR NODE ABOVE YOU */}
        <div className="flex flex-col items-center mb-1">
          {isVaultSponsor ? (
            <div className="flex flex-col items-center text-center">
              <div className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700 uppercase text-[9.5px] font-bold tracking-wider">Upline:</span>
                <span className="text-amber-950 font-mono text-[11px] font-bold">
                  Protocol Gateway / 4 Protocol Pools (Root Vault)
                </span>
              </div>
              <span className="text-[9.5px] text-amber-700 font-medium mt-0.5">
                100% Inflow routes directly to 4 Protocol Pools
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[10.5px] font-semibold flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Upline 1 (Sponsor):</span>
                  <span className="text-slate-800 font-mono text-[10.5px] font-bold">
                    {profile?.sponsorCode ? `#${profile.sponsorCode} • ` : ""}{formatAddress(toTrobBase58(sponsor))}
                  </span>
                </div>
                {upline2 && (
                  <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[10.5px] font-semibold flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Upline 2:</span>
                    <span className="text-slate-800 font-mono text-[10.5px] font-bold">
                      {upline2.toLowerCase() === "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9"
                        ? "Protocol Pools (Vault)"
                        : formatAddress(toTrobBase58(upline2))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="w-px h-4 bg-[#cbd5e1]" />
        </div>

        {/* YOU - Root Node */}
        <div className="flex flex-col items-center">
          <div className="px-5 py-[7px] rounded-full bg-[#2563eb] text-white text-[11px] font-extrabold flex items-center gap-2 shadow-md shadow-blue-500/25">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4.5" r="2" stroke="white" strokeWidth="1" />
              <path d="M2.5 10.5c0-1.66 1.57-3 3.5-3s3.5 1.34 3.5 3" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span>YOU (ROOT OWNER)</span>
          </div>
        </div>

        {/* Connector from YOU to SLOT 1 / SLOT 2 */}
        <div className="w-px h-5 bg-[#cbd5e1]" />
        <div className="relative w-full max-w-[420px] lg:max-w-[520px]">
          {/* Horizontal line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-[#cbd5e1]" />
          {/* Left vertical */}
          <div className="absolute top-0 left-1/4 w-px h-5 bg-[#cbd5e1]" />
          {/* Right vertical */}
          <div className="absolute top-0 right-1/4 w-px h-5 bg-[#cbd5e1]" />

          {/* Level 1: Position 1 and 2 */}
          <div className="flex justify-around pt-5 px-4 lg:px-8">
            {/* Position 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`px-3 py-[5px] rounded-full text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                  isNodeFilled(1) ? "bg-[#16a34a]" : "bg-[#94a3b8]"
                }`}
              >
                <span className="w-[5px] h-[5px] rounded-full bg-white" />
                POS 1 <span className="text-white/90 ml-0.5">{isNodeFilled(1) ? "FILLED" : "OPEN"}</span>
              </div>
              {isNodeFilled(1) && (
                <span className="text-[9.5px] font-mono text-emerald-800 font-semibold mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {getNodeOccupant(1) || "Active Direct 1"}
                </span>
              )}
            </div>
            {/* Position 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`px-3 py-[5px] rounded-full text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                  isNodeFilled(2) ? "bg-[#16a34a]" : "bg-[#94a3b8]"
                }`}
              >
                <span className="w-[5px] h-[5px] rounded-full bg-white" />
                POS 2 <span className="text-white/90 ml-0.5">{isNodeFilled(2) ? "FILLED" : "OPEN"}</span>
              </div>
              {isNodeFilled(2) && (
                <span className="text-[9.5px] font-mono text-emerald-800 font-semibold mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {getNodeOccupant(2) || "Active Direct 2"}
                </span>
              )}
            </div>
          </div>

          {/* Connector lines from Level 1 to Level 2 */}
          <div className="relative mt-2 mb-1">
            <svg className="absolute left-0 w-1/2 h-5" viewBox="0 0 200 20" preserveAspectRatio="none" fill="none">
              <path d="M100 0v8M100 8H60v12M100 8H140v12" stroke="#cbd5e1" strokeWidth="1.2" />
            </svg>
            <svg className="absolute right-0 w-1/2 h-5" viewBox="0 0 200 20" preserveAspectRatio="none" fill="none">
              <path d="M100 0v8M100 8H60v12M100 8H140v12" stroke="#cbd5e1" strokeWidth="1.2" />
            </svg>
            <div className="h-5" />
          </div>

          {/* Level 2: Nodes 3, 4, 5, 6 */}
          <div className="flex justify-around px-0 lg:px-2 gap-1.5 sm:gap-2">
            {[3, 4, 5, 6].map((n) => {
              const filled = isNodeFilled(n);
              const isDirectIncome = n === 3 || n === 6;
              const occupant = getNodeOccupant(n);
              return (
                <div key={n} className="flex flex-col items-center min-w-0">
                  <div
                    className={`w-[44px] xs:w-[50px] sm:w-[56px] lg:w-[64px] h-[32px] sm:h-[34px] lg:h-[38px] rounded-lg flex items-center justify-between px-1.5 sm:px-2 text-[11px] sm:text-[12px] font-bold transition-all shadow-xs ${
                      filled
                        ? isDirectIncome
                          ? "bg-[#16a34a] text-white ring-1 ring-emerald-400"
                          : "bg-[#7c3aed] text-white ring-1 ring-purple-400"
                        : "bg-white border-2 border-[#cbd5e1] text-[#94a3b8]"
                    }`}
                  >
                    <span>{n}</span>
                    <span
                      className={`w-[13px] h-[13px] rounded flex items-center justify-center text-[8.5px] ${
                        filled ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#94a3b8]"
                      }`}
                    >
                      {filled ? "✓" : "+"}
                    </span>
                  </div>
                  {filled ? (
                    <span className="text-[8.5px] font-mono text-slate-700 font-bold mt-1 max-w-[64px] truncate text-center">
                      {occupant || (isDirectIncome ? "+$30 USD" : "Pool")}
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-mono text-slate-400 mt-1">
                      {isDirectIncome ? "Direct $30" : "Auto-Tier"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connector lines from Level 2 to Level 3 */}
          <div className="relative mt-2 mb-1">
            <svg className="w-full h-4" viewBox="0 0 500 16" preserveAspectRatio="none" fill="none">
              <path d="M62.5 0v16M125 0v16M187.5 0v16M250 0v16M312.5 0v16M375 0v16M437.5 0v16" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Level 3: Nodes 7-14 */}
          <div className="flex justify-around px-0 gap-1">
            {[7, 8, 9, 10, 11, 12, 13, 14].map((n) => {
              const filled = isNodeFilled(n);
              const isDirectIncome = n === 8 || n === 9 || n === 11 || n === 12;
              return (
                <div
                  key={n}
                  title={`Position #${n} (${isDirectIncome ? "Direct $30 Income" : n === 14 ? "Tier Upgrade / Pool" : "Downline Spillover"})`}
                  className={`w-[24px] xs:w-[26px] sm:w-[34px] lg:w-[44px] h-[24px] xs:h-[26px] sm:h-[28px] lg:h-[32px] rounded-md sm:rounded-lg flex items-center justify-center text-[9.5px] xs:text-[10px] sm:text-[11px] lg:text-[12px] font-bold transition-all shadow-xs ${
                    filled
                      ? isDirectIncome
                        ? "bg-[#16a34a] text-white"
                        : "bg-[#2563eb] text-white"
                      : "bg-white border border-[#e2e8f0] text-[#94a3b8]"
                  }`}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Legend + Sync */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#f1f5f9] gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-[8px] h-[8px] rounded-full bg-[#16a34a]" />
            <span className="text-[11px] text-[#64748b] font-medium">Direct $30 Payout (P3, P6, P8, P9, P11, P12)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-[8px] h-[8px] rounded-full bg-[#7c3aed]" />
            <span className="text-[11px] text-[#64748b] font-medium">Protocol Pools / Tier Upgrade</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-[8px] h-[8px] rounded-full bg-white border-2 border-[#cbd5e1]" />
            <span className="text-[11px] text-[#64748b] font-medium">Open Position</span>
          </div>
        </div>
        <span className="text-[10px] text-[#94a3b8] font-medium tracking-wide uppercase">
          SYNC: REALTIME ON-CHAIN
        </span>
      </div>
    </div>
  );
}
