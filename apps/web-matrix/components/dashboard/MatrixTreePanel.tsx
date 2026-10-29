"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { CONTRACT_ADDRESSES, getOnChainSlotDetails } from "@/lib/contracts";
import {
  CheckCircle2,
  Plus,
  Coins,
  Building2,
  Users,
  Layers,
  ExternalLink,
  Info,
  Network,
  ListOrdered,
  X,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Sparkles,
  Award,
} from "lucide-react";
import { toast } from "@/lib/toast";

export interface MatrixTreePanelProps {
  data?: MatrixDashboardOverview | null;
}

export type SeatCategory = "upline" | "income" | "pool" | "downline" | "waterfall" | "recycle";

export interface SeatMeta {
  pos: number;
  label: string;
  role: string;
  fullRole: string;
  type: SeatCategory;
  parentPos?: number;
  desc: string;
}

export const SEAT_METAS: Record<number, SeatMeta> = {
  1: {
    pos: 1,
    label: "P1",
    role: "Upline 1",
    fullRole: "Eligible Upline 1",
    type: "upline",
    desc: "100% P2P pass-through to matrix sponsor / first ancestor ($30).",
  },
  2: {
    pos: 2,
    label: "P2",
    role: "Upline 2",
    fullRole: "Eligible Upline 2 (Qual)",
    type: "upline",
    desc: "100% P2P pass-through to second upline ancestor. Unlocks 2-Direct Qualification!",
  },
  3: {
    pos: 3,
    label: "P3",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 1,
    desc: "100% P2P instant settlement ($30 USD / 945.18 TROB) directly into your wallet.",
  },
  4: {
    pos: 4,
    label: "P4",
    role: "4 Pools",
    fullRole: "4 Protocol Pools",
    type: "pool",
    parentPos: 1,
    desc: "Split: DAO (35%), Royalty (40%), Rank Reward (15%), Blind Box (10%).",
  },
  5: {
    pos: 5,
    label: "P5",
    role: "Auto Reserve",
    fullRole: "Auto-Upgrade Reserve",
    type: "pool",
    parentPos: 2,
    desc: "Automated stage-1 pool reserve for next slot tier progression.",
  },
  6: {
    pos: 6,
    label: "P6",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 2,
    desc: "100% P2P instant settlement ($30 USD / 945.18 TROB) directly into your wallet.",
  },
  7: {
    pos: 7,
    label: "P7",
    role: "Downline 1",
    fullRole: "Row 1 Team Spill",
    type: "downline",
    parentPos: 3,
    desc: "Spillover reward distributed to eligible first-row team downline.",
  },
  8: {
    pos: 8,
    label: "P8",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 3,
    desc: "100% P2P instant settlement ($30 USD / 945.18 TROB) directly into your wallet.",
  },
  9: {
    pos: 9,
    label: "P9",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 4,
    desc: "100% P2P instant settlement ($30 USD / 945.18 TROB) directly into your wallet.",
  },
  10: {
    pos: 10,
    label: "P10",
    role: "Downline 1",
    fullRole: "Row 1 Team Spill",
    type: "downline",
    parentPos: 4,
    desc: "Spillover reward distributed to eligible first-row team downline.",
  },
  11: {
    pos: 11,
    label: "P11",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 5,
    desc: "100% P2P instant settlement ($30 USD / 945.18 TROB) directly into your wallet.",
  },
  12: {
    pos: 12,
    label: "P12",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 5,
    desc: "100% P2P instant settlement ($30 USD / 945.18 TROB) directly into your wallet.",
  },
  13: {
    pos: 13,
    label: "P13",
    role: "Waterfall",
    fullRole: "Row 2 Team Spill",
    type: "waterfall",
    parentPos: 6,
    desc: "Tier 2 queue scan spillover reward distributed to eligible team candidates.",
  },
  14: {
    pos: 14,
    label: "P14",
    role: "Recycle",
    fullRole: "Cycle Recycle & Reset",
    type: "recycle",
    parentPos: 6,
    desc: "Cycle recycle trigger and final protocol pool contribution. Activates next slot!",
  },
};

export function MatrixTreePanel({ data: propData }: MatrixTreePanelProps = {}) {
  const storeDashboard = useMatrixStore((s) => s.dashboard);
  const storeSlotDetails = useMatrixStore((s) => s.slotDetails);
  const profile = useUserStore((s) => s.profile);
  const address = useUserStore((s) => s.address);

  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [liveSlotData, setLiveSlotData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [selectedNodeModal, setSelectedNodeModal] = useState<SeatMeta | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const data = propData !== undefined ? propData : storeDashboard;
  const currentActiveSlot = data?.currentSlot ?? profile?.currentSlot ?? 1;

  // Poll live on-chain 14-node board data with cycle snapshot support
  useEffect(() => {
    let isMounted = true;
    const fetchBoard = async () => {
      const active = address || data?.address;
      if (!active || !active.startsWith("0x")) return;
      try {
        const details = await getOnChainSlotDetails(active, selectedSlot, selectedCycle);
        if (isMounted && details) {
          setLiveSlotData(details);
        }
      } catch (err) {
        console.warn("[MatrixTreePanel] On-chain board query notice:", err);
      }
    };

    fetchBoard();
    const interval = setInterval(fetchBoard, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, data?.address, selectedSlot, selectedCycle]);

  const activeSlotDetails = liveSlotData || storeSlotDetails;
  const currentCycle = activeSlotDetails?.currentCycle ?? selectedCycle ?? 1;
  const totalCycles = activeSlotDetails?.totalCycles ?? currentCycle;
  const isViewingSnapshot = activeSlotDetails?.isViewingSnapshot ?? (selectedCycle < totalCycles);
  const filledCount = activeSlotDetails?.filledNodes ?? (data?.activeSlotProgress?.filledNodes ?? 0);
  const nodes = activeSlotDetails?.nodes || data?.activeSlotProgress?.nodes || [];

  const isNodeFilled = (pos: number) => {
    if (nodes[pos - 1]?.filled) return true;
    return pos <= filledCount;
  };

  const getNodeInfo = (pos: number) => {
    const n = nodes[pos - 1];
    const filled = isNodeFilled(pos);
    if (!filled) {
      return { filled: false, label: "Available", code: null, address: null, txHash: null, metaLabel: null };
    }
    const occupantAddr = n?.placedUser || n?.base58 || null;
    const occupantBase58 = n?.base58 || (occupantAddr ? toTrobBase58(occupantAddr) : null);
    const txHash = n?.txHash || null;
    const metaLabel = n?.label || (n?.code ? `Member #${n.code}` : `Member #${pos + 1}`);
    const code = n?.code ? `#${n.code}` : `P${pos}`;
    return { filled: true, label: metaLabel, code, address: occupantBase58, txHash, metaLabel };
  };

  const sponsor = profile?.sponsorAddress || data?.sponsorAddress;
  const isVaultSponsor =
    !sponsor ||
    sponsor.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
    (sponsor.startsWith("T") && toTrobBase58(CONTRACT_ADDRESSES.vault) === sponsor);

  const copyText = (txt: string) => {
    navigator.clipboard?.writeText(txt);
    setCopiedAddr(true);
    toast.copy(txt, "Address");
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  // ───────────────── VIBRANT CATEGORY COLOR SYSTEM ─────────────────
  const getCategoryStyles = (category: SeatCategory, filled: boolean) => {
    if (filled) {
      switch (category) {
        case "upline":
          return {
            container:
              "border-cyan-400 bg-gradient-to-br from-cyan-500/20 via-sky-50/95 to-white ring-2 ring-cyan-400/50 shadow-[0_4px_16px_rgba(6,182,212,0.22)] text-slate-900",
            dot: "bg-cyan-500 shadow-[0_0_8px_#06b6d4]",
            iconBg: "bg-cyan-500 text-white shadow-xs",
            badge: "bg-cyan-100/90 text-cyan-800 border-cyan-300 font-extrabold",
            labelColor: "text-cyan-900",
            pillText: "Upline P2P",
          };
        case "income":
          return {
            container:
              "border-emerald-500 bg-gradient-to-br from-emerald-500/25 via-emerald-50/95 to-white ring-2 ring-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.25)] text-slate-900",
            dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
            iconBg: "bg-emerald-500 text-white shadow-xs",
            badge: "bg-emerald-100/90 text-emerald-900 border-emerald-300 font-extrabold",
            labelColor: "text-emerald-950",
            pillText: "+$30 YOU",
          };
        case "pool":
          return {
            container:
              "border-amber-400 bg-gradient-to-br from-amber-500/20 via-amber-50/95 to-white ring-2 ring-amber-400/50 shadow-[0_4px_16px_rgba(245,158,11,0.22)] text-slate-900",
            dot: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
            iconBg: "bg-amber-500 text-white shadow-xs",
            badge: "bg-amber-100/90 text-amber-900 border-amber-300 font-extrabold",
            labelColor: "text-amber-950",
            pillText: "4 Pools",
          };
        case "downline":
          return {
            container:
              "border-purple-400 bg-gradient-to-br from-purple-500/20 via-purple-50/95 to-white ring-2 ring-purple-400/50 shadow-[0_4px_16px_rgba(168,85,247,0.22)] text-slate-900",
            dot: "bg-purple-500 shadow-[0_0_8px_#a855f7]",
            iconBg: "bg-purple-500 text-white shadow-xs",
            badge: "bg-purple-100/90 text-purple-900 border-purple-300 font-extrabold",
            labelColor: "text-purple-950",
            pillText: "Downline Spill",
          };
        case "waterfall":
          return {
            container:
              "border-fuchsia-400 bg-gradient-to-br from-fuchsia-500/20 via-fuchsia-50/95 to-white ring-2 ring-fuchsia-400/50 shadow-[0_4px_16px_rgba(217,70,239,0.22)] text-slate-900",
            dot: "bg-fuchsia-500 shadow-[0_0_8px_#d946ef]",
            iconBg: "bg-fuchsia-500 text-white shadow-xs",
            badge: "bg-fuchsia-100/90 text-fuchsia-900 border-fuchsia-300 font-extrabold",
            labelColor: "text-fuchsia-950",
            pillText: "Waterfall Tier",
          };
        case "recycle":
          return {
            container:
              "border-rose-400 bg-gradient-to-br from-rose-500/20 via-rose-50/95 to-white ring-2 ring-rose-400/50 shadow-[0_4px_16px_rgba(244,63,94,0.22)] text-slate-900",
            dot: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
            iconBg: "bg-rose-500 text-white shadow-xs",
            badge: "bg-rose-100/90 text-rose-900 border-rose-300 font-extrabold",
            labelColor: "text-rose-950",
            pillText: "Recycle Trigger",
          };
      }
    } else {
      // AVAILABLE / OPEN STATE WITH DISTINCT CATEGORY COLORS (NOT PLAIN GREY!)
      switch (category) {
        case "upline":
          return {
            container: "border-cyan-200/90 bg-cyan-50/30 hover:border-cyan-400 hover:bg-cyan-50/60 text-slate-700",
            dot: "bg-cyan-400",
            iconBg: "bg-cyan-100/70 text-cyan-600",
            badge: "bg-white/80 text-cyan-700 border-cyan-200",
            labelColor: "text-slate-800",
            pillText: "Upline 1",
          };
        case "income":
          return {
            container: "border-emerald-200/90 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/60 text-slate-700",
            dot: "bg-emerald-400",
            iconBg: "bg-emerald-100/70 text-emerald-600",
            badge: "bg-white/80 text-emerald-700 border-emerald-200",
            labelColor: "text-slate-800",
            pillText: "+$30 YOU",
          };
        case "pool":
          return {
            container: "border-amber-200/90 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/60 text-slate-700",
            dot: "bg-amber-400",
            iconBg: "bg-amber-100/70 text-amber-600",
            badge: "bg-white/80 text-amber-700 border-amber-200",
            labelColor: "text-slate-800",
            pillText: "4 Pools",
          };
        case "downline":
          return {
            container: "border-purple-200/90 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50/60 text-slate-700",
            dot: "bg-purple-400",
            iconBg: "bg-purple-100/70 text-purple-600",
            badge: "bg-white/80 text-purple-700 border-purple-200",
            labelColor: "text-slate-800",
            pillText: "Downline 1",
          };
        case "waterfall":
          return {
            container: "border-fuchsia-200/90 bg-fuchsia-50/30 hover:border-fuchsia-400 hover:bg-fuchsia-50/60 text-slate-700",
            dot: "bg-fuchsia-400",
            iconBg: "bg-fuchsia-100/70 text-fuchsia-600",
            badge: "bg-white/80 text-fuchsia-700 border-fuchsia-200",
            labelColor: "text-slate-800",
            pillText: "Downline 2",
          };
        case "recycle":
          return {
            container: "border-rose-200/90 bg-rose-50/30 hover:border-rose-400 hover:bg-rose-50/60 text-slate-700",
            dot: "bg-rose-400",
            iconBg: "bg-rose-100/70 text-rose-600",
            badge: "bg-white/80 text-rose-700 border-rose-200",
            labelColor: "text-slate-800",
            pillText: "Recycle",
          };
      }
    }
  };

  // Node Component Render (Vibrant, high-contrast, zero truncation)
  const renderNodeCard = (pos: number) => {
    const cfg = SEAT_METAS[pos];
    const node = getNodeInfo(pos);
    const filled = node.filled;
    const styles = getCategoryStyles(cfg.type, filled);

    return (
      <button
        key={pos}
        type="button"
        onClick={() => setSelectedNodeModal(cfg)}
        className={`relative flex-1 min-w-0 rounded-xl sm:rounded-2xl border p-1.5 sm:p-2 text-center flex flex-col items-center justify-between gap-1 transition-all active:scale-95 cursor-pointer select-none ${styles.container}`}
        title={`Position #${pos} (${cfg.fullRole}) — Click to inspect`}
      >
        {/* Top bar: Seat number and role type dot */}
        <div className="w-full flex items-center justify-between px-0.5 leading-none">
          <span className="text-[9.5px] sm:text-[10px] font-black text-slate-700">{cfg.label}</span>
          <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${styles.dot}`} />
        </div>

        {/* Center icon / checkmark */}
        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center my-0.5 shrink-0 ${styles.iconBg}`}>
          {filled ? (
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          ) : (
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          )}
        </div>

        {/* Occupant / ID label */}
        <div className="w-full min-w-0">
          <div className={`text-[9.5px] sm:text-[11px] font-extrabold truncate px-0.5 ${styles.labelColor}`}>
            {filled ? node.label : "Available"}
          </div>
          {filled && node.address && (
            <div className="text-[7.5px] sm:text-[8.5px] font-mono text-slate-500 truncate -mt-0.5">
              {formatAddress(node.address)}
            </div>
          )}
          <span
            className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-md border inline-block mt-0.5 max-w-full truncate ${styles.badge}`}
          >
            {filled ? (cfg.type === "income" ? "+$30 Settled" : cfg.role) : cfg.role}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0eaf7] p-3 sm:p-5 lg:p-6 shadow-xs w-full min-w-0 overflow-hidden">
      {/* ───────────────── HEADER & SLOT NAVIGATION ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-black text-[#102341] tracking-tight">
              MATRIX VISUALIZER
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e7f1ff] text-[#1758cc] border border-[#cde0ff]">
              14-Seat Engine
            </span>

            {/* INTERACTIVE CYCLE TOGGLE PILLS */}
            {totalCycles > 1 ? (
              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedCycle(1)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCycle === 1
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Cycle 1</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[9px] opacity-90">(14/14 Fulfilled 🏆)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle(2)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCycle === 2
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Cycle 2</span>
                  <span className="text-[9px] opacity-90">(Current Active)</span>
                </button>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ecfbf5] text-[#15815f] border border-[#b4e9d6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15815f] animate-pulse" />
                Cycle #{String(currentCycle).padStart(2, "0")}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1">
            Slot #{String(selectedSlot).padStart(2, "0")} • {filledCount} / 14 Nodes Filled •{" "}
            {isViewingSnapshot ? (
              <strong className="text-emerald-600">Cycle 1 Completed Board (14/14)</strong>
            ) : (
              <span>$30 P2P Settlement</span>
            )}
          </p>
        </div>

        {/* View Switcher (Tree vs Table) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "tree" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Tree</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Positions</span>
          </button>
        </div>
      </div>

      {/* ───────────────── HORIZONTAL SLOT PICKER BAR ───────────────── */}
      <div className="py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((sNum) => {
          const isActive = selectedSlot === sNum;
          const isUnlocked = sNum <= currentActiveSlot;
          const isCompleted = sNum <= 3; // Slots 1, 2, 3 have 14 completed nodes!
          return (
            <button
              key={sNum}
              type="button"
              onClick={() => setSelectedSlot(sNum)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/25"
                  : isUnlocked
                  ? "bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200"
                  : "bg-slate-50/50 text-slate-400 border border-slate-100"
              }`}
            >
              <span>Slot {sNum}</span>
              {isCompleted && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-200" title="Completed 14/14" />
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────── COLOR CODED LEGEND BAR ───────────────── */}
      <div className="py-2 px-1 flex items-center gap-2 overflow-x-auto scrollbar-none text-[10px] font-bold border-b border-slate-100">
        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>Upline Stream (P1, P2)</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>YOU Cashflow (+$30 Direct)</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>4 Pools & Reserve (P4, P5)</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Downline Spill (P7, P10)</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
          <span>Waterfall Spill (P13)</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Board Recycle (P14)</span>
        </div>
      </div>

      {/* ───────────────── TREE VISUALIZER CONTAINER ───────────────── */}
      {viewMode === "tree" ? (
        <div className="mt-3.5 bg-gradient-to-br from-[#f8fbff] via-[#edf5ff] to-[#f4f9ff] border border-[#d8e6f8] rounded-2xl p-2.5 sm:p-5 lg:p-6 w-full min-w-0">
          {/* 1. UPLINE SPONSOR CARD */}
          <div className="flex justify-center mb-1">
            {isVaultSponsor ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#cbdfff] shadow-xs text-[10.5px] sm:text-[11px] max-w-full">
                <span className="w-2 h-2 rounded-full bg-[#2868e8] animate-pulse shrink-0" />
                <span className="text-slate-500 font-semibold truncate">Upline Sponsor:</span>
                <span className="font-bold text-slate-900 truncate">Protocol Vault (4 Streams)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#cbdfff] shadow-xs text-[10.5px] sm:text-[11px] max-w-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-500 font-semibold truncate">Sponsor:</span>
                <span className="font-mono font-bold text-slate-900 truncate">
                  {profile?.sponsorCode ? `#${profile.sponsorCode} • ` : ""}
                  {formatAddress(toTrobBase58(sponsor))}
                </span>
              </div>
            )}
          </div>

          {/* SVG Vertical Stem to Root */}
          <div className="flex justify-center">
            <div className="w-px h-3 sm:h-4 bg-[#93c5fd]" />
          </div>

          {/* 2. ROOT NODE (YOU) */}
          <div className="flex justify-center mb-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-[#bfdbfe] shadow-sm text-[11px] sm:text-[12px] font-black text-[#102341] max-w-full">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#2868e8] shadow-[0_0_0_3px_#e6f0ff] shrink-0" />
              <span className="truncate">YOU: ROOT OPERATIVE (SEAT 1)</span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono hidden xs:inline">
                #{String(selectedSlot).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* SVG Branching Lines: Root -> Level 1 (P1, P2) */}
          <div className="w-full flex justify-center">
            <svg className="w-[50%] max-w-[280px] h-4 sm:h-5" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M 50 0 L 50 8 L 25 8 L 25 20 M 50 8 L 75 8 L 75 20" fill="none" stroke="#93c5fd" strokeWidth="2" />
            </svg>
          </div>

          {/* 3. LEVEL 1: SEATS P1 and P2 (Upline Stream) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-sm mx-auto mb-1">
            {renderNodeCard(1)}
            {renderNodeCard(2)}
          </div>

          {/* SVG Branching Lines: Level 1 -> Level 2 */}
          <div className="w-full flex justify-center">
            <svg className="w-[90%] max-w-[500px] h-4 sm:h-5" viewBox="0 0 100 20" preserveAspectRatio="none">
              {/* From P1 (left half) to P3 & P4 */}
              <path d="M 25 0 L 25 8 L 12.5 8 L 12.5 20 M 25 8 L 37.5 8 L 37.5 20" fill="none" stroke="#93c5fd" strokeWidth="1.8" />
              {/* From P2 (right half) to P5 & P6 */}
              <path d="M 75 0 L 75 8 L 62.5 8 L 62.5 20 M 75 8 L 87.5 8 L 87.5 20" fill="none" stroke="#93c5fd" strokeWidth="1.8" />
            </svg>
          </div>

          {/* 4. LEVEL 2: SEATS P3, P4, P5, P6 */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 max-w-xl mx-auto mb-1">
            {renderNodeCard(3)}
            {renderNodeCard(4)}
            {renderNodeCard(5)}
            {renderNodeCard(6)}
          </div>

          {/* SVG Branching Lines: Level 2 -> Level 3 */}
          <div className="w-full flex justify-center">
            <svg className="w-full max-w-[700px] h-4 sm:h-5" viewBox="0 0 100 20" preserveAspectRatio="none">
              {/* P3 -> P7, P8 */}
              <path d="M 12.5 0 L 12.5 8 L 6.25 8 L 6.25 20 M 12.5 8 L 18.75 8 L 18.75 20" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
              {/* P4 -> P9, P10 */}
              <path d="M 37.5 0 L 37.5 8 L 31.25 8 L 31.25 20 M 37.5 8 L 43.75 8 L 43.75 20" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
              {/* P5 -> P11, P12 */}
              <path d="M 62.5 0 L 62.5 8 L 56.25 8 L 56.25 20 M 62.5 8 L 68.75 8 L 68.75 20" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
              {/* P6 -> P13, P14 */}
              <path d="M 87.5 0 L 87.5 8 L 81.25 8 L 81.25 20 M 87.5 8 L 93.75 8 L 93.75 20" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
            </svg>
          </div>

          {/* 5. LEVEL 3: SEATS P7 to P14 (Fluid responsive: 8 columns on sm+, paired cards on mobile) */}
          <div className="hidden sm:grid sm:grid-cols-8 gap-1.5 sm:gap-2 max-w-4xl mx-auto">
            {renderNodeCard(7)}
            {renderNodeCard(8)}
            {renderNodeCard(9)}
            {renderNodeCard(10)}
            {renderNodeCard(11)}
            {renderNodeCard(12)}
            {renderNodeCard(13)}
            {renderNodeCard(14)}
          </div>

          {/* Mobile-Optimized Level 3 (< sm, 320px - 640px) */}
          <div className="grid grid-cols-2 gap-2 sm:hidden mt-1">
            <div className="p-1.5 bg-white/70 border border-blue-200/60 rounded-xl">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 px-1">
                Branch P1 (Under P3 & P4)
              </div>
              <div className="grid grid-cols-2 gap-1 mb-1">
                {renderNodeCard(7)}
                {renderNodeCard(8)}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {renderNodeCard(9)}
                {renderNodeCard(10)}
              </div>
            </div>

            <div className="p-1.5 bg-white/70 border border-blue-200/60 rounded-xl">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 px-1">
                Branch P2 (Under P5 & P6)
              </div>
              <div className="grid grid-cols-2 gap-1 mb-1">
                {renderNodeCard(11)}
                {renderNodeCard(12)}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {renderNodeCard(13)}
                {renderNodeCard(14)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ───────────────── 14-POSITIONS LEDGER TABLE VIEW ───────────────── */
        <div className="mt-3.5 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>Position & Payout Rule</span>
            <span>Occupant / Settlement</span>
          </div>
          {Array.from({ length: 14 }, (_, i) => i + 1).map((pos) => {
            const cfg = SEAT_METAS[pos];
            const node = getNodeInfo(pos);
            const filled = node.filled;
            const styles = getCategoryStyles(cfg.type, filled);

            return (
              <div
                key={pos}
                onClick={() => setSelectedNodeModal(cfg)}
                className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${styles.iconBg}`}
                  >
                    {pos}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 truncate">{cfg.fullRole}</span>
                    <span className="text-[10px] text-slate-400 truncate">{cfg.desc}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {filled ? (
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {node.label || (node.address ? formatAddress(node.address) : `ID #${pos}`)}
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {cfg.type === "income" ? "+$30 Settled" : "Settled"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold">Available</span>
                  )}
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────── NODE DETAILS INSPECTION MODAL ───────────────── */}
      {selectedNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setSelectedNodeModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  getCategoryStyles(selectedNodeModal.type, getNodeInfo(selectedNodeModal.pos).filled).iconBg
                }`}
              >
                {selectedNodeModal.label}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Position #{selectedNodeModal.pos} • {selectedNodeModal.fullRole}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Slot #{String(selectedSlot).padStart(2, "0")} • Cycle #{currentCycle}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Settlement Flow
                </span>
                <p className="text-slate-700 text-[11.5px] leading-relaxed">
                  {selectedNodeModal.desc}
                </p>
              </div>

              {getNodeInfo(selectedNodeModal.pos).filled ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Position Status
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9.5px] font-bold">
                      Settled On-Chain ✓
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Member:</span>
                    <span className="font-bold text-slate-900">
                      {getNodeInfo(selectedNodeModal.pos).label}
                    </span>
                  </div>
                  {getNodeInfo(selectedNodeModal.pos).address && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Wallet:</span>
                      <button
                        type="button"
                        onClick={() => copyText(getNodeInfo(selectedNodeModal.pos).address || "")}
                        className="font-mono text-[10.5px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        title="Click to copy"
                      >
                        {formatAddress(getNodeInfo(selectedNodeModal.pos).address || "")}
                        {copiedAddr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                  {getNodeInfo(selectedNodeModal.pos).txHash && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/50">
                      <span className="text-slate-500">Tx Hash:</span>
                      <a
                        href={`https://testnet.trobchain.com/#/transaction/${getNodeInfo(selectedNodeModal.pos).txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        {getNodeInfo(selectedNodeModal.pos).txHash?.slice(0, 10)}...
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                    Position Status
                  </span>
                  <p className="text-amber-900 text-[11px]">
                    Open. The next operative placed under this cycle will automatically fill this position.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedNodeModal(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
