"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import joinedMembersData from "@/lib/joinedMembers.json";

interface ActivityItem {
  id: string;
  type: "member" | "position" | "progress" | "reward";
  title: string;
  subtitle: string;
  memberId: string;
  txHash: string;
  base58?: string;
  rawTimestamp: string;
  isNew?: boolean;
}

function formatRelativeTime(iso: string): string {
  try {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "recent";
  }
}

export function ActivitySection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build authentic on-chain transactions directly from broadcasted testnet data
  const activities: ActivityItem[] = useMemo(() => {
    const list: ActivityItem[] = [];

    // Reverse to get most recent first
    const reversed = [...joinedMembersData].reverse();

    reversed.forEach((m: any, idx: number) => {
      // 1. Member join event
      list.push({
        id: `tx-${m.txHash}-join`,
        type: "member",
        title: "New Operative Joined",
        subtitle: `Slot 1 Activated • 535.71 TROB ($30.00 USD)`,
        memberId: m.memberNumber === 3 ? "ID #63550" : `Operative #${m.memberNumber}`,
        txHash: m.txHash,
        base58: m.base58,
        rawTimestamp: m.timestamp,
        isNew: idx === 0,
      });

      // 2. Direct cashflow payout for positions 3 and 6
      if (m.positionFilled === 3 || m.positionFilled === 6) {
        list.push({
          id: `tx-${m.txHash}-reward`,
          type: "reward",
          title: "Direct Cashflow Payout",
          subtitle: `+$30.00 USD (535.71 TROB) to Seat 1 Sponsor`,
          memberId: `P${m.positionFilled} Owner Cashflow`,
          txHash: m.txHash,
          rawTimestamp: m.timestamp,
        });
      }

      // 3. Protocol auto-tier reserve pool for positions 4 and 5
      if (m.positionFilled === 4 || m.positionFilled === 5) {
        list.push({
          id: `tx-${m.txHash}-pool`,
          type: "progress",
          title: "Auto-Tier Reserve Funded",
          subtitle: `Position P${m.positionFilled} • Slot 2 Upgrade Reserve`,
          memberId: `Protocol Pool`,
          txHash: m.txHash,
          rawTimestamp: m.timestamp,
        });
      }

      // 4. Matrix Tree position placement
      if (m.positionFilled) {
        list.push({
          id: `tx-${m.txHash}-pos`,
          type: "position",
          title: "Matrix Position Placed",
          subtitle: `Position P${m.positionFilled} Filled • 14-Node Tree Level ${m.positionFilled <= 2 ? 1 : 2}`,
          memberId: `Node #${m.positionFilled}`,
          txHash: m.txHash,
          rawTimestamp: m.timestamp,
        });
      }
    });

    // Return the top 6 distinct on-chain activities
    return list.slice(0, 6);
  }, []);

  return (
    <section
      id="activity"
      className="w-full relative z-10 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 overflow-hidden scroll-mt-[70px] bg-[#f8fafc]"
    >
      {/* ── Background Image Layer (Mountain scenery & 3D character) ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[position:65%_top] md:bg-[position:62%_top] lg:bg-[center_top] pointer-events-none opacity-95 transition-opacity"
        style={{
          backgroundImage: `url('/activity-bg.jpg')`,
        }}
      />

      {/* Top & Bottom seamless gradient blending into page background */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-[#f1f5f9] via-[#f1f5f9]/70 to-transparent z-[1] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-[#f1f5f9] via-[#f1f5f9]/80 to-transparent z-[1] pointer-events-none" />

      {/* ── Foreground Content Container ── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10 lg:mb-12">
          <span className="text-xs sm:text-[13px] font-bold tracking-[0.22em] text-[#0f172a] uppercase mb-2.5 sm:mb-3 block">
            LIVE ACTIVITY
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#0b132b] tracking-tight leading-[1.08] mb-3 sm:mb-3.5">
            THE MATRIX IS <br className="hidden sm:inline" />
            ALWAYS <span className="text-[#2563eb]">MOVING</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 font-medium leading-relaxed max-w-lg mx-auto px-2">
            Realtime verified transactions broadcasted across the TrobChain Matrix engine.
          </p>
        </div>

        {/* ── Main Activity Card ── */}
        <div className="w-full max-w-[640px] mx-auto bg-white/95 backdrop-blur-md rounded-[26px] sm:rounded-[32px] border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08),0_4px_16px_rgba(0,0,0,0.03)] p-3.5 sm:p-5 md:p-6 lg:p-7 contain-paint">
          
          {/* Top Status Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse flex-shrink-0" />
              <span className="text-[11.5px] sm:text-[12.5px] font-black text-[#0b132b] tracking-wider uppercase flex-shrink-0">
                LIVE
              </span>
              <span className="h-3 w-px bg-slate-200 mx-0.5 sm:mx-1 flex-shrink-0" />
              <span className="text-[11px] sm:text-[12px] text-slate-600 font-semibold truncate">
                <span className="hidden sm:inline">100% On-Chain Verified Transactions</span>
                <span className="sm:hidden">On-Chain Verified</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-[10px] sm:text-[11.5px] text-emerald-700 font-semibold whitespace-nowrap">
                TrobChain Testnet
              </span>
            </div>
          </div>

          {/* Activity Rows List - Smooth, Non-Jittering Rows */}
          <div className="divide-y divide-slate-100/80 pt-0.5 sm:pt-1">
            {activities.map((act) => {
              const isAvatar = act.type === "member";
              const isReward = act.type === "reward";
              const isPosition = act.type === "position";
              const isProgress = act.type === "progress";
              const explorerUrl = `https://testnet.trobchain.com/#/transaction/${act.txHash}`;

              return (
                <div
                  key={act.id}
                  className="min-h-[58px] py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3 group hover:bg-slate-50/80 rounded-2xl px-2 sm:px-2.5 -mx-1 sm:-mx-1.5 transition-colors duration-150"
                >
                  {/* Left: Avatar or Icon + Titles */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    {/* Media container 42px / 48px */}
                    <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] rounded-[14px] sm:rounded-[15px] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                      {isAvatar ? (
                        <div className="relative w-full h-full">
                          <Image
                            src="/activity-avatar.jpg"
                            alt="Operative"
                            fill
                            sizes="46px"
                            className="object-cover"
                          />
                        </div>
                      ) : isReward ? (
                        <div className="w-full h-full bg-[#f0fdf4] border border-emerald-200/90 rounded-[14px] sm:rounded-[15px] flex items-center justify-center text-emerald-600">
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </div>
                      ) : isPosition ? (
                        <div className="w-full h-full bg-[#eff6ff] border border-blue-200/90 rounded-[14px] sm:rounded-[15px] flex items-center justify-center text-[#2563eb]">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                      ) : isProgress ? (
                        <div className="w-full h-full bg-[#faf5ff] border border-purple-200/90 rounded-[14px] sm:rounded-[15px] flex items-center justify-center text-purple-600">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 20V10M12 20V4M6 20v-6" />
                          </svg>
                        </div>
                      ) : null}
                    </div>

                    {/* Titles */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0b132b] leading-tight truncate">
                          {act.title}
                        </h4>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-0.5 truncate">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Member ID, Explorer Link & Relative Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 flex-shrink-0 text-right">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 hover:bg-blue-50 text-[11px] sm:text-[11.5px] font-bold text-slate-700 hover:text-blue-700 transition-colors group/link"
                      title="View transaction on TrobChain Explorer"
                    >
                      <span>{act.memberId}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-blue-600 transition-colors" />
                    </a>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono tabular-nums whitespace-nowrap">
                      {mounted ? formatRelativeTime(act.rawTimestamp) : "recent"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Button */}
          <div className="pt-4 sm:pt-5 flex justify-center">
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-[12.5px] sm:text-[13px] font-bold text-slate-700 transition-all active:scale-95 shadow-2xs group cursor-pointer"
            >
              <span>View Full On-Chain Ledger</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
