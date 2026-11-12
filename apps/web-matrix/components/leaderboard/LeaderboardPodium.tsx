"use client";

import React from "react";
import { CrownBadge } from "./CrownBadge";

import { MatrixLeaderboardEntry } from "@/lib/api";
import { formatAddress } from "@/lib/format";
import { NETWORK_NAME } from "@/lib/contracts";

export interface LeaderboardPodiumProps {
  handleCopy: (address: string) => void;
  copiedAddress: string | null;
  entries?: MatrixLeaderboardEntry[];
  loading?: boolean;
}

export function LeaderboardPodium({
  handleCopy,
  copiedAddress,
  entries = [],
  loading = false,
}: LeaderboardPodiumProps) {
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  const formatUsdBig = (val?: number) => {
    if (val === undefined || isNaN(val)) return "$0";
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const formatTrobSmall = (val?: number) => {
    if (val === undefined || isNaN(val)) return "0.00 TROB";
    return `${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TROB`;
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pt-1 px-0.5">
          <h2 className="text-[15px] sm:text-[16px] font-extrabold text-[#0f172a]">On-Chain Podium</h2>
          <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#16a34a] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            Live On-Chain
          </span>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center shadow-xs">
          <p className="text-[13px] font-semibold text-[#64748b]">
            {loading
              ? `Syncing live matrix rankings from ${NETWORK_NAME}...`
              : `No podium earners recorded in this period on ${NETWORK_NAME}.`}
          </p>
        </div>
      </div>
    );
  }

  const buildPodiumCard = (entry: MatrixLeaderboardEntry, rank: 1 | 2 | 3) => {
    const fullB58 = entry.base58 || entry.address;
    const rankLabel = rank === 1 ? "Leader" : `Rank #${rank}`;
    const hasRoyaltyTier = entry.rankName && entry.rankName !== "NONE";
    const styles =
      rank === 1
        ? {
            bgGradient: "bg-gradient-to-b from-[#fefbf2] via-[#fffefc] to-[#fef8e8]",
            borderColor: "border-[#fde68a]",
            crownBg: "bg-gradient-to-br from-[#fef08a] via-[#fde047] to-[#eab308]",
            crownBorder: "border-[#facc15]",
            metricBoxBg: "bg-white/90 border-[#fef08a]/80",
          }
        : rank === 2
          ? {
              bgGradient: "bg-gradient-to-b from-[#f8fafc] via-[#fbfcfe] to-[#f1f5f9]",
              borderColor: "border-[#e2e8f0]",
              crownBg: "bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]",
              crownBorder: "border-[#cbd5e1]",
              metricBoxBg: "bg-white/90 border-[#e2e8f0]",
            }
          : {
              bgGradient: "bg-gradient-to-b from-[#fffaf5] via-[#fffdfa] to-[#ffedd5]/40",
              borderColor: "border-[#fed7aa]",
              crownBg: "bg-gradient-to-br from-[#ffedd5] via-[#fed7aa] to-[#fdba74]",
              crownBorder: "border-[#f97316]/40",
              metricBoxBg: "bg-white/90 border-[#fed7aa]/80",
            };

    return {
      rank,
      nodeId: String(entry.userId || rank),
      fullAddress: fullB58,
      displayAddress: formatAddress(fullB58),
      badgeLabel: hasRoyaltyTier ? entry.rankName : rankLabel,
      slotLabel: `Slot ${entry.highestSlot || 1}`,
      partners: String(entry.directCount ?? 0),
      cycles: String(entry.recyclesCount ?? 0),
      usdBig: formatUsdBig(entry.totalEarnedUsd ?? entry.totalEarned),
      trobSmall: formatTrobSmall(entry.totalEarnedTrob),
      ...styles,
    };
  };

  const podiumData = [
    top1 ? buildPodiumCard(top1, 1) : null,
    top2 ? buildPodiumCard(top2, 2) : null,
    top3 ? buildPodiumCard(top3, 3) : null,
  ].filter(Boolean) as Array<ReturnType<typeof buildPodiumCard>>;

  return (
    <div className="space-y-3 w-full">
      {/* Section Title */}
      <div className="flex items-center justify-between pt-1 px-0.5">
        <h2 className="text-[15px] sm:text-[16px] font-extrabold text-[#0f172a]">On-Chain Podium</h2>
        <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#64748b]">Top 3 Verified Earners</span>
      </div>

      {/* Podium Cards Grid: 1-col on mobile (< sm), 3-col on tablet & desktop (>= sm) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3 lg:gap-4 xl:gap-5 w-full">
        {podiumData.map((node) => {
          const isCopied = copiedAddress === node.fullAddress;
          return (
            <div
              key={node.rank}
              className={`rounded-2xl p-3 sm:p-3.5 xl:p-5 ${node.bgGradient} border ${node.borderColor} shadow-xs relative overflow-hidden transition-all hover:shadow-md min-w-0`}
            >
              {/* Top Row: Crown + Title + Badge */}
              <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-9 h-9 sm:w-9 sm:h-9 xl:w-11 xl:h-11 rounded-xl ${node.crownBg} border ${node.crownBorder} flex items-center justify-center shadow-xs`}
                    >
                      <CrownBadge rank={node.rank} size="md" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0f172a] text-white text-[9.5px] font-black flex items-center justify-center border border-white">
                      {node.rank}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[13.5px] sm:text-[14px] xl:text-[15px] font-black text-[#0f172a] tracking-tight whitespace-nowrap">
                        Member #{node.nodeId}
                      </h3>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                        {node.slotLabel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(node.fullAddress)}
                      title={`Copy ${node.fullAddress}`}
                      className="inline-flex items-center gap-1 text-[10.5px] xl:text-[11px] font-mono text-[#64748b] hover:text-[#2563eb] cursor-pointer mt-0.5 whitespace-nowrap transition-colors"
                    >
                      <span className="font-semibold">{node.displayAddress}</span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`flex-shrink-0 transition-colors ${
                          isCopied ? "text-emerald-500" : "text-[#94a3b8]"
                        }`}
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right: Rank / Royalty Pill */}
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[10.5px] xl:text-[11px] font-extrabold text-[#16a34a] whitespace-nowrap shadow-2xs">
                    <span>{node.badgeLabel}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Metric Box */}
              <div
                className={`rounded-xl p-2 sm:p-2.5 xl:p-3 mt-3 sm:mt-3.5 xl:mt-4 border ${node.metricBoxBg} grid grid-cols-3 gap-1.5 sm:gap-2 text-left backdrop-blur-xs`}
              >
                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] text-[#64748b] block font-medium whitespace-nowrap">
                    Directs
                  </span>
                  <span className="text-[14px] sm:text-[15px] font-black text-[#0f172a] block mt-0.5 whitespace-nowrap">
                    {node.partners}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] text-[#64748b] block font-medium whitespace-nowrap">
                    Cycles Settled
                  </span>
                  <span className="text-[14px] sm:text-[15px] font-black text-[#2563eb] block mt-0.5 whitespace-nowrap">
                    {node.cycles}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] text-[#64748b] block font-medium whitespace-nowrap">
                    Earned
                  </span>
                  <span className="text-[15px] sm:text-[16px] xl:text-[18px] font-black text-[#0f172a] block mt-0.5 leading-none whitespace-nowrap">
                    {node.usdBig}
                  </span>
                  <span className="text-[9.5px] xl:text-[10px] font-mono font-semibold text-[#64748b] block mt-0.5 truncate">
                    {node.trobSmall}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
