"use client";

import React from "react";

export function MatrixMechanismSection() {
  return (
    <section
      id="levels"
      className="w-full pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18 bg-[#f1f5f9] relative z-10 scroll-mt-[70px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          {/* ────────────── LEFT COLUMN: TEXT & TIMELINE ────────────── */}
          <div className="lg:col-span-5 flex flex-col items-start text-left lg:pt-4">
            {/* Eyebrow */}
            <div className="text-xs sm:text-[13px] font-bold tracking-[0.2em] text-[#0f172a] uppercase mb-4">
              THE 12-SLOT MATRIX
            </div>

            {/* Heading: How the Matrix Works */}
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#0b132b] tracking-tight leading-[1.1] mb-5">
              How the <br />
              Matrix <span className="text-[#2563eb]">Works</span>
            </h2>

            {/* Subtitle - Exact copy from Figma */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              You start at Slot 1. As new members join, the matrix fills
              automatically, moving you and your network forward — unlocking
              higher slots and rewards
            </p>

            {/* Vertical 3-Step Timeline */}
            <div className="relative pl-10 space-y-8 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-blue-100">
              {/* Step 01 */}
              <div className="relative">
                <div className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-blue-200 bg-white text-[#2563eb] flex items-center justify-center text-xs font-bold shadow-xs">
                  01
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b132b] leading-tight">
                    Join the Matrix
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
                    Start with just $30 USDT and get placed in Slot 1.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative">
                <div className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-blue-200 bg-white text-[#2563eb] flex items-center justify-center text-xs font-bold shadow-xs">
                  02
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b132b] leading-tight">
                    Network Grows
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
                    As new members join, slots are filled automatically.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative">
                <div className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-blue-200 bg-white text-[#2563eb] flex items-center justify-center text-xs font-bold shadow-xs">
                  03
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0b132b] leading-tight">
                    Move & Earn
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
                    Advance to higher slots and earn real rewards on-chain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ────────────── RIGHT COLUMN: MATRIX TREE DASHBOARD CARD ────────────── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-5 sm:p-6 lg:p-5 xl:p-8">
              {/* Header inside Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                {/* Your Position */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">
                    YOUR POSITION
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-black text-[#0b132b]">
                      Slot 1
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 text-xs font-semibold inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    Filled Position
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-[#2563eb]" />
                    Open Position
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-slate-300" />
                    Upcoming Position
                  </span>
                </div>
              </div>

              {/* Matrix Binary Tree Visual Container */}
              <div className="py-6 sm:py-8 w-full overflow-x-auto overflow-y-hidden">
                <div className="w-[560px] mx-auto flex flex-col items-center">
                  {/* Root Node: YOU */}
                  <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/20 text-xs sm:text-sm">
                    YOU
                  </div>

                  {/* Connector: Root to Level 1 */}
                  <svg
                    className="w-[560px] h-8 overflow-visible"
                    viewBox="0 0 560 32"
                    fill="none"
                  >
                    <path
                      d="M 280 0 V 16 H 140 V 32 M 280 16 H 420 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                  </svg>

                  {/* Level 1: 2 Nodes (1, 2) */}
                  <div className="w-[560px] flex justify-between px-[108px]">
                    {/* Node 1: Filled */}
                    <div className="w-16 bg-[#eff6ff] border border-blue-200/90 rounded-2xl py-2 flex flex-col items-center">
                      <span className="font-bold text-[#0b132b] text-xs sm:text-sm">
                        1
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-[10px] text-[#2563eb] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                        Filled
                      </span>
                    </div>

                    {/* Node 2: Filled */}
                    <div className="w-16 bg-[#eff6ff] border border-blue-200/90 rounded-2xl py-2 flex flex-col items-center">
                      <span className="font-bold text-[#0b132b] text-xs sm:text-sm">
                        2
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-[10px] text-[#2563eb] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                        Filled
                      </span>
                    </div>
                  </div>

                  {/* Connector: Level 1 to Level 2 */}
                  <svg
                    className="w-[560px] h-8 overflow-visible"
                    viewBox="0 0 560 32"
                    fill="none"
                  >
                    {/* From Node 1 (x=140) -> 3 (x=70) & 4 (x=210) */}
                    <path
                      d="M 140 0 V 16 H 70 V 32 M 140 16 H 210 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                    {/* From Node 2 (x=420) -> 5 (x=350) & 6 (x=490) */}
                    <path
                      d="M 420 0 V 16 H 350 V 32 M 420 16 H 490 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                  </svg>

                  {/* Level 2: 4 Nodes (3, 4, 5, 6) */}
                  <div className="w-[560px] flex justify-between px-[41px]">
                    {/* Node 3: Filled */}
                    <div className="w-[58px] bg-[#eff6ff] border border-blue-200/90 rounded-2xl py-2 flex flex-col items-center">
                      <span className="font-bold text-[#0b132b] text-xs sm:text-sm">
                        3
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-[10px] text-[#2563eb] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                        Filled
                      </span>
                    </div>

                    {/* Node 4: Open */}
                    <div className="w-[58px] bg-white border border-slate-200/90 rounded-2xl py-2 flex flex-col items-center">
                      <span className="font-bold text-[#0b132b] text-xs sm:text-sm">
                        4
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                        Open
                      </span>
                    </div>

                    {/* Node 5: Open */}
                    <div className="w-[58px] bg-white border border-slate-200/90 rounded-2xl py-2 flex flex-col items-center">
                      <span className="font-bold text-[#0b132b] text-xs sm:text-sm">
                        5
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                        Open
                      </span>
                    </div>

                    {/* Node 6: Open */}
                    <div className="w-[58px] bg-white border border-slate-200/90 rounded-2xl py-2 flex flex-col items-center">
                      <span className="font-bold text-[#0b132b] text-xs sm:text-sm">
                        6
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                        Open
                      </span>
                    </div>
                  </div>

                  {/* Connector: Level 2 to Level 3 */}
                  <svg
                    className="w-[560px] h-8 overflow-visible"
                    viewBox="0 0 560 32"
                    fill="none"
                  >
                    {/* From Node 3 (x=70) -> 7 (x=35) & 8 (x=105) */}
                    <path
                      d="M 70 0 V 16 H 35 V 32 M 70 16 H 105 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                    {/* From Node 4 (x=210) -> 9 (x=175) & 10 (x=245) */}
                    <path
                      d="M 210 0 V 16 H 175 V 32 M 210 16 H 245 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                    {/* From Node 5 (x=350) -> 11 (x=315) & 12 (x=385) */}
                    <path
                      d="M 350 0 V 16 H 315 V 32 M 350 16 H 385 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                    {/* From Node 6 (x=490) -> 13 (x=455) & 14 (x=525) */}
                    <path
                      d="M 490 0 V 16 H 455 V 32 M 490 16 H 525 V 32"
                      stroke="#bfdbfe"
                      strokeWidth="1.5"
                    />
                  </svg>

                  {/* Level 3: 8 Nodes (7 through 14) */}
                  <div className="w-[560px] flex justify-between px-[7px]">
                    {[7, 8, 9, 10, 11, 12, 13, 14].map((nodeNum) => (
                      <div
                        key={nodeNum}
                        className="w-[56px] bg-white border border-slate-200/90 rounded-2xl py-2 flex flex-col items-center"
                      >
                        <span className="font-bold text-[#0b132b] text-xs">
                          {nodeNum}
                        </span>
                        <span className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                          Open
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Metrics: 3 Columns matching Figma */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-3 text-left divide-x divide-slate-100">
                <div className="px-2 sm:px-4 md:px-6">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0b132b] tracking-tight">
                    1/14
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 whitespace-normal sm:whitespace-nowrap">
                    Nodes Filled
                  </div>
                </div>

                <div className="px-2 sm:px-4 md:px-6">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0b132b] tracking-tight">
                    12
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 whitespace-normal sm:whitespace-nowrap">
                    Progressive Slots
                  </div>
                </div>

                <div className="px-2 sm:px-4 md:px-6">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0b132b] tracking-tight">
                    Auto
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 whitespace-normal sm:whitespace-nowrap">
                    Progression
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
