"use client";

import React from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

export interface MatrixTreePanelProps {
  data?: MatrixDashboardOverview | null;
}

const SEAT_CONFIG: Record<
  number,
  { label: string; role: string; type: "income" | "pool" | "upline" | "downline" }
> = {
  1: { label: "P1", role: "Upline 1", type: "upline" },
  2: { label: "P2", role: "Upline 2", type: "upline" },
  3: { label: "P3", role: "+$30 YOU", type: "income" },
  4: { label: "P4", role: "4 Pools", type: "pool" },
  5: { label: "P5", role: "4 Pools", type: "pool" },
  6: { label: "P6", role: "+$30 YOU", type: "income" },
  7: { label: "P7", role: "Row 1 Downline", type: "downline" },
  8: { label: "P8", role: "+$30 YOU", type: "income" },
  9: { label: "P9", role: "+$30 YOU", type: "income" },
  10: { label: "P10", role: "Row 1 Downline", type: "downline" },
  11: { label: "P11", role: "+$30 YOU", type: "income" },
  12: { label: "P12", role: "+$30 YOU", type: "income" },
  13: { label: "P13", role: "Row 2 Downline", type: "downline" },
  14: { label: "P14", role: "Pools & Recycle", type: "pool" },
};

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
    if (n.code) return `#${n.code}`;
    if (n.placedUser) return formatAddress(toTrobBase58(n.placedUser));
    return `ID #${pos}`;
  };

  const sponsor = profile?.sponsorAddress || data?.sponsorAddress;
  const isVaultSponsor =
    !sponsor ||
    sponsor.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
    (sponsor.startsWith("T") && toTrobBase58(CONTRACT_ADDRESSES.vault) === sponsor);

  const renderSeat = (pos: number) => {
    const filled = isNodeFilled(pos);
    const occupant = getNodeOccupant(pos);
    const cfg = SEAT_CONFIG[pos];

    let badgeClass = "bg-[#f0f4f8] text-[#637890] border-transparent";
    let seatBorder = "border-[#dce7f5] bg-white";

    if (filled) {
      if (cfg.type === "income") {
        seatBorder = "border-[#a9e7d1] bg-gradient-to-b from-white to-[#effdf7] shadow-xs";
        badgeClass = "bg-[#d8f8eb] text-[#0b956d] border-[#b6ebd5]";
      } else if (cfg.type === "pool") {
        seatBorder = "border-[#f5dfaa] bg-gradient-to-b from-white to-[#fff9e9] shadow-xs";
        badgeClass = "bg-[#fff0c8] text-[#a96c0a] border-[#f3d99b]";
      } else if (cfg.type === "downline") {
        seatBorder = "border-[#d2c9ff] bg-gradient-to-b from-white to-[#f7f5ff] shadow-xs";
        badgeClass = "bg-[#e9e3ff] text-[#7253d7] border-[#d7cbff]";
      } else {
        seatBorder = "border-[#b7d4ff] bg-gradient-to-b from-white to-[#f5f9ff] shadow-xs";
        badgeClass = "bg-[#e7f1ff] text-[#1758cc] border-[#cde0ff]";
      }
    }

    return (
      <div
        key={pos}
        className={`relative flex-1 min-w-[70px] max-w-[125px] min-h-[85px] sm:min-h-[92px] rounded-2xl border p-2 text-center flex flex-col items-center justify-between gap-1 transition-all ${seatBorder}`}
      >
        <span className="absolute top-1.5 left-2 text-[9px] font-black text-[#8a9eb8]">
          {cfg.label}
        </span>
        <div
          className={`w-[26px] h-[26px] rounded-lg mt-3 flex items-center justify-center text-[11px] font-bold ${
            filled ? "bg-[#e7f1ff] text-[#2868e8]" : "bg-[#f0f5fc] text-[#8ca0ba]"
          }`}
        >
          {filled ? "✓" : "+"}
        </div>
        <div className="w-full">
          <div className="text-[10px] sm:text-[11px] font-extrabold text-[#102341] truncate px-1">
            {filled ? occupant || "Filled" : "Available"}
          </div>
          <span
            className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md border inline-block mt-0.5 truncate max-w-full ${badgeClass}`}
          >
            {cfg.role}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e0eaf7] p-3.5 sm:p-5 lg:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] lg:text-[19px] font-black text-[#102341] tracking-tight">
              MATRIX VISUALIZER
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e7f1ff] text-[#1758cc] border border-[#cde0ff]">
              14-Seat Engine
            </span>
          </div>
          <p className="text-[11.5px] text-[#657895] mt-0.5">
            Slot #{slotStr} • {filledCount} / 14 Placed • $30 P2P Settlement Rule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#ecfbf5] text-[#15815f] border border-[#b4e9d6]">
            Cycle 01
          </span>
        </div>
      </div>

      {/* Matrix Shell Container */}
      <div className="bg-gradient-to-br from-[#f6faff] to-[#edf5ff] border border-[#dfebfa] rounded-2xl p-4 sm:p-6">
        {/* Sponsor Banner */}
        <div className="flex justify-center mb-3">
          {isVaultSponsor ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cbdfff] shadow-xs text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#2868e8]" />
              <span className="text-[#657895] font-semibold">Upline Sponsor:</span>
              <span className="font-bold text-[#102341]">Protocol Vault (4 Streams)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#cbdfff] shadow-xs text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#0e9f79]" />
              <span className="text-[#657895] font-semibold">Sponsor:</span>
              <span className="font-mono font-bold text-[#102341]">
                {profile?.sponsorCode ? `#${profile.sponsorCode} • ` : ""}
                {formatAddress(toTrobBase58(sponsor))}
              </span>
            </div>
          )}
        </div>

        {/* Root Node (YOU) */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-[#cbdfff] shadow-sm text-[12px] font-black text-[#102341]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2868e8] shadow-[0_0_0_4px_#e6f0ff]" />
            <span>YOU: ROOT OPERATIVE (SEAT 1)</span>
          </div>
        </div>

        {/* Row 1: Seats 1 and 2 */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-2.5">
          {renderSeat(1)}
          {renderSeat(2)}
        </div>

        {/* Row 2: Seats 3, 4, 5, 6 */}
        <div className="flex justify-center gap-1.5 sm:gap-2.5 mb-2.5">
          {renderSeat(3)}
          {renderSeat(4)}
          {renderSeat(5)}
          {renderSeat(6)}
        </div>

        {/* Row 3: Seats 7 to 14 */}
        <div className="grid grid-cols-4 sm:flex sm:justify-center gap-1.5 sm:gap-2">
          {renderSeat(7)}
          {renderSeat(8)}
          {renderSeat(9)}
          {renderSeat(10)}
          {renderSeat(11)}
          {renderSeat(12)}
          {renderSeat(13)}
          {renderSeat(14)}
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-[#edf2f8]">
        <div className="bg-white border border-[#e0eaf7] rounded-xl p-2.5">
          <div className="h-1 rounded-full bg-[#2868e8] mb-1.5" />
          <div className="text-[12px] font-black text-[#102341]">Uplines (P1, P2)</div>
          <div className="text-[10px] text-[#657895] mt-0.5">Sponsor & Ancestor Level</div>
        </div>
        <div className="bg-white border border-[#e0eaf7] rounded-xl p-2.5">
          <div className="h-1 rounded-full bg-[#0e9f79] mb-1.5" />
          <div className="text-[12px] font-black text-[#102341]">YOU (6 Positions)</div>
          <div className="text-[10px] text-[#657895] mt-0.5">P3, P6, P8, P9, P11, P12 ($180)</div>
        </div>
        <div className="bg-white border border-[#e0eaf7] rounded-xl p-2.5">
          <div className="h-1 rounded-full bg-[#b97a17] mb-1.5" />
          <div className="text-[12px] font-black text-[#102341]">4 Pools (P4, P5, P14)</div>
          <div className="text-[10px] text-[#657895] mt-0.5">DAO · Salary · Rank · Magic Box</div>
        </div>
        <div className="bg-white border border-[#e0eaf7] rounded-xl p-2.5">
          <div className="h-1 rounded-full bg-[#7256d8] mb-1.5" />
          <div className="text-[12px] font-black text-[#102341]">Downlines (P7, P10, P13)</div>
          <div className="text-[10px] text-[#657895] mt-0.5">Row 1 & Row 2 Team Spillover</div>
        </div>
      </div>
    </div>
  );
}
