"use client";

import React from "react";
import { CrownBadge } from "./CrownBadge";

import { MatrixLeaderboardEntry } from "@/lib/api";
import { formatAddress } from "@/lib/format";

export interface LeaderboardPodiumProps {
  handleCopy: (address: string) => void;
  copiedAddress: string | null;
  entries?: MatrixLeaderboardEntry[];
}

export function LeaderboardPodium({
  handleCopy,
  copiedAddress,
  entries = [],
}: LeaderboardPodiumProps) {
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  const formatVolume = (val?: number) => {
    if (val === undefined || isNaN(val)) return "$0.00";
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(1)}`;
  };

  const formatVolumeFull = (val?: number) => {
    if (val === undefined || isNaN(val)) return "$0.00 USD";
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  const formatAddr = (addr?: string) => {
    return formatAddress(addr);
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
            No podium winners recorded yet. Cycle slots to claim the top podium positions on TrobChain testnet!
          </p>
        </div>
      </div>
    );
  }

  const podiumData = [
    top1
      ? {
          rank: 1 as const,
          nodeId: String(top1.userId || "1"),
          fullAddress: top1.address,
          displayAddress: formatAddr(top1.address),
          trend: "Leader",
          trendPositive: true,
          partners: String(top1.directCount),
          cycles: `Slot ${top1.highestSlot}`,
          volume: formatVolume(top1.totalEarned),
          volumeFull: formatVolumeFull(top1.totalEarned),
          bgGradient: "bg-gradient-to-b from-[#fefbf2] via-[#fffefc] to-[#fef8e8]",
          borderColor: "border-[#fde68a]",
          crownBg: "bg-gradient-to-br from-[#fef08a] via-[#fde047] to-[#eab308]",
          crownBorder: "border-[#facc15]",
          metricBoxBg: "bg-white/90 border-[#fef08a]/80",
        }
      : null,
    top2
      ? {
          rank: 2 as const,
          nodeId: String(top2.userId || "2"),
          fullAddress: top2.address,
          displayAddress: formatAddr(top2.address),
          trend: "Rank #2",
          trendPositive: true,
          partners: String(top2.directCount),
          cycles: `Slot ${top2.highestSlot}`,
          volume: formatVolume(top2.totalEarned),
          volumeFull: formatVolumeFull(top2.totalEarned),
          bgGradient: "bg-gradient-to-b from-[#f8fafc] via-[#fbfcfe] to-[#f1f5f9]",
          borderColor: "border-[#e2e8f0]",
          crownBg: "bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]",
          crownBorder: "border-[#cbd5e1]",
          metricBoxBg: "bg-white/90 border-[#e2e8f0]",
        }
      : null,
    top3
      ? {
          rank: 3 as const,
          nodeId: String(top3.userId || "3"),
          fullAddress: top3.address,
          displayAddress: formatAddr(top3.address),
          trend: "Rank #3",
          trendPositive: true,
          partners: String(top3.directCount),
          cycles: `Slot ${top3.highestSlot}`,
          volume: formatVolume(top3.totalEarned),
          volumeFull: formatVolumeFull(top3.totalEarned),
          bgGradient: "bg-gradient-to-b from-[#fffaf5] via-[#fffdfa] to-[#ffedd5]/40",
          borderColor: "border-[#fed7aa]",
          crownBg: "bg-gradient-to-br from-[#ffedd5] via-[#fed7aa] to-[#fdba74]",
          crownBorder: "border-[#f97316]/40",
          metricBoxBg: "bg-white/90 border-[#fed7aa]/80",
        }
      : null,
  ].filter(Boolean) as any[];

  return (
    <div className="space-y-3 w-full">
      {/* Section Title */}
      <div className="flex items-center justify-between pt-1 px-0.5">
        <h2 className="text-[15px] sm:text-[16px] font-extrabold text-[#0f172a]">On-Chain Podium</h2>
        <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#64748b]">Current Epoch #42</span>
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
              {/* Top Row: Crown + Title + Trend Badge */}
              <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                {/* Left: Crown + Node Title + Address */}
                <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 min-w-0 flex-1">
                  {/* Crown Rank Badge */}
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

                  {/* Title & Address */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13.5px] sm:text-[14px] xl:text-[15px] font-black text-[#0f172a] tracking-tight whitespace-nowrap">
                      Node #{node.nodeId}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopy(node.fullAddress)}
                      title={`Copy ${node.fullAddress}`}
                      className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] xl:text-[11px] font-mono text-[#64748b] hover:text-[#2563eb] cursor-pointer mt-0.5 whitespace-nowrap transition-colors"
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

                {/* Right: Trend Indicator Pill */}
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <div className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[10.5px] xl:text-[11px] font-extrabold text-[#16a34a] whitespace-nowrap shadow-2xs">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      className="flex-shrink-0"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{node.trend}</span>
                  </div>
                  <span className="text-[9px] xl:text-[9.5px] text-[#94a3b8] font-medium block mt-0.5 whitespace-nowrap">
                    vs epoch
                  </span>
                </div>
              </div>

              {/* Bottom Metric Box (3 Columns, clean & responsive) */}
              <div
                className={`rounded-xl p-2 sm:p-2.5 xl:p-3 mt-3 sm:mt-3.5 xl:mt-4 border ${node.metricBoxBg} grid grid-cols-3 gap-1 sm:gap-1.5 xl:gap-2 text-left backdrop-blur-xs`}
              >
                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] text-[#64748b] block font-medium whitespace-nowrap">
                    <span className="hidden xl:inline">Direct </span>Partners
                  </span>
                  <span className="text-[13px] sm:text-[13.5px] xl:text-[15px] font-black text-[#0f172a] block mt-0.5 whitespace-nowrap">
                    {node.partners}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] text-[#64748b] block font-medium whitespace-nowrap">
                    <span className="hidden xl:inline">Matrix </span>Cycles
                  </span>
                  <span className="text-[13px] sm:text-[13.5px] xl:text-[15px] font-black text-[#2563eb] block mt-0.5 whitespace-nowrap">
                    {node.cycles}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] xl:text-[10.5px] text-[#64748b] block font-medium whitespace-nowrap">
                    <span className="hidden xl:inline">USD </span>Volume
                  </span>
                  <span
                    className="text-[13px] sm:text-[13.5px] xl:text-[15px] font-black text-[#0f172a] block mt-0.5 whitespace-nowrap"
                    title={node.volumeFull}
                  >
                    {node.volume}
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
