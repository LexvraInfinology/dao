"use client";

import React, { useState } from "react";

export type TxType = "Receive" | "Send" | "Matrix Cycle" | "Partner Reward";
export type FilterTab = "All Transactions" | "Received" | "Sent" | "Rewards" | "Matrix" | "Partner" | "System";

export interface Transaction {
  id: number;
  type: TxType;
  from: string;
  to: string;
  amount: number;
  amountDisplay: string;
  status: "Confirmed" | "Pending" | "Failed";
  date: string;
  time: string;
  txHash: string;
}



const TypeIcon = ({ type, sm = false }: { type: TxType; sm?: boolean }) => {
  const sz = sm ? 12 : 14;
  const cls = sm ? "w-7 h-7" : "w-8 h-8";
  if (type === "Receive")
    return (
      <div className={`${cls} rounded-full bg-[#ecfdf5] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16M5 15l7 7 7-7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  if (type === "Send")
    return (
      <div className={`${cls} rounded-full bg-[#fff1f2] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
          <path d="M12 20V4M5 11l7-7 7 7" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  if (type === "Matrix Cycle")
    return (
      <div className={`${cls} rounded-full bg-[#f5f3ff] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="1.8" fill="none" />
          <path d="M12 8v4l3 2" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M2 12h4M22 12h-4M12 2v4M12 22v-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  return (
    <div className={`${cls} rounded-full bg-[#eff6ff] flex items-center justify-center flex-shrink-0`}>
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="#2563eb" strokeWidth="1.8" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 010 7.75" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" />
    <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" />
  </svg>
);

import { MatrixTransaction } from "@/lib/api";
import { useFinanceStore } from "@/lib/stores";

export interface TransactionsTableProps {
  copy: (t: string) => void;
  items?: MatrixTransaction[];
}

export function TransactionsTable({ copy, items: propItems }: TransactionsTableProps) {
  const storeItems = useFinanceStore((s) => s.transactions);
  const items = propItems !== undefined ? propItems : storeItems;
  const [activeTab, setActiveTab] = useState<FilterTab>("All Transactions");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  const ALL_TABS: FilterTab[] = ["All Transactions", "Received", "Sent", "Rewards", "Matrix", "Partner", "System"];

  const activeTransactions: Transaction[] =
    items && items.length > 0
      ? items.map((t, idx) => {
          const isSend = t.type === "WITHDRAWAL" || t.type === "SLOT_PURCHASE";
          const txType: TxType =
            t.type === "CYCLE_COMPLETED"
              ? "Matrix Cycle"
              : t.type === "COMMISSION_EARNED"
              ? "Partner Reward"
              : isSend
              ? "Send"
              : "Receive";

          const d = new Date(t.timestamp);
          return {
            id: idx + 1,
            type: txType,
            from: isSend ? "You" : t.fromAddress ? `${t.fromAddress.slice(0, 6)}...` : "Network",
            to: isSend ? (t.toAddress ? `${t.toAddress.slice(0, 6)}...` : "System") : "You",
            amount: isSend ? -t.amount : t.amount,
            amountDisplay: `${isSend ? "-" : "+"} ${Number(t.amount).toFixed(2)}`,
            status: t.status === "COMPLETED" ? "Confirmed" : t.status === "PENDING" ? "Pending" : "Failed",
            date: d.toLocaleDateString(),
            time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            txHash: t.txHash ? `${t.txHash.slice(0, 7)}...${t.txHash.slice(-4)}` : "0x000...0000",
          };
        })
      : [];

  const filtered = activeTransactions.filter((tx) => {
    if (activeTab === "Received" && tx.type !== "Receive") return false;
    if (activeTab === "Sent" && tx.type !== "Send") return false;
    if (activeTab === "Rewards" && tx.type !== "Partner Reward") return false;
    if (activeTab === "Matrix" && tx.type !== "Matrix Cycle") return false;
    if (activeTab === "Partner" && tx.type !== "Partner Reward") return false;
    if (activeTab === "System" && tx.type !== "Matrix Cycle") return false;

    if (selectedType !== "All Types" && tx.type !== selectedType) return false;
    if (selectedStatus !== "All Status" && tx.status !== selectedStatus) return false;
    return true;
  });

  return (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">

            {/* Unified tab bar */}
            <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-0 border-b border-[#f1f5f9] min-w-0 overflow-x-auto no-scrollbar gap-2">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {ALL_TABS.map((tab) => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${activeTab === tab ? "border-[#2563eb] text-[#2563eb] bg-[#eff6ff] rounded-t-lg" : "border-transparent text-[#64748b] hover:text-[#0f172a]"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2 pb-1 flex-shrink-0">
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[12px] font-medium text-[#334155] hover:bg-[#f1f5f9] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Receive">Receive</option>
                    <option value="Send">Send</option>
                    <option value="Partner Reward">Partner Reward</option>
                    <option value="Matrix Cycle">Matrix Cycle</option>
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[12px] font-medium text-[#334155] hover:bg-[#f1f5f9] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table (visible on tablet md 768px and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px] min-w-[760px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="py-3 px-4 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase w-10">#</th>
                    <th className="py-3 px-4 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">TYPE</th>
                    <th className="py-3 px-4 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">FROM</th>
                    <th className="py-3 px-4 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">TO</th>
                    <th className="py-3 px-4 text-right text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">AMOUNT</th>
                    <th className="py-3 px-4 text-center text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">STATUS</th>
                    <th className="py-3 px-4 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">DATE &amp; TIME</th>
                    <th className="py-3 px-4 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase">TX HASH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#94a3b8] text-[13px]">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#f8fafc]/80 transition-colors cursor-pointer">
                        <td className="py-3.5 px-4 text-[#94a3b8] font-medium">{tx.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <TypeIcon type={tx.type} />
                            <span className="font-semibold text-[#0f172a]">{tx.type}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4"><span className="font-mono text-[12px] text-[#64748b]">{tx.from}</span></td>
                        <td className="py-3.5 px-4">
                          <span className={tx.to === "You" ? "font-semibold text-[#0f172a]" : "font-mono text-[12px] text-[#64748b]"}>{tx.to}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className={`font-black text-[13.5px] leading-tight ${tx.amount > 0 ? "text-[#16a34a]" : "text-[#ef4444]"}`}>{tx.amountDisplay}</div>
                          <div className="text-[10.5px] font-semibold text-[#94a3b8]">TROB</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0]">{tx.status}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[12.5px] text-[#0f172a] font-medium">{tx.date}</div>
                          <div className="text-[11.5px] text-[#94a3b8]">{tx.time}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[12px] text-[#64748b]">{tx.txHash}</span>
                            <button type="button" onClick={() => copy(tx.txHash)} className="p-1 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"><CopyIcon /></button>
                            <button type="button" className="p-1 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"><ExternalIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile transaction cards (< md 768px) */}
            <div className="md:hidden divide-y divide-[#f1f5f9]">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-[#94a3b8] text-[13px]">
                  No transactions recorded yet.
                </div>
              ) : (
                filtered.map((tx) => (
                  <div key={tx.id} className="px-3 py-3.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5">
                        <TypeIcon type={tx.type} sm={true} />
                        <div>
                          <div className="font-extrabold text-[13px] text-[#0f172a] leading-tight">{tx.type}</div>
                          <div className="text-[10.5px] text-[#94a3b8] mt-0.5">{tx.date} {tx.time}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-black text-[13.5px] leading-tight ${tx.amount > 0 ? "text-[#16a34a]" : "text-[#ef4444]"}`}>
                          {tx.amountDisplay} TROB
                        </div>
                        <div className="text-[10px] font-semibold text-[#16a34a] mt-0.5">{tx.status}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10.5px] text-[#64748b] truncate">{tx.from}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={tx.to === "You" ? "text-[10.5px] font-bold text-[#2563eb] truncate" : "font-mono text-[10.5px] text-[#64748b] truncate"}>{tx.to}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="font-mono text-[10px] text-[#94a3b8]">{tx.txHash}</span>
                        <button type="button" onClick={() => copy(tx.txHash)} className="p-0.5 text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"><CopyIcon /></button>
                        <button type="button" className="p-0.5 text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"><ExternalIcon /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
  );
}
