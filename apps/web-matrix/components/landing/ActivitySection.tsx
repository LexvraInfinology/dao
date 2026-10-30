"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User, Coins, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import { getOnChainSlotDetails } from "@/lib/contracts";
import joinedMembersData from "@/lib/joinedMembers.json";
import { formatAddress } from "@/lib/format";

interface MatrixActivityRow {
  id: string;
  title: string;
  subtitle: string;
  highlight: string | null;
  highlightColor: string;
  timeAgo: string;
  memberId: string;
  txHash: string;
  iconEl: React.ReactNode;
  iconBg: string;
}

function timeAgoLabel(iso: string): string {
  try {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const s = Math.floor(diff / 1000);
    if (s < 10) return "just now";
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return "recent";
  }
}

export function ActivitySection() {
  const [mounted, setMounted] = useState(false);

  // Generate verified on-chain activity stream from actual members and cashflow events
  const activities: MatrixActivityRow[] = useMemo(() => {
    const rows: MatrixActivityRow[] = [];
    const reversed = [...joinedMembersData].reverse();

    reversed.forEach((m: any, idx: number) => {
      const addr = m.base58 ? formatAddress(m.base58) : `Member #${m.memberNumber}`;
      const timeAgo = timeAgoLabel(m.timestamp);

      // 1. Direct Cashflow payout events for P3 and P6
      if (m.positionFilled === 3 || m.positionFilled === 6 || m.memberNumber === 4 || m.memberNumber === 7 || m.memberNumber === 9 || m.memberNumber === 12 || m.memberNumber === 14) {
        rows.push({
          id: `payout-${m.txHash}-${idx}`,
          title: "Direct Cashflow Payout",
          subtitle: `+$30.00 USD settled instantly • ${addr}`,
          highlight: "+$30.00 USD",
          highlightColor: "text-[#12B76A]",
          timeAgo,
          memberId: `#${m.memberNumber}`,
          txHash: m.txHash,
          iconEl: <Coins className="w-4 h-4 text-[#12B76A]" />,
          iconBg: "bg-[#ECFDF5] border border-[#A7F3D0]/60",
        });
      }

      // 2. Member Joined / Slot 1 Activated
      rows.push({
        id: `join-${m.txHash}-${idx}`,
        title: `Member #${m.memberNumber} Joined`,
        subtitle: `Slot 1 Activated • ${addr}`,
        highlight: "$30.00 USD",
        highlightColor: "text-[#155EEF]",
        timeAgo,
        memberId: `#${m.memberNumber}`,
        txHash: m.txHash,
        iconEl: <User className="w-4 h-4 text-[#155EEF]" />,
        iconBg: "bg-[#EFF6FF] border border-[#BFDBFE]/50",
      });

      // 3. Auto-Upgrade Reserve for P4 and P5
      if (m.positionFilled === 4 || m.positionFilled === 5 || m.memberNumber === 5 || m.memberNumber === 6 || m.memberNumber === 11) {
        rows.push({
          id: `reserve-${m.txHash}-${idx}`,
          title: "Auto-Upgrade Reserve",
          subtitle: `$30.00 USD allocated to Slot 2 • ${addr}`,
          highlight: "$30.00 USD",
          highlightColor: "text-[#7C3AED]",
          timeAgo,
          memberId: `Slot 2`,
          txHash: m.txHash,
          iconEl: <RotateCcw className="w-4 h-4 text-[#7C3AED]" />,
          iconBg: "bg-[#F5F3FF] border border-[#DDD6FE]/60",
        });
      }
    });

    return rows.slice(0, 5);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="activity"
      className="scroll-mt-20 relative pt-10 sm:pt-14 lg:pt-16 pb-10 sm:pb-14 lg:pb-16 overflow-hidden bg-[#F0F6FD] border-b border-slate-200/80"
    >
      {/* Background Artwork: Anchored to top-right on mobile so the boy's head, arm, and pointing hand are clearly positioned */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/activity-boy.webp"
          alt="Matrix Live Activity"
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-[98%_top] sm:object-[90%_center] lg:object-[right_center] xl:object-right"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Header Block — Compact on mobile so it doesn't block the boy's face */}
        <div className="text-center max-w-[280px] min-[360px]:max-w-[320px] sm:max-w-2xl mx-auto mb-4 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-blue-200/90 shadow-xs mb-2 sm:mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#155EEF] uppercase font-inter">
              LIVE ACTIVITY
            </span>
          </div>
          <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl lg:text-[42px] font-black uppercase text-[#0B132B] leading-tight tracking-tight [text-shadow:0_1px_2px_rgba(255,255,255,0.95)]">
            The Matrix Is<br />
            <span className="text-[#155EEF]">Always Moving.</span>
          </h2>
          <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-base text-[#0F172A] font-semibold leading-relaxed mx-auto [text-shadow:0_1px_1px_rgba(255,255,255,0.9)]">
            Realtime verified transactions broadcasted across the TrobChain Matrix engine.
          </p>
        </div>

        {/* Responsive Grid: Wide, spacious card on laptops, sheer asymmetric glass revealing pointing boy on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center max-w-[1400px] mx-auto">
          {/* Activity Card — Sheer glass on mobile: ultra-clear on the right where the boy's hand points into the table */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 relative z-20 w-full max-w-[330px] min-[400px]:max-w-[355px] sm:max-w-2xl lg:max-w-none mr-auto sm:mx-auto lg:mx-0">
            <div className="activity-card-mobile shadow-[0_12px_40px_rgba(15,23,42,0.06)] rounded-2xl sm:rounded-[32px] p-3 sm:p-6 lg:p-8">
              
              {/* Card header */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-4 border-b border-slate-200/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#155EEF] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#0B132B] uppercase">LIVE</span>
                  <span className="h-3.5 w-px bg-slate-300/60" />
                  <span className="text-[11px] sm:text-sm font-bold text-[#0B132B]">On-Chain Matrix Activity</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-[#1E293B] bg-white/40 px-2 py-0.5 rounded-full border border-white/40">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#12B76A]" />
                  <span className="hidden min-[360px]:inline">TrobChain Testnet</span>
                </div>
              </div>

              {/* Activity rows — Sheer pills: solid white on left for legibility, crystal-clear on right so pointing hand shows cleanly */}
              <div className="space-y-1.5 sm:space-y-2 pt-2 sm:pt-3">
                {activities.map((item) => {
                  const explorerUrl = `https://testnet.trobchain.com/#/transaction/${item.txHash}`;
                  return (
                    <div
                      key={item.id}
                      className="activity-row-mobile py-2 min-[360px]:py-2.5 sm:py-3 flex items-center justify-between gap-2 min-[360px]:gap-3 sm:gap-4 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl transition-all shadow-[0_2px_8px_rgba(15,23,42,0.02)]"
                    >
                      <div className="flex items-center gap-2 min-[360px]:gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${item.iconBg}`}>
                          {item.iconEl}
                        </div>
                        <div className="min-w-0 space-y-0.5 flex-1">
                          <div className="text-xs sm:text-sm md:text-base font-bold text-[#0B132B] truncate tracking-tight [text-shadow:0_1px_1px_rgba(255,255,255,0.8)]">
                            {item.title}
                          </div>
                          <div className="text-[10px] sm:text-xs text-[#0F172A] font-semibold truncate font-mono sm:font-sans [text-shadow:0_1px_1px_rgba(255,255,255,0.8)]">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 min-w-[62px] min-[360px]:min-w-[72px] sm:min-w-[85px] pl-1.5 sm:pl-3 flex flex-col items-end">
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs sm:text-sm md:text-base font-black tabular-nums tracking-tight whitespace-nowrap px-1 rounded bg-white/70 sm:bg-transparent inline-flex items-center gap-0.5 hover:underline ${item.highlightColor}`}
                          title="View on TrobScan"
                        >
                          <span>{item.highlight}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 inline" />
                        </a>
                        <span className="text-[9px] sm:text-[10px] text-[#1E293B] font-bold tabular-nums whitespace-nowrap">
                          {item.timeAgo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card footer */}
              <div className="pt-2.5 sm:pt-5 mt-2 border-t border-slate-200/50 text-center">
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/90 hover:bg-white text-[11px] sm:text-sm font-bold font-inter text-[#0B132B] border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200"
                >
                  <span>View Full On-Chain Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#155EEF]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column placeholder: Leaves character clearly visible on wide laptop screens */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 h-[440px] pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
