"use client";

import React, { useState } from "react";
import { MatrixTransaction } from "@/lib/api";
import { useFinanceStore, useUserStore } from "@/lib/stores";
import { formatAddress, formatDateSafe } from "@/lib/format";
import { EXPLORER_URL, getSlotCost } from "@/lib/contracts";

export type TxType =
  | "Receive"
  | "Send"
  | "Matrix Cycle"
  | "Matrix Routing"
  | "Pool Routing"
  | "Partner Reward"
  | "Auto-Reserve"
  | "Leadership Royalty"
  | "Milestone Bounty"
  | "Blind Box Gift"
  | "Matrix Slot";

export type FilterTab =
  | "All Transactions"
  | "Received"
  | "Sent"
  | "Rewards"
  | "Gift Box"
  | "Matrix"
  | "Partner"
  | "System";

export interface Transaction {
  id: number;
  type: TxType;
  from: string;
  fromLabel?: string | null;
  to: string;
  toLabel?: string | null;
  purpose: string;
  distributionRule: string;
  slotNumber?: number | null;
  cycle?: number | null;
  position?: number | null;
  amount: number;
  amountDisplay: string;
  trobSubtitle?: string | null;
  isAutoReserve?: boolean;
  status: "Confirmed" | "Pending" | "Failed";
  date: string;
  time: string;
  txHash: string;
  rawTxHash?: string | null;
}

const TypeIcon = ({ type, sm = false }: { type: TxType; sm?: boolean }) => {
  const sz = sm ? 12 : 14;
  const cls = sm ? "w-7 h-7" : "w-8 h-8";

  if (type === "Auto-Reserve") {
    return (
      <div className={`${cls} rounded-full bg-[#e0f2fe] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
    );
  }

  if (type === "Leadership Royalty") {
    return (
      <div className={`${cls} rounded-full bg-[#fef3c7] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
      </div>
    );
  }

  if (type === "Milestone Bounty") {
    return (
      <div className={`${cls} rounded-full bg-[#ecfdf5] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      </div>
    );
  }

  if (type === "Blind Box Gift") {
    return (
      <div className={`${cls} rounded-full bg-[#f3e8ff] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </div>
    );
  }

  if (type === "Matrix Slot") {
    return (
      <div className={`${cls} rounded-full bg-[#e0e7ff] flex items-center justify-center flex-shrink-0`}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
    );
  }

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

export interface TransactionsTableProps {
  copy: (t: string) => void;
  items?: MatrixTransaction[];
}

export function TransactionsTable({ copy, items: propItems }: TransactionsTableProps) {
  const storeItems = useFinanceStore((s) => s.transactions);
  const userAddress = useUserStore((s) => s.address);
  const items = propItems !== undefined ? propItems : storeItems;
  const [activeTab, setActiveTab] = useState<FilterTab>("All Transactions");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  const ALL_TABS: FilterTab[] = [
    "All Transactions",
    "Received",
    "Sent",
    "Rewards",
    "Gift Box",
    "Matrix",
    "Partner",
    "System",
  ];

  const activeTransactions: Transaction[] =
    items && items.length > 0
      ? items.map((t, idx) => {
          const isAutoReserve =
            t.type === "UPGRADE_RESERVE" ||
            t.type === "UPGRADE_DEDUCTION" ||
            Boolean((t as any).isAutoReserve);

          const isPoolRouting = t.type === "POOL_ROUTING";
          const isBoardRouting = t.type === "BOARD_ROUTING" || isPoolRouting;
          const isSlot1Purchase =
            t.type === "SLOT_PURCHASE" && (t.slotNumber === 1 || !t.slotNumber);
          const isWithdrawal = t.type === "WITHDRAWAL";
          const isCommission = t.type === "COMMISSION_EARNED";

          const txType: TxType = isAutoReserve
            ? "Auto-Reserve"
            : isPoolRouting
            ? "Pool Routing"
            : isBoardRouting
            ? "Matrix Routing"
            : t.type === "CYCLE_COMPLETED"
            ? "Matrix Cycle"
            : isCommission
            ? "Partner Reward"
            : t.type === "ROYALTY_DIVIDEND"
            ? "Leadership Royalty"
            : t.type === "RANK_MILESTONE"
            ? "Milestone Bounty"
            : t.type === "MAGIC_BOX_GIFT"
            ? "Blind Box Gift"
            : isSlot1Purchase
            ? "Matrix Slot"
            : isWithdrawal
            ? "Send"
            : "Receive";

          let timeStr = "";
          try {
            if (t.timestamp) {
              const d = new Date(t.timestamp);
              if (!isNaN(d.getTime())) {
                timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              }
            }
          } catch {
            timeStr = "";
          }

          const slotTierUsd = getSlotCost(t.slotNumber || 1) || 30;
          const rawAmt = Math.abs(Number(t.amount || 0));
          const rawUsd =
            t.amountUsd !== null && t.amountUsd !== undefined
              ? Math.abs(Number(t.amountUsd))
              : rawAmt;
          const displayUsd =
            isAutoReserve || isBoardRouting
              ? 0
              : rawUsd > 0 && rawUsd <= 5000
              ? rawUsd
              : rawAmt > 0 && rawAmt <= 5000
              ? rawAmt
              : 0;
          const routedUsd = Number((t as any).routedAmountUsd ?? (rawUsd > 0 ? rawUsd : slotTierUsd));
          const trobTokens = (t as any).trobAmount || (rawAmt > 500 ? rawAmt : null);

          let fromStr = t.fromAddress ? formatAddress(t.fromAddress) : "Protocol Network";
          let fromLabelStr: string | null = (t as any).fromLabel || null;
          let toStr =
            t.toAddress && t.toAddress !== "You"
              ? formatAddress(t.toAddress)
              : "You";
          let toLabelStr: string | null = (t as any).toLabel || null;
          let purposeStr = t.description || "On-Chain Matrix Settlement";
          let distRuleStr = (t as any).distributionRule || "Verified Smart Contract Routing";

          if (isCommission) {
            fromStr = t.fromAddress ? formatAddress(t.fromAddress) : "Team Member";
            toStr = t.toAddress && t.toAddress !== "You" ? formatAddress(t.toAddress) : "You";
            toLabelStr = (t as any).toLabel || "You (Personal Wallet)";
            purposeStr =
              t.description ||
              (t.slotNumber
                ? `Slot #${String(t.slotNumber).padStart(2, "0")} • Cycle #${t.cycle || 1} • Seat #${t.position || ""} Direct Yield`
                : "Direct 100% P2P Commission");
            distRuleStr = (t as any).distributionRule || "100% Direct P2P Instant Payout";
          } else if (isSlot1Purchase) {
            fromStr = t.fromAddress ? formatAddress(t.fromAddress) : "You";
            fromLabelStr = (t as any).fromLabel || "You (Personal Wallet)";
            toStr = t.toAddress ? formatAddress(t.toAddress) : "EquoraMatrix Protocol";
            toLabelStr = (t as any).toLabel || "EquoraMatrix Protocol";
            purposeStr = t.description || "Slot #01 Entry Tier Lifetime Activation";
            distRuleStr = (t as any).distributionRule || "1x Lifetime Wallet Entry";
          } else if (isAutoReserve) {
            const targetSlot = t.slotNumber || 2;
            const prevSlot = Math.max(1, targetSlot - 1);
            fromStr = t.fromAddress || `Slot #${String(prevSlot).padStart(2, "0")} Reserve`;
            fromLabelStr =
              (t as any).fromLabel ||
              `Slot #${String(prevSlot).padStart(2, "0")} Auto-Reserve (P4+P5)`;
            toStr = t.toAddress ? formatAddress(t.toAddress) : `Slot #${String(targetSlot).padStart(2, "0")}`;
            toLabelStr = (t as any).toLabel || `Slot #${String(targetSlot).padStart(2, "0")} Tier Unlocked`;
            purposeStr =
              t.description ||
              `Slot #${String(targetSlot).padStart(2, "0")} Automated Escalation ($${routedUsd.toFixed(2)} Value)`;
            distRuleStr =
              (t as any).distributionRule || "Protocol Reserve Escalation ($0 Out-of-Pocket)";
          }

          const isOutflow = isSlot1Purchase || isWithdrawal;
          const signedAmount = isAutoReserve || isBoardRouting ? 0 : isOutflow ? -displayUsd : displayUsd;
          const amountDisplay =
            isAutoReserve || isBoardRouting
              ? "$0.00"
              : `${isOutflow ? "-" : "+"} $${displayUsd.toFixed(2)}`;
          const trobSubtitle =
            (t as any).trobSubtitle ||
            (isBoardRouting
              ? `$${routedUsd.toFixed(2)} Routed On-Chain`
              : trobTokens
              ? `${Number(trobTokens).toFixed(2)} TROB`
              : null);

          return {
            id: idx + 1,
            type: txType,
            from: fromStr,
            fromLabel: fromLabelStr,
            to: toStr,
            toLabel: toLabelStr,
            purpose: purposeStr,
            distributionRule: distRuleStr,
            slotNumber: t.slotNumber,
            cycle: t.cycle,
            position: t.position,
            amount: signedAmount,
            amountDisplay,
            trobSubtitle,
            isAutoReserve: isAutoReserve || isBoardRouting,
            status:
              t.status === "COMPLETED" || t.status === "Confirmed"
                ? "Confirmed"
                : t.status === "PENDING"
                ? "Pending"
                : "Failed",
            date: t.timestamp ? formatDateSafe(t.timestamp) : "On-Chain State",
            time: timeStr,
            txHash: t.txHash ? `${t.txHash.slice(0, 8)}...${t.txHash.slice(-4)}` : "On-Chain State",
            rawTxHash: t.txHash || null,
          };
        })
      : [];

  const filtered = activeTransactions.filter((tx) => {
    if (activeTab === "Received" && tx.amount <= 0) return false;
    if (activeTab === "Sent" && tx.amount >= 0) return false;
    if (
      activeTab === "Rewards" &&
      tx.type !== "Leadership Royalty" &&
      tx.type !== "Milestone Bounty" &&
      tx.type !== "Partner Reward"
    )
      return false;
    if (activeTab === "Gift Box" && tx.type !== "Blind Box Gift") return false;
    if (
      activeTab === "Matrix" &&
      tx.type !== "Matrix Cycle" &&
      tx.type !== "Matrix Routing" &&
      tx.type !== "Pool Routing" &&
      tx.type !== "Matrix Slot" &&
      tx.type !== "Auto-Reserve" &&
      tx.type !== "Partner Reward"
    )
      return false;
    if (activeTab === "Partner" && tx.type !== "Partner Reward") return false;
    if (
      activeTab === "System" &&
      tx.type !== "Matrix Slot" &&
      tx.type !== "Auto-Reserve" &&
      tx.type !== "Pool Routing" &&
      tx.type !== "Matrix Routing" &&
      tx.type !== "Blind Box Gift" &&
      tx.type !== "Leadership Royalty" &&
      tx.type !== "Milestone Bounty"
    )
      return false;

    if (selectedType !== "All Types" && tx.type !== selectedType) return false;
    if (selectedStatus !== "All Status" && tx.status !== selectedStatus) return false;
    return true;
  });

  const openExplorer = (rawHash?: string | null) => {
    if (rawHash && rawHash !== "—") {
      const url = rawHash.startsWith("T")
        ? `https://trobscan.com/address/${rawHash}`
        : `https://trobscan.com/transaction/${rawHash}`;
      window.open(url, "_blank");
    } else if (userAddress) {
      window.open(`https://trobscan.com/address/${userAddress}`, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
      {/* Tab bar and Filters */}
      <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-0 border-b border-[#f1f5f9] min-w-0 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {ALL_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#2563eb] text-[#2563eb] bg-[#eff6ff] rounded-t-lg"
                  : "border-transparent text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
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
              <option value="Partner Reward">Partner Reward</option>
              <option value="Matrix Routing">Matrix Routing</option>
              <option value="Pool Routing">Pool Routing</option>
              <option value="Auto-Reserve">Auto-Reserve</option>
              <option value="Matrix Slot">Matrix Slot</option>
              <option value="Matrix Cycle">Matrix Cycle</option>
              <option value="Leadership Royalty">Leadership Royalty</option>
              <option value="Milestone Bounty">Milestone Bounty</option>
              <option value="Blind Box Gift">Blind Box Gift</option>
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

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px] min-w-[920px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase w-8">#</th>
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[220px]">TYPE &amp; PURPOSE</th>
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[130px]">FROM (PAYER)</th>
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[130px]">TO (BENEFICIARY)</th>
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[170px]">DISTRIBUTION RULE</th>
              <th className="py-3 px-3 text-right text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[130px]">AMOUNT</th>
              <th className="py-3 px-3 text-center text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase w-24">STATUS</th>
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[110px]">DATE &amp; TIME</th>
              <th className="py-3 px-3 text-left text-[11px] font-bold text-[#94a3b8] tracking-wider uppercase min-w-[100px]">TX HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#94a3b8] text-[13px]">
                  No transactions recorded yet in this category.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                  <td className="py-3 px-3 text-[#94a3b8] font-medium text-[11px]">{tx.id}</td>

                  {/* TYPE & PURPOSE */}
                  <td className="py-3 px-3">
                    <div className="flex items-start gap-2.5">
                      <TypeIcon type={tx.type} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#0f172a] text-[12.5px]">{tx.type}</span>
                          {tx.isAutoReserve && (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                              $0 Out-of-Pocket
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748b] font-medium leading-tight mt-0.5">
                          {tx.purpose}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* FROM */}
                  <td className="py-3 px-3">
                    <div>
                      {tx.fromLabel ? (
                        <div className="font-semibold text-[#0f172a] text-[12px]">{tx.fromLabel}</div>
                      ) : null}
                      <span className="font-mono text-[11.5px] text-[#64748b]">{tx.from}</span>
                    </div>
                  </td>

                  {/* TO */}
                  <td className="py-3 px-3">
                    <div>
                      {tx.toLabel ? (
                        <div className="font-semibold text-[#0f172a] text-[12px]">{tx.toLabel}</div>
                      ) : (
                        <span className={tx.to === "You" ? "font-semibold text-[#0f172a]" : "font-mono text-[11.5px] text-[#64748b]"}>
                          {tx.to}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* DISTRIBUTION RULE */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        tx.isAutoReserve
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : tx.type === "Partner Reward"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : tx.type === "Matrix Slot"
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {tx.distributionRule}
                    </span>
                  </td>

                  {/* AMOUNT */}
                  <td className="py-3 px-3 text-right">
                    <div
                      className={`font-black text-[13.5px] leading-tight ${
                        tx.isAutoReserve
                          ? "text-[#0284c7]"
                          : tx.amount > 0
                          ? "text-[#16a34a]"
                          : "text-[#e11d48]"
                      }`}
                    >
                      {tx.amountDisplay}{" "}
                      <span className="text-[10px] font-bold text-[#64748b]">USD</span>
                    </div>
                    {tx.trobSubtitle && (
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                        ({tx.trobSubtitle})
                      </div>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        tx.status === "Confirmed"
                          ? "bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0]"
                          : tx.status === "Pending"
                          ? "bg-[#fffbeb] text-[#b45309] border border-[#fde68a]"
                          : "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  {/* DATE & TIME */}
                  <td className="py-3 px-3">
                    <div className="text-[12px] text-[#0f172a] font-medium">{tx.date}</div>
                    <div className="text-[10.5px] text-[#94a3b8]">{tx.time}</div>
                  </td>

                  {/* TX HASH */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11.5px] text-[#64748b]">{tx.txHash}</span>
                      {tx.rawTxHash ? (
                        <>
                          <button
                            type="button"
                            onClick={() => copy(tx.rawTxHash!)}
                            className="p-1 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"
                            title="Copy Transaction Hash"
                          >
                            <CopyIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => openExplorer(tx.rawTxHash)}
                            className="p-1 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"
                            title="View on TrobScan Explorer"
                          >
                            <ExternalIcon />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#f1f5f9]">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[#94a3b8] text-[13px]">
            No transactions recorded yet in this category.
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <TypeIcon type={tx.type} sm />
                  <div>
                    <div className="font-bold text-[13px] text-[#0f172a] flex items-center gap-1">
                      {tx.type}
                      {tx.isAutoReserve && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-blue-700">
                          $0 Out-of-Pocket
                        </span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-[#94a3b8]">
                      {tx.date} • {tx.time}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-black text-[13.5px] ${
                      tx.isAutoReserve
                        ? "text-[#0284c7]"
                        : tx.amount > 0
                        ? "text-[#16a34a]"
                        : "text-[#e11d48]"
                    }`}
                  >
                    {tx.amountDisplay}{" "}
                    <span className="text-[10px] font-bold text-[#64748b]">USD</span>
                  </div>
                  {tx.trobSubtitle && (
                    <div className="text-[9.5px] text-slate-400 font-medium">
                      ({tx.trobSubtitle})
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose & Distribution */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-0.5">
                <div className="text-slate-800 font-semibold">{tx.purpose}</div>
                <div className="text-slate-500 flex items-center justify-between">
                  <span>Distribution:</span>
                  <span className="font-bold text-slate-700">{tx.distributionRule}</span>
                </div>
                <div className="text-slate-500 flex items-center justify-between">
                  <span>Flow:</span>
                  <span className="font-mono text-[10px] text-slate-700">
                    {tx.from} → {tx.to}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    tx.status === "Confirmed"
                      ? "bg-[#ecfdf5] text-[#16a34a] border border-[#bbf7d0]"
                      : tx.status === "Pending"
                      ? "bg-[#fffbeb] text-[#b45309] border border-[#fde68a]"
                      : "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]"
                  }`}
                >
                  {tx.status}
                </span>

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#64748b]">
                  <span>{tx.txHash}</span>
                  {tx.rawTxHash ? (
                    <>
                      <button
                        type="button"
                        onClick={() => copy(tx.rawTxHash!)}
                        className="p-1 rounded text-[#94a3b8] hover:text-[#2563eb]"
                      >
                        <CopyIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => openExplorer(tx.rawTxHash)}
                        className="p-1 rounded text-[#94a3b8] hover:text-[#2563eb]"
                      >
                        <ExternalIcon />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
