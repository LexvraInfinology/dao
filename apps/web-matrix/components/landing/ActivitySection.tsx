"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User, Coins, RotateCcw, Shield, ExternalLink } from "lucide-react";
import { NETWORK_NAME } from "@/lib/contracts";

interface MatrixActivityItem {
  id: string;
  type: "slot_join" | "dao_join" | "pool_claim" | "contract_call";
  title: string;
  subtitle: string;
  badge: string;
  highlight: string;
  highlightColor: string;
  timestamp: string;
  memberAddress: string;
  shortAddress: string;
  memberId?: string;
  txHash: string;
  explorerUrl: string;
  iconType: "user" | "shield" | "coins" | "recycle";
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
  const [activities, setActivities] = useState<MatrixActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  // Dynamic ticker to advance relative timestamps ("just now", "10s ago", etc.) every 5s
  useEffect(() => {
    const ticker = setInterval(() => setTick((v) => v + 1), 5000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    setMounted(true);
    let isCurrent = true;

    async function loadActivity() {
      try {
        const res = await fetch("/api/matrix/activity", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (isCurrent && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setActivities((prev) => {
              if (
                prev.length === json.data.length &&
                prev.every((p, idx) => p.id === json.data[idx]?.id)
              ) {
                return prev;
              }
              return json.data;
            });
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch matrix activity:", err);
      }
    }

    loadActivity();
    // Poll every 5 seconds for live on-chain updates
    const interval = setInterval(loadActivity, 5000);
    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
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
                  <span className="hidden min-[360px]:inline">{NETWORK_NAME}</span>
                </div>
              </div>

              {/* Activity rows — Sheer pills: solid white on left for legibility, crystal-clear on right so pointing hand shows cleanly */}
              <div className="space-y-1.5 sm:space-y-2 pt-2 sm:pt-3">
                {loading && activities.length === 0 ? (
                  <div className="space-y-2 py-2">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="activity-row-mobile rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-between animate-pulse"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-200/70" />
                          <div className="space-y-1">
                            <div className="w-24 sm:w-32 h-3 sm:h-3.5 bg-slate-200/70 rounded" />
                            <div className="w-28 sm:w-40 h-2.5 bg-slate-200/50 rounded" />
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="w-14 sm:w-20 h-3 sm:h-3.5 bg-slate-200/70 rounded ml-auto" />
                          <div className="w-10 sm:w-14 h-2.5 bg-slate-200/50 rounded ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <p className="font-semibold text-slate-700">Connecting to TrobChain Layer-1...</p>
                    <p className="text-[11px] text-slate-400 mt-1">Live transaction blocks stream as new activations settle on-chain.</p>
                  </div>
                ) : (
                  activities.slice(0, 5).map((act) => {
                    const isSlot = act.type === "slot_join";
                    const isDao = act.type === "dao_join";
                    const isPool = act.type === "pool_claim";

                    return (
                      <div
                        key={act.id}
                        className="activity-row-mobile rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all duration-150 hover:bg-white/95 group"
                      >
                        {/* Left: Icon + Labels */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                          <div
                            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              isSlot
                                ? "bg-blue-50 text-[#155EEF] border border-blue-200/60"
                                : isDao
                                  ? "bg-purple-50 text-[#7C3AED] border border-purple-200/60"
                                  : isPool
                                    ? "bg-emerald-50 text-[#12B76A] border border-emerald-200/60"
                                    : "bg-amber-50 text-[#D97706] border border-amber-200/60"
                            }`}
                          >
                            {isSlot ? (
                              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : isDao ? (
                              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : isPool ? (
                              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] sm:text-sm font-bold text-[#0B132B] truncate font-inter">
                                {act.title}
                              </span>
                              {act.memberId && (
                                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100/70 text-[#155EEF] border border-blue-200/50">
                                  {act.memberId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-600 truncate font-medium">
                              {act.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Explorer Link */}
                        <div className="text-right shrink-0 flex items-center gap-2 sm:gap-3 pl-1">
                          <div>
                            <div className={`text-[11px] sm:text-sm font-extrabold ${act.highlightColor || "text-[#155EEF]"}`}>
                              {act.highlight}
                            </div>
                            <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
                              {mounted ? timeAgoLabel(act.timestamp) : "recent"}
                            </div>
                          </div>

                          {act.explorerUrl && (
                            <a
                              href={act.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on TrobChain Explorer"
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/80 hover:bg-blue-50 text-slate-400 hover:text-[#155EEF] flex items-center justify-center transition-colors border border-slate-200/60"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
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
