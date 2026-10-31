"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EXPLORER_URL, NETWORK_NAME, CONTRACT_ADDRESSES } from "@/lib/contracts";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "pool" | "rank" | "magicbox" | "tx";
  timestamp: string;
  badge: string;
  badgeColor: string;
  isUnread?: boolean;
  link?: string;
  linkText?: string;
}

interface ProtocolNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProtocolNotificationsModal({
  isOpen,
  onClose,
}: ProtocolNotificationsModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pool" | "rank" | "magicbox" | "tx">("all");
  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    new Set(["notif-1", "notif-2", "notif-3", "notif-4"])
  );

  const notifications: NotificationItem[] = [
    {
      id: "notif-1",
      title: "DAO 35% Pool: Instant Block Payouts Active",
      description:
        "Every matrix slot placement immediately streams 35% directly to active Genesis Council members' wallets. Zero funds sit idle in contract balance.",
      category: "pool",
      timestamp: "Real-time • Block by Block",
      badge: "DAO POOL 35%",
      badgeColor: "bg-[#e8f1ff] text-[#2868e8] border-[#d2e4ff]",
      link: "/dashboard",
      linkText: "View DAO Pool",
    },
    {
      id: "notif-2",
      title: "Rank Milestone Bounties: 21st Monthly Fair Settlement",
      description:
        "Rank reward pool (15%) settles on the 21st of every month. Divided equally among all qualified cycle achievers in each tier (Alpha 10%, Prime 15%, Elite 25%, Crown 50%) to prevent early bird drain.",
      category: "rank",
      timestamp: "Settlement: 21st Monthly at 00:00 UTC",
      badge: "21ST SETTLEMENT",
      badgeColor: "bg-[#ecfdf5] text-[#0e9f79] border-[#bbf7d0]",
      link: "/dashboard",
      linkText: "Check Rank Timers",
    },
    {
      id: "notif-3",
      title: "Leadership Royalty: 11th Monthly Equity Dividend",
      description:
        "40% Leadership Royalty pool settles on the 11th day of each month at 00:00 UTC across all unlocked Rank Cards.",
      category: "pool",
      timestamp: "Settlement: 11th Monthly at 00:00 UTC",
      badge: "11TH ROYALTY",
      badgeColor: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
      link: "/dashboard",
      linkText: "View Leadership Royalty",
    },
    {
      id: "notif-4",
      title: "Magic Blind Box: Strict 1x Lifetime Gift for New Operatives",
      description:
        "Quarterly Community Pool (10%) distributes random mystery gifts ($0.80 - $5.00) when the 3-month timer expires. Strictly one-time per wallet forever—subsequent quarters reward NEW active users only.",
      category: "magicbox",
      timestamp: "Quarterly Milestone Cycle",
      badge: "1X LIFETIME ONLY",
      badgeColor: "bg-[#f0edff] text-[#7256d8] border-[#dcd6fa]",
      link: "/dashboard",
      linkText: "Inspect 3-Month Timer",
    },
    {
      id: "notif-5",
      title: "EquoraMatrix On-Chain Contract Synced",
      description:
        `Contract ${CONTRACT_ADDRESSES.matrix} is operating normally on ${NETWORK_NAME} with automated $0 slot progressions.`,
      category: "tx",
      timestamp: NETWORK_NAME,
      badge: "VERIFIED EVM",
      badgeColor: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
      link: `${EXPLORER_URL}/#/contract/${CONTRACT_ADDRESSES.matrix}`,
      linkText: "Explorer Account",
    },
    {
      id: "notif-6",
      title: "DAO Contract Treasury Sync",
      description:
        `EquoraDAOv2 contract ${CONTRACT_ADDRESSES.dao} verified on ${NETWORK_NAME}. Instant flush mechanism available.`,
      category: "tx",
      timestamp: NETWORK_NAME,
      badge: "DAO V2",
      badgeColor: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
      link: `${EXPLORER_URL}/#/contract/${CONTRACT_ADDRESSES.dao}`,
      linkText: "Explorer Contract",
    },
  ];

  const filtered = notifications.filter((n) => {
    if (selectedFilter === "all") return true;
    return n.category === selectedFilter;
  });

  const handleMarkAllRead = () => {
    setUnreadIds(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl border border-[#e0eaf7] shadow-[0_20px_60px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-[#102341]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#edf2fa] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eff6ff] border border-[#d2e4ff] flex items-center justify-center text-[#2563eb]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-black text-[#102341] tracking-tight">
                  Protocol Alerts &amp; Feed
                </h3>
                {unreadIds.size > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#ef4444] text-white text-[10px] font-black">
                    {unreadIds.size} New
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[#657895]">
                Real-time on-chain distributions, pool cadences, and ledger updates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f8fe] hover:bg-[#e8f1ff] flex items-center justify-center text-[#657895] hover:text-[#102341] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar & Quick Actions */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#f8fbff] border-b border-[#edf2fa] flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: "all", label: "All" },
                { key: "pool", label: "Pools" },
                { key: "rank", label: "21st Rank" },
                { key: "magicbox", label: "Magic Box" },
                { key: "tx", label: "On-Chain" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedFilter === tab.key
                    ? "bg-[#2563eb] text-white shadow-2xs"
                    : "bg-white text-[#657895] border border-[#e2e8f0] hover:bg-[#f1f5f9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadIds.size > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[#2563eb] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {filtered.map((item) => {
            const isUnread = unreadIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isUnread
                    ? "bg-white border-[#bfdbfe] shadow-[0_4px_16px_rgba(37,99,235,0.06)]"
                    : "bg-[#f8fbff] border-[#e8ecf1]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-[#94a3b8] font-mono">
                    {item.timestamp}
                  </span>
                </div>

                <h4 className="text-[13.5px] font-bold text-[#102341] mt-1 leading-snug">
                  {item.title}
                </h4>

                <p className="text-[11.5px] text-[#657895] mt-1 leading-relaxed">
                  {item.description}
                </p>

                {item.link && (
                  <div className="mt-2.5 pt-2 border-t border-[#edf2fa] flex items-center justify-between">
                    {item.link.startsWith("http") ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#2563eb] hover:underline flex items-center gap-1"
                      >
                        <span>{item.linkText || "View on Explorer"}</span>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3 9L9 3M9 3H4M9 3V8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={item.link}
                        onClick={onClose}
                        className="text-[11px] font-bold text-[#2563eb] hover:underline flex items-center gap-1"
                      >
                        <span>{item.linkText || "View Details"}</span>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3 9L9 3M9 3H4M9 3V8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fbff] border-t border-[#edf2fa] flex items-center justify-between">
          <Link
            href="/transactions"
            onClick={onClose}
            className="text-[12px] font-bold text-[#2563eb] hover:underline flex items-center gap-1"
          >
            <span>Open Full Transaction Ledger</span>
            <span>→</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-bold shadow-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
