"use client";

import React, { useState } from "react";
import { MatrixTransactionItem } from "@/lib/api";
import { useFinanceStore } from "@/lib/stores";

export interface Transaction {
  id: string;
  type: "direct" | "level" | "referral";
  typeName: string;
  description: string;
  subDescriptionMobile: string;
  subDescriptionDesktop: string;
  amount: number;
  date: string;
  time: string;
  status: "Completed" | "Pending";
}

export interface RecentPayoutsTableProps {
  payouts?: MatrixTransactionItem[];
}

export function RecentPayoutsTable({ payouts: propPayouts }: RecentPayoutsTableProps) {
  const storePayouts = useFinanceStore((s) => s.earnings?.recentPayouts);
  const payouts = propPayouts !== undefined ? propPayouts : storePayouts;
  const [activeTxFilter, setActiveTxFilter] = useState("All");
  const [txFilterDropdownOpen, setTxFilterDropdownOpen] = useState(false);

  const defaultTransactions: Transaction[] = [
    {
      id: "tx-1",
      type: "direct",
      typeName: "Direct Reward",
      description: "Direct Reward",
      subDescriptionMobile: "Pos #02 (0x3A2...9F1C)",
      subDescriptionDesktop: "From position #02 (0x3A2...9F1C)",
      amount: 25.0,
      date: "14 Sep 2026",
      time: "10:24 AM",
      status: "Completed",
    },
    {
      id: "tx-2",
      type: "level",
      typeName: "Level Reward",
      description: "Level Reward",
      subDescriptionMobile: "Level 1 matrix completion",
      subDescriptionDesktop: "Level 1 matrix completion",
      amount: 17.5,
      date: "15 Sep 2026",
      time: "02:15 PM",
      status: "Completed",
    },
    {
      id: "tx-3",
      type: "referral",
      typeName: "Referral Bonus",
      description: "Referral Bonus",
      subDescriptionMobile: "New member joined network",
      subDescriptionDesktop: "New member joined",
      amount: 15.0,
      date: "16 Sep 2026",
      time: "11:40 AM",
      status: "Completed",
    },
    {
      id: "tx-4",
      type: "level",
      typeName: "Level Reward",
      description: "Level Reward",
      subDescriptionMobile: "Level 1 matrix completion",
      subDescriptionDesktop: "Level 1 matrix completion",
      amount: 10.0,
      date: "17 Sep 2026",
      time: "09:18 AM",
      status: "Completed",
    },
  ];

  const allTransactions: Transaction[] = (payouts && payouts.length > 0)
    ? payouts.map((p) => {
        const isDirect = p.type.toLowerCase().includes("direct") || p.type.toLowerCase().includes("slot");
        const isLevel = p.type.toLowerCase().includes("level") || p.type.toLowerCase().includes("override");
        const kind: "direct" | "level" | "referral" = isDirect ? "direct" : isLevel ? "level" : "referral";
        const dt = new Date(p.timestamp);
        return {
          id: p.id,
          type: kind,
          typeName: p.type.replace(/_/g, " "),
          description: p.description || "Matrix Reward",
          subDescriptionMobile: p.slotIndex ? `Slot #${p.slotIndex}` : p.description || "Node placement",
          subDescriptionDesktop: p.txHash ? `Tx: ${p.txHash.slice(0, 10)}...` : p.description || "Node placement",
          amount: p.amount,
          date: dt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
          time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          status: p.status === "COMPLETED" ? "Completed" : "Pending",
        };
      })
    : defaultTransactions;

  const filteredTransactions = allTransactions.filter((tx) => {
    if (activeTxFilter === "All" || activeTxFilter === "All Transactions") return true;
    if (activeTxFilter === "Direct Rewards" && tx.type === "direct") return true;
    if (activeTxFilter === "Level Rewards" && tx.type === "level") return true;
    if (activeTxFilter === "Referral Bonuses" && tx.type === "referral") return true;
    return true;
  });

  return (
          <div className="bg-white rounded-2xl border border-[#eef2f6] p-4 sm:p-5 lg:p-6 shadow-xs">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div>
                <h2 className="text-[16px] lg:text-[18px] font-black text-[#0f172a] tracking-tight">
                  Recent Transactions
                </h2>
                {/* On-chain verified records subtitle shown on mobile */}
                <p className="text-[12px] text-[#64748b] mt-0.5">On-chain verified records</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#2563eb] text-[12px] font-bold transition-colors cursor-pointer"
                >
                  <span>View Matrix Explorer</span>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3.5 10.5L10.5 3.5M10.5 3.5H5.5M10.5 3.5V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Filter Control */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTxFilterDropdownOpen(!txFilterDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[12px] text-[#475569] font-semibold transition-colors cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="text-[#64748b]">
                      <path d="M2 3.5h10M4 7h6M6 10.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>{activeTxFilter === "All" ? "All Transactions" : activeTxFilter}</span>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2.5 4L5 6.5 7.5 4" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                {/* Dropdown Menu */}
                {txFilterDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 py-1 text-[12px]">
                    {["All", "Direct Rewards", "Level Rewards", "Referral Bonuses"].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setActiveTxFilter(filter);
                          setTxFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-[#f8fafc] cursor-pointer ${
                          activeTxFilter === filter ? "text-[#2563eb] font-bold bg-[#eff6ff]" : "text-[#334155]"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ───── TABLE VIEW (Visible on >= 768px) ───── */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <div className="min-w-[680px]">
                {/* Table Column Headers */}
                <div className="grid grid-cols-12 py-3 border-b border-[#f1f5f9] text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider px-3">
                  <div className="col-span-3">TYPE</div>
                  <div className="col-span-3">DESCRIPTION</div>
                  <div className="col-span-2">AMOUNT</div>
                  <div className="col-span-2">DATE & TIME</div>
                  <div className="col-span-2 text-right pr-2">STATUS</div>
                </div>

                {/* Table Rows (Desktop shows top 4 transactions like Figma desktop screenshot) */}
                <div className="divide-y divide-[#f8fafc]">
                  {filteredTransactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      className="grid grid-cols-12 items-center py-3.5 px-3 rounded-xl hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                    >
                      {/* TYPE */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
                          {tx.type === "direct" && (
                            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                              <path d="M7 9a3 3 0 100-6 3 3 0 000 6zM13 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 17c0-2.5 3-4 6-4s6 1.5 6 4" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          )}
                          {tx.type === "level" && (
                            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="10" r="2.5" fill="#2563eb" />
                              <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.5 4.5l3 3M12.5 12.5l3 3M15.5 4.5l-3 3M7.5 12.5l-3 3" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          )}
                          {tx.type === "referral" && (
                            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                              <rect x="3" y="7.5" width="14" height="10" rx="1.8" stroke="#2563eb" strokeWidth="1.6" />
                              <path d="M2 5.5h16v2H2zM10 4v13.5" stroke="#2563eb" strokeWidth="1.5" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[13px] font-bold text-[#0f172a] whitespace-nowrap truncate">{tx.typeName}</span>
                      </div>

                      {/* DESCRIPTION */}
                      <div className="col-span-3 pr-3 min-w-0">
                        <div className="text-[13px] font-bold text-[#0f172a] truncate">{tx.description}</div>
                        <div className="text-[12px] text-[#64748b] truncate">{tx.subDescriptionDesktop}</div>
                      </div>

                      {/* AMOUNT */}
                      <div className="col-span-2 whitespace-nowrap">
                        <span className="text-[13.5px] font-black text-[#0f172a]">
                          +{tx.amount.toFixed(2)} TROB
                        </span>
                      </div>

                      {/* DATE & TIME */}
                      <div className="col-span-2 whitespace-nowrap">
                        <div className="text-[12px] font-semibold text-[#0f172a]">{tx.date}</div>
                        <div className="text-[11px] text-[#64748b]">{tx.time}</div>
                      </div>

                      {/* STATUS + CHEVRON */}
                      <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
                        <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-bold whitespace-nowrap shadow-2xs">
                          {tx.status}
                        </span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-[#94a3b8] group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                        >
                          <path d="M5 3.5L8.5 7 5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ───── MOBILE LIST VIEW (Visible on < 768px) ───── */}
            <div className="md:hidden divide-y divide-[#f1f5f9]">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 first:pt-1 last:pb-1 cursor-pointer active:bg-[#f8fafc]"
                >
                  {/* Left: Icon + Description + Date */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
                      {tx.type === "direct" && (
                        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                          <path d="M7 9a3 3 0 100-6 3 3 0 000 6zM13 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 17c0-2.5 3-4 6-4s6 1.5 6 4" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      )}
                      {tx.type === "level" && (
                        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="2.5" fill="#2563eb" />
                          <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.5 4.5l3 3M12.5 12.5l3 3M15.5 4.5l-3 3M7.5 12.5l-3 3" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      )}
                      {tx.type === "referral" && (
                        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                          <rect x="3" y="7.5" width="14" height="10" rx="1.8" stroke="#2563eb" strokeWidth="1.6" />
                          <path d="M2 5.5h16v2H2zM10 4v13.5" stroke="#2563eb" strokeWidth="1.5" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <div className="text-[13px] font-black text-[#0f172a] leading-tight">
                        {tx.description}
                      </div>
                      <div className="text-[11.5px] text-[#64748b] mt-0.5 leading-tight">
                        {tx.subDescriptionMobile}
                      </div>
                      <div className="text-[11px] text-[#94a3b8] mt-0.5">
                        {tx.date} • {tx.time}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Completed Badge + Chevron */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[13.5px] font-black text-[#0f172a]">
                        +{tx.amount.toFixed(2)} <span className="text-[#2563eb] font-bold">TROB</span>
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#16a34a] text-[10px] font-bold">
                        {tx.status}
                      </span>
                    </div>

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#94a3b8]">
                      <path d="M5 3.5L8.5 7 5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Button for small screens (< sm) */}
            <div className="mt-4 pt-1 sm:hidden">
              <button
                type="button"
                className="w-full py-2.5 sm:py-3 bg-[#f8fafc] hover:bg-[#f1f5f9] active:bg-[#edf5ff] border border-[#e2e8f0] rounded-xl text-[#2563eb] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Matrix Explorer</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 10.5L10.5 3.5M10.5 3.5H5.5M10.5 3.5V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
  );
}
