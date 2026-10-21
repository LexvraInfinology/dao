"use client";

import React, { useState } from "react";
import { CrownBadge } from "./CrownBadge";

export interface LeaderboardNode {
  rank: number;
  id: string;
  address: string;
  slot: string;
  slotTheme: "amber" | "blue" | "slate";
  directPartners: number;
  matrixCycles: number;
  totalVolume: number;
  trend7d: number;
  volumeDisplay: string;
}

import { MatrixLeaderboardEntry } from "@/lib/api";

export interface LeaderboardRankingsTableProps {
  handleCopy: (address: string) => void;
  copiedAddress: string | null;
  entries?: MatrixLeaderboardEntry[];
}

export function LeaderboardRankingsTable({ handleCopy, copiedAddress, entries }: LeaderboardRankingsTableProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const defaultNodes: LeaderboardNode[] = [
    {
      rank: 1,
      id: "#10001",
      address: "0x9A2C...F3c1",
      slot: "SLOT 7",
      slotTheme: "amber",
      directPartners: 1245,
      matrixCycles: 128,
      totalVolume: 45200.0,
      trend7d: 12.4,
      volumeDisplay: "45,200.00 TROB",
    },
    {
      rank: 2,
      id: "#10024",
      address: "0x3B8D...E1a9",
      slot: "SLOT 8",
      slotTheme: "blue",
      directPartners: 982,
      matrixCycles: 94,
      totalVolume: 38150.0,
      trend7d: 8.7,
      volumeDisplay: "38,150.00 TROB",
    },
    {
      rank: 3,
      id: "#10008",
      address: "0x6F7D...2B9e",
      slot: "SLOT 10",
      slotTheme: "blue",
      directPartners: 840,
      matrixCycles: 76,
      totalVolume: 31000.0,
      trend7d: -1.2,
      volumeDisplay: "31,000.00 TROB",
    },
    {
      rank: 4,
      id: "#10012",
      address: "0x4A9E...7D2c",
      slot: "SLOT 9",
      slotTheme: "blue",
      directPartners: 620,
      matrixCycles: 46,
      totalVolume: 24850.5,
      trend7d: 5.2,
      volumeDisplay: "24,850.50 TROB",
    },
    {
      rank: 5,
      id: "#10019",
      address: "0x2C8F...A6b1",
      slot: "SLOT 6",
      slotTheme: "slate",
      directPartners: 514,
      matrixCycles: 38,
      totalVolume: 19420.0,
      trend7d: 3.1,
      volumeDisplay: "19,420.00 TROB",
    },
    {
      rank: 6,
      id: "#10033",
      address: "0x7D1E...9C4a",
      slot: "SLOT 5",
      slotTheme: "slate",
      directPartners: 468,
      matrixCycles: 32,
      totalVolume: 16780.75,
      trend7d: 2.8,
      volumeDisplay: "16,780.75 TROB",
    },
    {
      rank: 7,
      id: "#10041",
      address: "0x9F3B...1E8d",
      slot: "SLOTE 4",
      slotTheme: "slate",
      directPartners: 402,
      matrixCycles: 28,
      totalVolume: 14620.0,
      trend7d: -0.6,
      volumeDisplay: "14,620.00 TROB",
    },
  ];

  const rankingNodes: LeaderboardNode[] =
    entries && entries.length > 0
      ? entries.map((e) => ({
          rank: e.rank,
          id: `#${e.userId}`,
          address: `${e.address.slice(0, 6)}...${e.address.slice(-4)}`,
          slot: `SLOT ${e.highestSlot}`,
          slotTheme: e.highestSlot >= 8 ? "amber" : "blue",
          directPartners: e.directCount,
          matrixCycles: Math.max(Math.floor(e.totalEarned / 120), 1),
          totalVolume: e.totalEarned,
          trend7d: 12.4,
          volumeDisplay: `${e.totalEarned.toFixed(2)} TROB`,
        }))
      : defaultNodes;

  const sortedNodes = [...rankingNodes].sort((a, b) => {
    if (sortOrder === "desc") {
      return b.totalVolume - a.totalVolume;
    }
    return a.totalVolume - b.totalVolume;
  });

  return (
          <div className="space-y-3 pt-1">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#0f172a]">Global Rankings</h2>
                <span className="text-[11.5px] sm:text-xs text-[#94a3b8] font-normal">(Top 100 on-chain)</span>
              </div>

              {/* Mobile Sort Button */}
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="md:hidden flex items-center gap-1 text-[12px] font-bold text-[#2563eb] hover:text-blue-700 cursor-pointer active:scale-95 transition-transform"
              >
                <span>Sort: Volume</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* ──────── TABLE VIEW (Visible on >= 768px) ──────── */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] text-[10.5px] font-bold text-[#94a3b8] uppercase tracking-wider bg-[#f8fafc]/50">
                      <th className="py-3.5 px-4 w-16 text-center">#</th>
                      <th className="py-3.5 px-4 min-w-[200px]">NODE ID & ADDRESS</th>
                      <th className="py-3.5 px-4 text-center">SLOT</th>
                      <th className="py-3.5 px-4 text-center">DIRECT PARTNERS</th>
                      <th className="py-3.5 px-4 text-center">MATRIX CYCLES</th>
                      <th className="py-3.5 px-4 text-center">TOTAL VOLUME</th>
                      <th className="py-3.5 px-4 text-center">7D TREND</th>
                      <th className="py-3.5 px-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                    {sortedNodes.map((node) => (
                      <tr
                        key={node.id}
                        className="hover:bg-[#f8fafc]/80 transition-colors group cursor-pointer"
                      >
                        {/* Rank Badge */}
                        <td className="py-3 px-4 text-center">
                          {node.rank === 1 && (
                            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[#fef08a] to-[#fde047] border border-[#facc15] flex items-center justify-center shadow-xs">
                              <CrownBadge rank={1} size="sm" />
                            </div>
                          )}
                          {node.rank === 2 && (
                            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[#f1f5f9] to-[#cbd5e1] border border-[#cbd5e1] flex items-center justify-center shadow-xs">
                              <CrownBadge rank={2} size="sm" />
                            </div>
                          )}
                          {node.rank === 3 && (
                            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[#ffedd5] to-[#fed7aa] border border-[#fdba74] flex items-center justify-center shadow-xs">
                              <CrownBadge rank={3} size="sm" />
                            </div>
                          )}
                          {node.rank > 3 && (
                            <span className="font-extrabold text-[13.5px] text-[#0f172a] block">
                              {node.rank}
                            </span>
                          )}
                        </td>

                        {/* Node ID & Address with 3D sphere avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-7 h-7 rounded-full shadow-xs flex-shrink-0 relative overflow-hidden"
                              style={{
                                background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 35%, #1d4ed8 75%, #0f172a 100%)",
                                boxShadow: "0 2px 4px -1px rgba(29, 78, 216, 0.45), inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -2px 3px rgba(0,0,0,0.3)",
                              }}
                            >
                              <div className="absolute top-1 left-1.5 w-1.5 h-1 rounded-full bg-white/40 blur-[0.4px] transform -rotate-12" />
                            </div>

                            <div>
                              <div className="font-extrabold text-[13.5px] text-[#0f172a] tracking-tight group-hover:text-blue-600 transition-colors">
                                {node.id}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(node.address);
                                }}
                                className="flex items-center gap-1 text-[11px] font-mono text-[#94a3b8] hover:text-[#2563eb] cursor-pointer mt-0.5"
                              >
                                <span>{node.address}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Slot Badge */}
                        <td className="py-3 px-4 text-center">
                          {node.slotTheme === "amber" && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                              {node.slot}
                            </span>
                          )}
                          {node.slotTheme === "blue" && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                              {node.slot}
                            </span>
                          )}
                          {node.slotTheme === "slate" && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                              {node.slot}
                            </span>
                          )}
                        </td>

                        {/* Direct Partners */}
                        <td className="py-3 px-4 text-center font-bold text-[#0f172a]">
                          {node.directPartners.toLocaleString()}
                        </td>

                        {/* Matrix Cycles */}
                        <td className="py-3 px-4 text-center font-bold text-[#0f172a]">
                          {node.matrixCycles}
                        </td>

                        {/* Total Volume */}
                        <td className="py-3 px-4 text-center font-black text-[#0f172a]">
                          {node.volumeDisplay}
                        </td>

                        {/* 7D Trend */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[12px] ${
                              node.trend7d >= 0 ? "text-[#16a34a]" : "text-[#ef4444]"
                            }`}
                          >
                            <span>{node.trend7d >= 0 ? "↑" : "↓"}</span>
                            <span>{node.trend7d >= 0 ? `+${node.trend7d}%` : `${node.trend7d}%`}</span>
                          </span>
                        </td>

                        {/* Action Chevron */}
                        <td className="py-3 px-4 text-center">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-[#cbd5e1] group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all inline-block"
                          >
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ──────── MOBILE CARDS VIEW (< md 768px) ──────── */}
            <div className="md:hidden flex flex-col gap-2.5">
              {sortedNodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-white rounded-2xl border border-[#e2e8f0] p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-2.5 hover:border-blue-200 transition-all cursor-pointer active:bg-slate-50/80"
                >
                  {/* Left: Crown / Number Badge + Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {node.rank === 1 && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fef08a] to-[#fde047] border border-[#facc15] flex items-center justify-center shadow-xs">
                          <CrownBadge rank={1} size="sm" />
                        </div>
                      )}
                      {node.rank === 2 && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f1f5f9] to-[#cbd5e1] border border-[#cbd5e1] flex items-center justify-center shadow-xs">
                          <CrownBadge rank={2} size="sm" />
                        </div>
                      )}
                      {node.rank === 3 && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ffedd5] to-[#fed7aa] border border-[#fdba74] flex items-center justify-center shadow-xs">
                          <CrownBadge rank={3} size="sm" />
                        </div>
                      )}
                      {node.rank > 3 && (
                        <div className="w-8 h-8 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[12.5px] font-black text-[#475569]">
                          {node.rank}
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-[13px] text-[#0f172a]">{node.id}</span>
                        {node.slotTheme === "amber" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                            {node.slot}
                          </span>
                        )}
                        {node.slotTheme === "blue" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                            {node.slot}
                          </span>
                        )}
                        {node.slotTheme === "slate" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                            {node.slot}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-[#64748b] mt-0.5 flex items-center gap-1">
                        <span>{node.directPartners.toLocaleString()} Direct</span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span className="font-extrabold text-[#2563eb]">{node.matrixCycles} Cyc</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Volume & Trend + Arrow */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-black text-[12.5px] text-[#0f172a]">
                        {node.totalVolume.toLocaleString("en-US", { minimumFractionDigits: 0 })} TROB
                      </div>
                      <div
                        className={`text-[10.5px] font-bold mt-0.5 ${
                          node.trend7d >= 0 ? "text-[#16a34a]" : "text-[#ef4444]"
                        }`}
                      >
                        {node.trend7d >= 0 ? `+${node.trend7d}%` : `${node.trend7d}%`}
                      </div>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[#cbd5e1]"
                    >
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
  );
}
