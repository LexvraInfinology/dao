"use client";

import React, { useState, useEffect } from "react";
import { fetchDAOEvents, DAOEventItem } from "../../utils/equora/api";

type FilterType = "all" | "joined" | "pushed" | "retopup" | "pool_claimed";

export function DAOHistoryTable() {
  const [events, setEvents] = useState<DAOEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const data = await fetchDAOEvents(50);
        if (isMounted && data) {
          setEvents(data);
        }
      } catch (e) {
        // Handled silently
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "joined") return ev.eventType === "joined";
    if (activeFilter === "pushed") return ev.eventType === "pushed";
    if (activeFilter === "retopup") return ev.eventType === "retopup";
    if (activeFilter === "pool_claimed") return ev.eventType === "pool_claimed";
    return true;
  });

  return (
    <div className="bg-[#111827]/70 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      {/* Header & Live Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>📜</span> Live Genesis Council Activity Feed
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time on-chain record of joins, peer push yields, re-topups, and 35% pool claims.
          </p>
        </div>
        <span className="text-[11px] bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live Indexed Stream
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(
          [
            { id: "all", label: "All Activity" },
            { id: "joined", label: "Seat Joins 👑" },
            { id: "pushed", label: "Instant Yield ⚡" },
            { id: "retopup", label: "Re-topups 🔄" },
            { id: "pool_claimed", label: "35% Pool Claims 🏛️" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-400 text-sm animate-pulse">
          Connecting to indexed activity feed...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          No records found for this category yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Seat</th>
                <th className="py-3 px-3">Member</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">USD Est.</th>
                <th className="py-3 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredEvents.map((ev) => {
                let badge = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
                let label = ev.eventType.toUpperCase();

                if (ev.eventType === "pushed") {
                  badge = "bg-green-500/10 text-green-400 border-green-500/30";
                  label = "PUSHED ⚡";
                } else if (ev.eventType === "joined") {
                  badge = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                  label = "JOINED 👑";
                } else if (ev.eventType === "retopup") {
                  badge = "bg-purple-500/10 text-purple-400 border-purple-500/30";
                  label = "RE-TOPUP 🔄";
                } else if (ev.eventType === "pool_claimed") {
                  badge = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
                  label = "POOL CLAIM 🏛️";
                } else if (ev.eventType === "push_failed") {
                  badge = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                  label = "FALLBACK ⚠️";
                }

                return (
                  <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-sans font-semibold ${badge}`}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-sans">
                      {ev.incomingPosition ? `#${ev.incomingPosition}` : "-"}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      {ev.userAddress ? `${ev.userAddress.slice(0, 6)}...${ev.userAddress.slice(-4)}` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-yellow-400">
                      {ev.amountBtt} TROB
                    </td>
                    <td className="py-3 px-3 text-right text-gray-400">
                      ${(ev.amountUsdEstimate || ev.amountBtt).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 font-sans text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
