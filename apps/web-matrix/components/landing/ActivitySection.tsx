"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "member" | "position" | "progress" | "reward";
  title: string;
  subtitle: string;
  memberId: string;
  time: string;
  isNew?: boolean;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "member",
    title: "New member joined",
    subtitle: "Welcome to the EQUORA_Fi network!",
    memberId: "ID 85755",
    time: "just now",
    isNew: true,
  },
  {
    id: "act-2",
    type: "position",
    title: "Position Filled",
    subtitle: "Level 2 · Slot 11",
    memberId: "ID 74621",
    time: "18 sec ago",
  },
  {
    id: "act-3",
    type: "member",
    title: "New member joined",
    subtitle: "Growing stronger, together.",
    memberId: "ID 32901",
    time: "32 sec ago",
  },
  {
    id: "act-4",
    type: "progress",
    title: "Level progress updated",
    subtitle: "Member #10291 · Level 4",
    memberId: "ID 27390",
    time: "1 min ago",
  },
  {
    id: "act-5",
    type: "reward",
    title: "Reward Credited",
    subtitle: "#10082 · 142.50 TROB",
    memberId: "ID 91827",
    time: "2 min ago",
  },
];

export function ActivitySection() {
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
            See the latest Matrix activity happening across the ecosystem.
          </p>
        </div>

        {/* ── Main Activity Card ── */}
        <div className="w-full max-w-[620px] mx-auto bg-white/95 backdrop-blur-md rounded-[26px] sm:rounded-[32px] border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08),0_4px_16px_rgba(0,0,0,0.03)] p-3.5 sm:p-5 md:p-6 lg:p-7">
          
          {/* Top Status Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse flex-shrink-0" />
              <span className="text-[11.5px] sm:text-[12.5px] font-black text-[#0b132b] tracking-wider uppercase flex-shrink-0">
                LIVE
              </span>
              <span className="h-3 w-px bg-slate-200 mx-0.5 sm:mx-1 flex-shrink-0" />
              <span className="text-[11px] sm:text-[12px] text-slate-500 font-medium truncate">
                <span className="hidden sm:inline">Real activity from the EQUORA_Fi network</span>
                <span className="sm:hidden">EQUORA_Fi network</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-[10px] sm:text-[11.5px] text-slate-500 font-medium whitespace-nowrap">
                Updating in real-time
              </span>
            </div>
          </div>

          {/* Activity Rows List */}
          <div className="divide-y divide-slate-100/80 pt-0.5 sm:pt-1">
            {ACTIVITIES.map((act) => {
              const isAvatar = act.type === "member" || act.type === "reward";
              const isPosition = act.type === "position";
              const isProgress = act.type === "progress";

              return (
                <div
                  key={act.id}
                  className="py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-3 group hover:bg-slate-50/70 rounded-2xl px-1 sm:px-2 -mx-1 sm:-mx-2 transition-colors"
                >
                  {/* Left: Avatar or Icon + Titles */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    {/* Media container 50px x 50px matching Figma */}
                    <div className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] rounded-[14px] sm:rounded-[16px] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                      {isAvatar ? (
                        <img
                          src="/activity-avatar.jpg"
                          alt="Member"
                          className="w-full h-full object-cover"
                        />
                      ) : isPosition ? (
                        <div className="w-full h-full bg-[#eff6ff] border border-blue-100 rounded-[14px] sm:rounded-[16px] flex items-center justify-center text-[#2563eb]">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                      ) : isProgress ? (
                        <div className="w-full h-full bg-[#eff6ff] border border-blue-100 rounded-[14px] sm:rounded-[16px] flex items-center justify-center text-[#2563eb]">
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
                      <h4 className="text-[13px] sm:text-[14.5px] font-bold text-[#0b132b] leading-tight truncate">
                        {act.title}
                      </h4>
                      <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium mt-0.5 truncate">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Member ID, Timestamp, Dot Indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 flex-shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-[11px] sm:text-[12.5px] font-bold text-slate-700 whitespace-nowrap">
                        {act.memberId}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          act.isNew ? "bg-[#2563eb]" : "bg-slate-300"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] sm:text-[11.5px] text-slate-400 font-medium whitespace-nowrap">
                      {act.time}
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
              <span>View More Activity</span>
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
