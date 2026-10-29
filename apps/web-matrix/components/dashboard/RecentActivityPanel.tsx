"use client";

import React from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore } from "@/lib/stores";

interface RecentActivityPanelProps {
  activities?: MatrixDashboardOverview["recentActivity"];
}

function timeAgo(dateStr: string | Date): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "Recently";
  }
}

export function RecentActivityPanel({ activities: propActivities }: RecentActivityPanelProps) {
  const storeActivities = useMatrixStore((s) => s.dashboard?.recentActivity);
  const activities = propActivities !== undefined ? propActivities : storeActivities;
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#e8ecf1] p-3.5 sm:p-4 lg:p-6 mb-6">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="text-[16px] sm:text-[17px] font-extrabold text-[#0f172a] truncate">Recent Activity</h3>
          <p className="text-[10.5px] sm:text-[11px] text-[#94a3b8] mt-0.5 leading-tight">
            Real-time ledger events recorded from your active matrix slots
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-[12px] font-semibold text-[#2563eb] flex items-center gap-1 hover:underline flex-shrink-0 whitespace-nowrap"
        >
          View All <span>→</span>
        </Link>
      </div>

      {/* Activity Items */}
      <div className="space-y-0 divide-y divide-[#f1f5f9]">
        {hasActivities ? (
          activities.map((act) => (
            <div key={act.id} className="flex items-center gap-3 py-3.5">
              <div className="w-[40px] h-[40px] rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                {act.action === "MEMBER_JOINED" ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3" stroke="#2563eb" strokeWidth="1.3" />
                    <path d="M4 17c0-2.21 2.686-4 6-4s6 1.79 6 4" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                ) : act.action === "REWARD_RECEIVED" || act.action === "COMMISSION_RECEIVED" ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="#2563eb" strokeWidth="1.3" />
                    <path d="M10 6v4l2.5 1.5" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="4" r="2" stroke="#2563eb" strokeWidth="1.2" />
                    <circle cx="5" cy="14" r="2" stroke="#2563eb" strokeWidth="1.2" />
                    <circle cx="15" cy="14" r="2" stroke="#2563eb" strokeWidth="1.2" />
                    <path d="M10 6v4M8 10L5 12M12 10l3 2" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-bold text-[#0f172a] block">{act.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#94a3b8] truncate block">{act.description}</span>
                  {act.txHash && (
                    <a
                      href={`https://trobscan.com/tx/${act.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#2563eb] hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      Tx Scan ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[11px] text-[#94a3b8]">{timeAgo(act.timestamp)}</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22c55e]">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />
                  {act.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mb-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-[13.5px] font-bold text-[#0f172a] mb-1">No Ledger Events Yet</p>
            <p className="text-[11.5px] text-[#64748b] max-w-xs leading-relaxed">
              Real-time matrix slot activations, node fills, and referral rewards will stream here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
