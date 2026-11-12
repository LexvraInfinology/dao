"use client";

import React, { useState } from "react";
import { CrownBadge } from "./CrownBadge";
import { MatrixLeaderboardEntry } from "@/lib/api";
import { formatAddress, toTrobBase58 } from "@/lib/format";

export interface LeaderboardNode {
  rank: number;
  id: string;
  address: string;
  fullAddress: string;
  slot: string;
  slotTheme: "amber" | "blue" | "slate";
  rankName: string;
  directPartners: number;
  matrixCycles: number;
  totalUsd: number;
  totalTrob: number;
  earned7dUsd: number;
  earned7dTrob: number;
}

export interface LeaderboardRankingsTableProps {
  handleCopy: (address: string) => void;
  copiedAddress: string | null;
  entries?: MatrixLeaderboardEntry[];
  loading?: boolean;
}

function getTierBadgeClasses(rankName: string): string {
  switch (rankName) {
    case "CROWN":
      return "bg-[#fef3c7] text-[#b45309] border-[#fde68a]";
    case "ELITE":
      return "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]";
    case "PRIME":
      return "bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]";
    case "ALPHA":
      return "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]";
    default:
      return "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]";
  }
}

export function LeaderboardRankingsTable({
  handleCopy,
  copiedAddress,
  entries,
  loading = false,
}: LeaderboardRankingsTableProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const rankingNodes: LeaderboardNode[] =
    entries && entries.length > 0
      ? entries.map((e) => {
          const fullB58 = e.base58 || toTrobBase58(e.address);
          return {
            rank: e.rank,
            id: e.userId ? `#${e.userId}` : e.code ? `#${e.code}` : formatAddress(fullB58),
            address: formatAddress(fullB58),
            fullAddress: fullB58,
            slot: `SLOT ${e.highestSlot}`,
            slotTheme: e.highestSlot >= 8 ? "amber" : "blue",
            rankName: e.rankName || "NONE",
            directPartners: e.directCount ?? 0,
            matrixCycles: e.recyclesCount ?? 0,
            totalUsd: e.totalEarnedUsd ?? e.totalEarned ?? 0,
            totalTrob: e.totalEarnedTrob ?? 0,
            earned7dUsd: e.earned7dUsd ?? 0,
            earned7dTrob: e.earned7dTrob ?? 0,
          };
        })
      : [];

  const sortedNodes = [...rankingNodes].sort((a, b) => {
    if (sortOrder === "desc") {
      return b.totalUsd - a.totalUsd || b.totalTrob - a.totalTrob || a.rank - b.rank;
    }
    return a.totalUsd - b.totalUsd || a.totalTrob - b.totalTrob || b.rank - a.rank;
  });

  return (
    <div className="space-y-3 pt-1">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base sm:text-lg font-black text-[#0f172a]">Global Rankings</h2>
          <span className="text-[11.5px] sm:text-xs text-[#64748b] font-normal">
            ({sortedNodes.length} verified on-chain)
          </span>
        </div>

        {/* Sort Button */}
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1 text-[12px] font-bold text-[#2563eb] hover:text-blue-700 cursor-pointer active:scale-95 transition-transform"
        >
          <span>Sort: {sortOrder === "desc" ? "Highest" : "Lowest"}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 15l5 5 5-5M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ──────── TABLE VIEW (Visible on >= 768px) ──────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-[10.5px] font-bold text-[#94a3b8] uppercase tracking-wider bg-[#f8fafc]/50">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[210px]">MEMBER & WALLET ADDRESS</th>
                <th className="py-3.5 px-4 text-center">TIER</th>
                <th className="py-3.5 px-4 text-center">DIRECTS</th>
                <th className="py-3.5 px-4 text-center">CYCLES</th>
                <th className="py-3.5 px-4 text-right">MATRIX EARNINGS</th>
                <th className="py-3.5 px-4 text-right">7D EARNINGS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {sortedNodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94a3b8] text-[13px]">
                    {loading ? "Loading live on-chain rankings..." : "No ranked earners found for this filter."}
                  </td>
                </tr>
              ) : (
                sortedNodes.map((node) => {
                  const isCopied = copiedAddress === node.fullAddress;
                  return (
                    <tr
                      key={`${node.rank}-${node.fullAddress}`}
                      className="hover:bg-[#f8fafc]/80 transition-colors group"
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

                      {/* Member ID & Wallet Address */}
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

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[13.5px] text-[#0f172a] tracking-tight">
                                {node.id}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#2563eb] text-[9.5px] font-extrabold border border-[#dbeafe]">
                                {node.slot}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(node.fullAddress)}
                              title={`Copy ${node.fullAddress}`}
                              className="flex items-center gap-1 text-[11.5px] font-mono text-[#64748b] hover:text-[#2563eb] cursor-pointer mt-0.5"
                            >
                              <span>{node.address}</span>
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={isCopied ? "text-emerald-500" : "text-[#94a3b8]"}
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Pool Tier Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getTierBadgeClasses(
                            node.rankName
                          )}`}
                        >
                          {node.rankName !== "NONE" ? node.rankName : "MEMBER"}
                        </span>
                      </td>

                      {/* Direct Partners */}
                      <td className="py-3 px-4 text-center font-bold text-[#0f172a]">
                        {node.directPartners.toLocaleString()}
                      </td>

                      {/* Matrix Cycles */}
                      <td className="py-3 px-4 text-center font-bold text-[#2563eb]">
                        {node.matrixCycles}
                      </td>

                      {/* Big $ USD + Small Exact TROB */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-black text-[15px] text-[#0f172a] leading-tight">
                          ${Math.round(node.totalUsd).toLocaleString("en-US")}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-[#64748b] mt-0.5">
                          {node.totalTrob.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
                        </div>
                      </td>

                      {/* 7D On-Chain Earnings */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-[13px] text-[#16a34a] leading-tight">
                          ${Math.round(node.earned7dUsd).toLocaleString("en-US")}
                        </div>
                        <div className="text-[10.5px] font-mono text-[#64748b] mt-0.5">
                          {node.earned7dTrob.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────── MOBILE CARDS VIEW (< md 768px) ──────── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {sortedNodes.length === 0 ? (
          <div className="py-10 text-center text-[#94a3b8] text-[13px] bg-white rounded-2xl border border-[#e2e8f0]">
            {loading ? "Loading live on-chain rankings..." : "No ranked earners found for this filter."}
          </div>
        ) : (
          sortedNodes.map((node) => (
            <div
              key={`mob-${node.rank}-${node.fullAddress}`}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-2.5"
            >
              {/* Left: Crown / Number Badge + Info + Copyable Wallet */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
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

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-[13px] text-[#0f172a]">{node.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                      {node.slot}
                    </span>
                    {node.rankName !== "NONE" && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${getTierBadgeClasses(
                          node.rankName
                        )}`}
                      >
                        {node.rankName}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(node.fullAddress)}
                    className="inline-flex items-center gap-1 text-[10.5px] font-mono text-[#64748b] hover:text-[#2563eb] mt-0.5 cursor-pointer"
                  >
                    <span className="truncate">{node.address}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="text-[10.5px] text-[#64748b] mt-0.5 flex items-center gap-1">
                    <span>{node.directPartners.toLocaleString()} Direct</span>
                    <span className="text-[#cbd5e1]">•</span>
                    <span className="font-extrabold text-[#2563eb]">{node.matrixCycles} Cyc</span>
                  </div>
                </div>
              </div>

              {/* Right: Big $ USD + Small TROB */}
              <div className="text-right flex-shrink-0">
                <div className="font-black text-[15px] text-[#0f172a] leading-tight">
                  ${Math.round(node.totalUsd).toLocaleString("en-US")}
                </div>
                <div className="text-[10px] font-mono font-semibold text-[#64748b] mt-0.5">
                  {node.totalTrob.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
