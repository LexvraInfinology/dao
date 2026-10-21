"use client";

import React from "react";

export interface LeaderboardHeaderProps {
  timeframe: "All Time" | "30 Days" | "7 Days";
  setTimeframe: (t: "All Time" | "30 Days" | "7 Days") => void;
  handleCopy: (text: string) => void;
}

export function LeaderboardHeader({ timeframe, setTimeframe, handleCopy }: LeaderboardHeaderProps) {
  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
            <div>
              {/* Eyebrow: Protocol Leaderboard + Badge */}
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[11px] lg:text-[11.5px] font-extrabold text-[#2563eb] tracking-wider uppercase">
                  PROTOCOL LEADERBOARD
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                  <span>Live On-Chain</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">
                Matrix Leaders
              </h1>
              <p className="text-[12px] sm:text-[12.5px] lg:text-[13.5px] text-[#64748b] mt-1 font-normal max-w-2xl leading-relaxed">
                Global real-time ranking of top matrix cyclers, direct team sponsors, and high-net-worth nodes.
              </p>
            </div>

            {/* Timeframe Switcher (All Viewports) */}
            <div className="flex items-center bg-[#f1f5f9] p-0.5 sm:p-1 rounded-xl border border-[#e2e8f0] self-start sm:self-auto">
              {(["All Time", "30 Days", "7 Days"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-[11.5px] sm:text-[12.5px] font-semibold transition-all cursor-pointer ${
                    timeframe === t
                      ? "bg-[#2563eb] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════ USER CURRENT STATUS CARD ═══════════ */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 lg:p-5 shadow-xs transition-shadow hover:shadow-sm">
            {/* Desktop Layout: Horizontal Row (>= xl) */}
            <div className="hidden xl:flex items-center justify-between gap-5 xl:gap-6">
              {/* User Identity Column */}
              <div className="flex items-center gap-3.5 pr-2">
                {/* 3D Glossy Blue Sphere Avatar */}
                <div
                  className="w-12 h-12 rounded-full shadow-md flex-shrink-0 relative overflow-hidden"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 35%, #1d4ed8 75%, #0f172a 100%)",
                    boxShadow: "0 4px 10px -2px rgba(29, 78, 216, 0.5), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -3px 4px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="absolute top-1.5 left-2.5 w-3 h-2 rounded-full bg-white/45 blur-[0.6px] transform -rotate-12" />
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#64748b] leading-tight">Your Current Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5 cursor-pointer group">
                    <span className="text-[15px] font-extrabold text-[#0f172a] group-hover:text-blue-600 transition-colors">
                      Active Node
                    </span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#94a3b8] group-hover:text-blue-600">
                      <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("0x8A3F5B89127c4D9081e7492c1945Eb8712391F2")}
                    className="flex items-center gap-1 mt-0.5 text-[11.5px] font-mono text-[#94a3b8] hover:text-[#2563eb] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span className="font-semibold">0x8A3F...91F2</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-[1px] bg-[#e2e8f0]" />

              {/* Rank Column */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">CURRENT RANK</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-[#2563eb] leading-none">#14</span>
                  <span className="bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0] text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                    Top 1%
                  </span>
                </div>
              </div>

              {/* Metric 1: Direct Partners */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f172a] leading-tight">4</div>
                  <div className="text-[12px] font-bold text-[#0f172a] leading-tight mt-0.5">Direct Partners</div>
                  <div className="text-[10.5px] text-[#94a3b8]">L1 personally invited</div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-[1px] bg-[#e2e8f0]" />

              {/* Metric 2: Matrix Cycles */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f172a] leading-tight">12</div>
                  <div className="text-[12px] font-bold text-[#0f172a] leading-tight mt-0.5">Matrix Cycles</div>
                  <div className="text-[10.5px] text-[#94a3b8]">14-node board resets</div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-[1px] bg-[#e2e8f0]" />

              {/* Metric 3: Total Volume */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="22.08" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f172a] leading-tight">4,250.00</div>
                  <div className="text-[12px] font-bold text-[#0f172a] leading-tight mt-0.5">Total Volume</div>
                  <div className="text-[10.5px] text-[#94a3b8]">TROB</div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-[1px] bg-[#e2e8f0]" />

              {/* Progress Column: Apex Sovereign Rank */}
              <div className="flex flex-col min-w-[210px] xl:min-w-[240px]">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-[#0f172a]">6 Partners to Apex Sovereign Rank</span>
                  <span className="font-extrabold text-[#0f172a]">4 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563eb] w-[40%] transition-all duration-500" />
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Layout (< xl): Stacked Cards */}
            <div className="xl:hidden flex flex-col gap-3.5">
              {/* Top Row: User + Rank */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* ME Avatar with green badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm">
                      ME
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16a34a] border-2 border-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-bold text-[#0f172a] truncate">Your Status: Active Node</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-[#2563eb] flex-shrink-0">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("0x8A3F5B89127c4D9081e7492c1945Eb8712391F2")}
                      className="flex items-center gap-1 mt-0.5 text-[11px] font-mono text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"
                    >
                      <span className="truncate">0x8A3F...91F2</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                        <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right: Current Rank */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[8.5px] font-bold text-[#94a3b8] uppercase tracking-wider">CURRENT RANK</div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className="text-2xl font-black text-[#2563eb] leading-none">#14</span>
                    <span className="bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      Top 1%
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#f1f5f9]">
                <div className="min-w-0">
                  <div className="text-[10px] text-[#94a3b8] font-medium truncate">Direct Partners</div>
                  <div className="text-lg font-black text-[#0f172a] mt-0.5">4</div>
                  <div className="text-[9.5px] text-[#94a3b8] truncate">L1 invited</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-[#94a3b8] font-medium truncate">Matrix Cycles</div>
                  <div className="text-lg font-black text-[#0f172a] mt-0.5">12</div>
                  <div className="text-[9.5px] text-[#94a3b8] truncate">14-node resets</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-[#94a3b8] font-medium truncate">Total Volume</div>
                  <div className="text-base sm:text-lg font-black text-[#2563eb] mt-0.5 flex flex-wrap items-baseline gap-0.5">
                    <span>4,250</span> <span className="text-[9.5px] font-medium text-[#64748b]">TROB</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#16a34a]">+18.4%</div>
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="pt-2 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-between text-[11px] mb-1.5 gap-2">
                  <span className="font-bold text-[#0f172a] truncate text-[10px] sm:text-[11px]">6 Partners to Apex Sovereign Rank</span>
                  <span className="font-extrabold text-[#2563eb] text-[10px] sm:text-[11px] flex-shrink-0">4 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563eb] w-[40%]" />
                </div>
              </div>
            </div>
          </div>
    </>
  );
}
