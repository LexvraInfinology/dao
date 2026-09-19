"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  tagColor: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "ID 85755",
    type: "New member",
    title: "New member joined",
    desc: "Welcome to the EQUORA_Fi network!",
    time: "Just now",
    icon: "👤",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "ID 74621",
    type: "Slot Opened",
    title: "New slot opened",
    desc: "A new opportunity is now live.",
    time: "14s ago",
    icon: "💎",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "ID 51204",
    type: "Upgrade",
    title: "Level upgrade completed",
    desc: "Unlocked Level 4 rewards & 2.0x multiplier.",
    time: "42s ago",
    icon: "🚀",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "ID 32901",
    type: "Recycle",
    title: "Slot cycle complete",
    desc: "700% profit yielded directly to TrobSafe wallet.",
    time: "1m ago",
    icon: "⚡",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "ID 99012",
    type: "DAO Share",
    title: "DAO payout dispatched",
    desc: "Perpetual 15% matrix push to seat holder.",
    time: "2m ago",
    icon: "🏛️",
    tagColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
];

export function LiveActivityFeedSection() {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Subtle real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIds = ["ID 10482", "ID 67193", "ID 88204", "ID 45199", "ID 91823"];
      const newItems: ActivityItem[] = [
        {
          id: randomIds[Math.floor(Math.random() * randomIds.length)],
          type: "Matrix Entry",
          title: "New member onboarded",
          desc: "Growing stronger, together in Cycle 1.",
          time: "Just now",
          icon: "🌟",
          tagColor: "bg-blue-50 text-blue-700 border-blue-200",
        },
        {
          id: randomIds[Math.floor(Math.random() * randomIds.length)],
          type: "Reward Payout",
          title: "Live TROB drop claimed",
          desc: "Instant wallet push processed autonomously.",
          time: "Just now",
          icon: "⚡",
          tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
      ];

      const chosen = newItems[Math.floor(Math.random() * newItems.length)];
      setActivities((prev) => [chosen, ...prev.slice(0, 4)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="activity" className="py-20 sm:py-24 lg:py-28 bg-[#F0F4F8] relative overflow-hidden">
      {/* Background Panorama matching Figma: boy pointing on right over mountains */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img
          src="/assets/images/Desktop - 6.png"
          alt="EQUORA activity stream panorama with character"
          className="w-full h-full object-cover object-[80%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F0F4F8] via-transparent to-[#F0F4F8]/80" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#2563EB] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3 block">
            LIVE ACTIVITY STREAM
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-[#0A1628] tracking-tight leading-[1.12] mb-3 sm:mb-4">
            The Network Is <br />
            <span className="text-[#2563EB]">
              Always Moving.
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#475569] leading-relaxed max-w-xl mx-auto">
            Real-time activity and network growth happening right now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Live Activity Feed Card matching Figma */}
          <div className="lg:col-span-7 xl:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-[#E2E8F0] shadow-xl shadow-black/5">
            {/* Feed Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0A1628]">
                  Latest Activity (Last 1 Hour: 1,842 TXs)
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Autonomous decentralized event logs
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span>Live Stream</span>
              </div>
            </div>

            {/* Event List */}
            <div className="space-y-2.5">
              {activities.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-blue-50/40 border border-[#E2E8F0] hover:border-blue-200 transition-all duration-200 flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#0A1628] group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </span>
                        <span
                          className={`hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${item.tagColor}`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="font-mono text-xs font-bold text-[#0A1628] block">
                      {item.id}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-medium">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Feed Status */}
            <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Streaming block events via RPC</span>
              <span className="font-bold text-[#2563EB] cursor-pointer hover:underline">
                View more on Explorer →
              </span>
            </div>
          </div>

          {/* Right Column: Space where the 3D Character in background image points at the table */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-center relative min-h-[400px]">
            {/* Real-time sync floating badge positioned next to pointing finger */}
            <div className="backdrop-blur-md bg-white/95 border border-white/80 rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2 mr-6">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-xs font-bold text-[#0A1628]">Real-Time Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
