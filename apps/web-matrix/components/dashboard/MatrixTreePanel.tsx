"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { CONTRACT_ADDRESSES, getOnChainSlotDetails, getOnChainDirectMembers, toHexAddress, getSlotCost, EXPLORER_URL } from "@/lib/contracts";
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
  Lock,
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
    role: "Direct 1",
    fullRole: "Level 1 (Direct #1)",
    type: "upline",
    desc: "Level 1 frontline seat. 100% P2P pass-through routes to upline sponsor ($30).",
  },
  2: {
    pos: 2,
    label: "P2",
    role: "Direct 2",
    fullRole: "Level 1 (Direct #2)",
    type: "upline",
    desc: "Level 1 frontline seat. 100% P2P settlement unlocks 2-Direct Qualification!",
  },
  3: {
    pos: 3,
    label: "P3",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 1,
    desc: "100% P2P instant settlement ($30.00 USD) directly into your wallet.",
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
    desc: "100% P2P instant settlement ($30.00 USD) directly into your wallet.",
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
    desc: "100% P2P instant settlement ($30.00 USD) directly into your wallet.",
  },
  9: {
    pos: 9,
    label: "P9",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 4,
    desc: "100% P2P instant settlement ($30.00 USD) directly into your wallet.",
  },
  10: {
    pos: 10,
    label: "P10",
    role: "Downline 2",
    fullRole: "Downline 2 Team Spill",
    type: "downline",
    parentPos: 4,
    desc: "Spillover reward distributed to eligible second-row team downline (Node 2).",
  },
  11: {
    pos: 11,
    label: "P11",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 5,
    desc: "100% P2P instant settlement ($30.00 USD) directly into your wallet.",
  },
  12: {
    pos: 12,
    label: "P12",
    role: "+$30 YOU",
    fullRole: "YOU: 100% Direct",
    type: "income",
    parentPos: 5,
    desc: "100% P2P instant settlement ($30.00 USD) directly into your wallet.",
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
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const selectSlotStore = useMatrixStore((s) => s.selectSlot);
  const profile = useUserStore((s) => s.profile);
  const address = useUserStore((s) => s.address);

  const [selectedSlot, setSelectedSlot] = useState<number>(storeSelectedSlot || 1);
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [liveSlotData, setLiveSlotData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"tree" | "table" | "directs">("tree");
  const [directMembersList, setDirectMembersList] = useState<any[]>([]);
  const [selectedNodeModal, setSelectedNodeModal] = useState<SeatMeta | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const storeSelectedCycle = useMatrixStore((s) => s.selectedCycle);

  // Sync when store slot changes externally
  useEffect(() => {
    if (storeSelectedSlot && storeSelectedSlot !== selectedSlot) {
      setSelectedSlot(storeSelectedSlot);
    }
  }, [storeSelectedSlot]);

  // Sync when store cycle changes externally
  useEffect(() => {
    if (storeSelectedCycle && storeSelectedCycle !== selectedCycle) {
      setSelectedCycle(storeSelectedCycle);
    }
  }, [storeSelectedCycle]);

  const handleSelectSlot = (sNum: number) => {
    setSelectedSlot(sNum);
    setSelectedCycle(1);
    setLiveSlotData(null);
    const raw = address || data?.address;
    const active = raw ? toHexAddress(raw) : undefined;
    selectSlotStore(sNum, 1, active);
  };

  const handleCycleChange = (cNum: number) => {
    setSelectedCycle(cNum);
    setLiveSlotData(null);
    const raw = address || data?.address;
    const active = raw ? toHexAddress(raw) : undefined;
    selectSlotStore(selectedSlot, cNum, active);
  };

  const data = propData !== undefined ? propData : storeDashboard;
  const currentActiveSlot = data?.currentSlot ?? profile?.currentSlot ?? 1;

  // Poll live on-chain 14-node board data with cycle snapshot support
  useEffect(() => {
    let isMounted = true;
    const fetchBoard = async () => {
      const raw = address || data?.address;
      if (!raw) return;
      const active = toHexAddress(raw);
      if (!active || !active.startsWith("0x") || active === "0x0000000000000000000000000000000000000000") return;
      try {
        const details = await getOnChainSlotDetails(active, selectedSlot, selectedCycle);
        if (isMounted && details) {
          setLiveSlotData(details);
          useMatrixStore.setState({
            slotDetails: details,
            selectedSlotNumber: selectedSlot,
            selectedCycle: details.currentCycle,
          });
        }
      } catch (err) {
        console.warn("[MatrixTreePanel] On-chain board query notice:", err);
      }
    };

    fetchBoard();
    const interval = setInterval(fetchBoard, 4000);

    // Fetch direct members for Direct Partners view
    const rawTarget = address || data?.address;
    const targetAddr = rawTarget ? toHexAddress(rawTarget) : "";
    if (targetAddr) {
      getOnChainDirectMembers(targetAddr)
        .then((list) => {
          if (isMounted && Array.isArray(list)) setDirectMembersList(list);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, data?.address, selectedSlot, selectedCycle]);

  const activeSlotDetails = liveSlotData || storeSlotDetails;
  const highestUnlockedSlot = profile?.highestUnlockedSlot ?? (data?.highestUnlockedSlot ?? 1);
  const isCurrentSlotUnlocked = activeSlotDetails
    ? Boolean(activeSlotDetails.isUnlocked)
    : (selectedSlot <= highestUnlockedSlot);
  const isCurrentSlotLive = selectedSlot === 1 ? true : Boolean(activeSlotDetails?.isLive);
  const isSlotStandby = isCurrentSlotUnlocked && selectedSlot > 1 && !isCurrentSlotLive;

  const currentCycle = isCurrentSlotUnlocked ? (activeSlotDetails?.currentCycle ?? selectedCycle ?? 1) : 0;
  const totalCycles = isCurrentSlotUnlocked ? (activeSlotDetails?.totalCycles ?? currentCycle) : 0;
  const isViewingSnapshot = isCurrentSlotUnlocked && (activeSlotDetails?.isViewingSnapshot ?? (selectedCycle < totalCycles));
  const nodes = isCurrentSlotUnlocked ? (activeSlotDetails?.nodes || data?.activeSlotProgress?.nodes || []) : [];
  const realFilledCount = isCurrentSlotUnlocked && nodes.length > 0 ? nodes.filter((n: any) => n?.filled).length : 0;
  const filledCount = realFilledCount > 0 ? realFilledCount : (isCurrentSlotUnlocked ? (activeSlotDetails?.filledNodes ?? (data?.activeSlotProgress?.filledNodes ?? 0)) : 0);

  const isNodeFilled = (pos: number) => {
    if (!isCurrentSlotUnlocked) return false;
    return Boolean(nodes[pos - 1]?.filled);
  };

  const getNodeInfo = (pos: number) => {
    const n = nodes[pos - 1];
    const filled = isNodeFilled(pos);
    if (!filled) {
      return { filled: false, label: "Available", code: null, address: null, txHash: null, metaLabel: null };
    }
    const occupantAddr = n?.placedUser || n?.base58 || null;
    let occupantBase58 = n?.base58 || (occupantAddr ? toTrobBase58(occupantAddr) : null);
    if (!occupantBase58) {
      if (pos === 4 || pos === 5 || pos === 14 || SEAT_METAS[pos]?.type === "pool") {
        occupantBase58 = toTrobBase58(CONTRACT_ADDRESSES.vault);
      } else if (pos === 1) {
        occupantBase58 = profile?.sponsorAddress || data?.sponsorAddress ? toTrobBase58(profile?.sponsorAddress || data?.sponsorAddress) : toTrobBase58(CONTRACT_ADDRESSES.vault);
      } else if (pos === 2) {
        occupantBase58 = profile?.upline2Address ? toTrobBase58(profile.upline2Address) : toTrobBase58(CONTRACT_ADDRESSES.vault);
      } else if (SEAT_METAS[pos]?.type === "income") {
        occupantBase58 = address ? toTrobBase58(address) : toTrobBase58(CONTRACT_ADDRESSES.vault);
      } else {
        occupantBase58 = toTrobBase58(CONTRACT_ADDRESSES.vault);
      }
    }
    const txHash = n?.txHash || null;
    const metaLabel = n?.label || (n?.code ? `Member #${n.code}` : `Member #${pos + 1}`);
    const code = n?.code ? `#${n.code}` : `P${pos}`;
    return { filled: true, label: metaLabel, code, address: occupantBase58, txHash, metaLabel };
  };

  const sponsor = profile?.sponsorAddress || data?.sponsorAddress;
  const isVaultSponsor =
    !sponsor ||
    Boolean(profile?.isVaultSponsor) ||
    sponsor.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
    sponsor.toLowerCase() === toHexAddress(CONTRACT_ADDRESSES.vault).toLowerCase() ||
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
            pillText: "Level 1 Pass-Up",
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
            pillText: "Direct 1",
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

  const rawTarget = address || data?.address;
  const targetHex = rawTarget ? toHexAddress(rawTarget).toLowerCase() : "";
  const isApexRoot =
    targetHex === "0x5fd6266a07fa4ba10dd34e9a315edd47904b8823" ||
    targetHex === toHexAddress(CONTRACT_ADDRESSES.vault).toLowerCase();

  const directsCount =
    directMembersList.length > 0
      ? directMembersList.length
      : (profile?.activeDirectsCount ?? profile?.directReferralsCount ?? data?.activeDirectsCount ?? 0);

  const isOwnerQualified = isApexRoot || directsCount >= 2;

  const firstOpenPosIndex = isCurrentSlotUnlocked && nodes.length > 0 ? nodes.findIndex((n: any) => !n?.filled) : -1;
  const nextUpcomingPos = isCurrentSlotUnlocked && !isSlotStandby
    ? (!isOwnerQualified
        ? (directsCount === 0 ? 1 : 2)
        : (firstOpenPosIndex >= 0 ? firstOpenPosIndex + 1 : (filledCount < 14 ? filledCount + 1 : null)))
    : null;
  const slotCost = getSlotCost(selectedSlot);

  // Node Component Render: Vibrant Blue & Green Active/Filled and Large Responsive Cards
  const renderTreeNode = (pos: number) => {
    const cfg = SEAT_METAS[pos];
    const node = getNodeInfo(pos);
    const filled = isCurrentSlotUnlocked && node.filled;
    const isNextUp = isCurrentSlotUnlocked && !filled && pos === nextUpcomingPos;
    const isLockedUnqualified = !isOwnerQualified && pos >= 3;

    // Node widths
    const widthClass = pos <= 2 ? "w-[92px] min-h-[74px]" : pos <= 6 ? "w-[82px] min-h-[70px]" : "w-[72px] min-h-[66px]";

    let styleClass = "";
    let roleBadge = "";
    let statusText = "Open";
    let statusDot = <span className="w-2 h-2 rounded-full border-2 border-slate-300" />;

    if (!isCurrentSlotUnlocked) {
      styleClass =
        "bg-slate-50/80 border-2 border-dashed border-slate-200 text-slate-400 opacity-60 hover:opacity-85 transition-all";
      roleBadge = "bg-slate-100 text-slate-400 border-slate-200 font-semibold";
      statusText = "Locked";
      statusDot = <Lock className="w-2.5 h-2.5 text-slate-400" />;
    } else if (filled) {
      statusText = "Filled";
      if (cfg.type === "income") {
        if (isOwnerQualified) {
          styleClass =
            "bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-white border-2 border-emerald-500 shadow-md shadow-emerald-500/25 text-slate-900";
          roleBadge = "bg-emerald-100/90 text-emerald-900 border-emerald-300 font-black";
          statusDot = <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />;
        } else {
          // Unqualified income node -> Routed to Protocol Vault
          styleClass =
            "bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-white border-2 border-amber-500 shadow-md shadow-amber-500/25 text-slate-900";
          roleBadge = "bg-amber-100/90 text-amber-900 border-amber-300 font-black";
          statusDot = <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />;
        }
      } else if (cfg.type === "upline") {
        styleClass =
          "bg-gradient-to-b from-blue-500/20 via-blue-500/10 to-white border-2 border-blue-600 shadow-md shadow-blue-500/25 text-slate-900";
        roleBadge = "bg-blue-100/90 text-blue-900 border-blue-300 font-black";
        statusDot = <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_#2563eb]" />;
      } else if (cfg.type === "pool") {
        styleClass =
          "bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-white border-2 border-amber-500 shadow-md shadow-amber-500/25 text-slate-900";
        roleBadge = "bg-amber-100/90 text-amber-900 border-amber-300 font-black";
        statusDot = <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />;
      } else if (cfg.type === "recycle") {
        styleClass =
          "bg-gradient-to-b from-rose-500/20 via-rose-500/10 to-white border-2 border-rose-500 shadow-md shadow-rose-500/25 text-slate-900";
        roleBadge = "bg-rose-100/90 text-rose-900 border-rose-300 font-black";
        statusDot = <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />;
      } else {
        styleClass =
          "bg-gradient-to-b from-purple-500/20 via-purple-500/10 to-white border-2 border-purple-500 shadow-md shadow-purple-500/25 text-slate-900";
        roleBadge = "bg-purple-100/90 text-purple-900 border-purple-300 font-black";
        statusDot = <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />;
      }
    } else if (isNextUp) {
      styleClass =
        "bg-gradient-to-b from-blue-500/15 via-sky-50 to-white border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20 text-slate-900 animate-pulse";
      roleBadge = "bg-blue-600 text-white font-black border-blue-600 shadow-xs";
      statusText = "Next Up";
      statusDot = <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />;
    } else if (isLockedUnqualified) {
      styleClass =
        "bg-slate-50/60 border-2 border-dashed border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/30 text-slate-400 opacity-80 transition-all";
      roleBadge = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      statusText = "Locked";
      statusDot = <Lock className="w-2.5 h-2.5 text-amber-600" />;
    } else {
      styleClass =
        "bg-white border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 text-slate-500";
      roleBadge = "bg-slate-100 text-slate-600 border-slate-200";
      statusText = "Open";
    }

    let dynamicRole = cfg.role;
    if (cfg.type === "income") {
      if (filled) {
        dynamicRole = isOwnerQualified ? `+$${slotCost} YOU` : `Pool (${directsCount}/2)`;
      } else {
        dynamicRole = isOwnerQualified ? `+$${slotCost} YOU` : `+$${slotCost} (Req 2 Dir)`;
      }
    } else if (isLockedUnqualified) {
      dynamicRole = "2 Directs Req.";
    }

    return (
      <button
        key={pos}
        type="button"
        onClick={() => {
          if (!isCurrentSlotUnlocked) {
            toast.info(
              `Slot #${String(selectedSlot).padStart(2, "0")} is Locked`,
              `Position #${pos} unlocks automatically at $0 out-of-pocket cost when Slot #${selectedSlot - 1} completes.`
            );
            return;
          }
          if (isLockedUnqualified) {
            toast.info(
              `Position #${pos} Locked (2 Directs Required)`,
              `You currently have ${directsCount}/2 direct referrals. Positions 3 to 14 unlock automatically once your 2nd direct referral activates Slot 1.`
            );
            return;
          }
          setSelectedNodeModal(cfg);
        }}
        className={`${widthClass} rounded-2xl py-2 px-1 flex flex-col items-center justify-between transition-all hover:scale-105 active:scale-95 cursor-pointer ${styleClass}`}
        title={
          !isCurrentSlotUnlocked
            ? `Position #${pos} is Locked (Slot #${selectedSlot} unlocks via Slot #${selectedSlot - 1} auto-reserve)`
            : isLockedUnqualified
            ? `Position #${pos} is Locked: 2 Direct Referrals required to unlock personal tree progression.`
            : `Position #${pos} (${cfg.fullRole}): ${filled ? `Filled by ${node.label || "Operative"}` : isNextUp ? "NEXT UP to be filled!" : "Open"}`
        }
      >
        <div className="flex items-center justify-between w-full px-1.5">
          <span className={`font-black text-xs sm:text-sm ${!isCurrentSlotUnlocked ? "text-slate-400" : "text-[#0b132b]"}`}>
            #{pos}
          </span>
          <span className="flex items-center gap-0.5">
            {statusDot}
          </span>
        </div>

        <span className={`px-1.5 py-0.5 rounded-md border text-[9px] sm:text-[10px] font-black tracking-tight my-1 truncate max-w-full ${roleBadge}`}>
          {!isCurrentSlotUnlocked ? cfg.role : isNextUp ? "⭐ NEXT" : dynamicRole}
        </span>

        <span className="text-[9px] sm:text-[9.5px] font-bold text-slate-400 truncate max-w-full px-0.5">
          {filled ? (node.code || `Member #${pos + 1}`) : statusText}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e0eaf7] p-3 sm:p-4 lg:p-5 shadow-xs w-full min-w-0 overflow-hidden">
      {/* ───────────────── HEADER & SLOT NAVIGATION ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[16px] sm:text-[18px] font-black text-[#102341] tracking-tight">
              MATRIX VISUALIZER
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e7f1ff] text-[#1758cc] border border-[#cde0ff]">
              14 Seats / Slot
            </span>

            {/* INTERACTIVE CYCLE TOGGLE PILLS */}
            {!isCurrentSlotUnlocked ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Slot #{String(selectedSlot).padStart(2, "0")} Locked
              </span>
            ) : totalCycles > 1 ? (
              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleCycleChange(1)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
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
                  onClick={() => handleCycleChange(2)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCycle === 2
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Cycle 2</span>
                  <span className="text-[9px] opacity-90">
                    (Active{selectedCycle === 2 ? `: ${filledCount}/14` : ""})
                  </span>
                </button>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ecfbf5] text-[#15815f] border border-[#b4e9d6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15815f] animate-pulse" />
                Cycle #{String(currentCycle).padStart(2, "0")}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-[11.5px] text-slate-500 mt-0.5">
            {!isCurrentSlotUnlocked ? (
              <span className="font-semibold text-slate-500">
                Slot #{String(selectedSlot).padStart(2, "0")} • Locked Tier • Automatically unlocks at $0 out-of-pocket cost via Slot #{Math.max(1, selectedSlot - 1)} (P4 &amp; P5)
              </span>
            ) : (
              <>
                Slot #{String(selectedSlot).padStart(2, "0")} • {filledCount} / 14 Nodes Filled •{" "}
                {isViewingSnapshot ? (
                  <strong className="text-emerald-600">Cycle #{selectedCycle} Fulfilled Board (14/14 All Settled 🎉)</strong>
                ) : (
                  <span>${slotCost.toFixed(2)} P2P Settlement</span>
                )}
              </>
            )}
          </p>
        </div>

        {/* View Switcher (Tree vs Table vs Direct Partners) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 flex-wrap">
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
          <button
            type="button"
            onClick={() => setViewMode("directs")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "directs" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Direct Partners ({Math.max(directsCount, directMembersList.length)})</span>
          </button>
        </div>
      </div>

      {/* Informative Cycle Progress Banners */}
      {isCurrentSlotUnlocked && totalCycles > 1 && selectedCycle === 2 && (
        <div className="my-2.5 px-3 py-2 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <span>
              <strong>Cycle 1 Completed (14/14 Fulfilled & Paid Out)!</strong> Slot #{selectedSlot} has recycled into Cycle 2 and is open for new team placements.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCycleChange(1)}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shrink-0 transition-all cursor-pointer self-start sm:self-auto"
          >
            View Completed Cycle 1 Board
          </button>
        </div>
      )}
      {isCurrentSlotUnlocked && totalCycles > 1 && selectedCycle === 1 && (
        <div className="my-2.5 px-3 py-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              <strong>🏆 Viewing Cycle 1 Snapshot:</strong> All 14 seats are 100% completed & on-chain payouts fulfilled.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCycleChange(2)}
            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shrink-0 transition-all cursor-pointer self-start sm:self-auto"
          >
            Switch to Active Cycle 2
          </button>
        </div>
      )}

      {/* ───────────────── HORIZONTAL SLOT PICKER BAR ───────────────── */}
      <div className="py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((sNum) => {
          const isActive = selectedSlot === sNum;
          const isSlotUnlocked = sNum <= highestUnlockedSlot;
          const isCompleted = isSlotUnlocked && ((activeSlotDetails?.slotNumber === sNum && activeSlotDetails?.filledNodes >= 14) || (activeSlotDetails?.totalCycles && activeSlotDetails.totalCycles > 1 && sNum < activeSlotDetails.slotNumber));
          const cost = getSlotCost(sNum);
          return (
            <button
              key={sNum}
              type="button"
              onClick={() => handleSelectSlot(sNum)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? isSlotUnlocked
                    ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/25"
                    : "bg-slate-800 text-white shadow-sm"
                  : isSlotUnlocked
                  ? "bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200"
                  : "bg-slate-50/60 text-slate-400 border border-slate-200/60 hover:border-slate-300"
              }`}
            >
              <span>Slot #{String(sNum).padStart(2, "0")}</span>
              <span className={`text-[10px] font-semibold ${isActive ? "text-slate-200" : "text-slate-400"}`}>
                (${cost})
              </span>
              {isCompleted ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-200" title="Completed 14/14" />
              ) : isSlotUnlocked ? (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Unlocked & Active" />
              ) : (
                <span title="Locked Tier">
                  <Lock className="w-3 h-3 text-slate-400" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────── STANDBY TIER BANNER (P4+P5 Auto-Reserved) ───────────────── */}
      {isSlotStandby && (
        <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-950 block">
                Slot #{String(selectedSlot).padStart(2, "0")} is Unlocked in Standby Mode (${slotCost}.00 Tier)
              </span>
              <span className="text-[11px] text-blue-700 font-medium">
                Auto-reserved at $0 out-of-pocket via Slot #{selectedSlot - 1} (P4 &amp; P5). Live team placements will begin once your Slot #{selectedSlot - 1} board completes all 14 positions.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectSlot(selectedSlot - 1)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-all"
          >
            ← View Active Slot #{String(selectedSlot - 1).padStart(2, "0")}
          </button>
        </div>
      )}

      {/* ───────────────── LOCKED SLOT NOTIFICATION BANNER ───────────────── */}
      {!isCurrentSlotUnlocked && (
        <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-100 via-amber-50/40 to-slate-100 border border-slate-200 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Slot #{String(selectedSlot).padStart(2, "0")} is Locked (${slotCost}.00 Tier)
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                Automated progression ($0 out-of-pocket): Unlocks automatically when your Slot #{Math.max(1, selectedSlot - 1)} board completes all 14 positions (via P4 &amp; P5 auto-reserve funds).
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectSlot(highestUnlockedSlot)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-all"
          >
            ← View Active Slot #{String(highestUnlockedSlot).padStart(2, "0")}
          </button>
        </div>
      )}

      {/* ───────────────── CLEAN LEGEND (Exact Image 5 Styling) ───────────────── */}
      <div className="py-2.5 px-1 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600 border-b border-slate-100">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold text-slate-700">+${slotCost} Direct Income</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shadow-[0_0_8px_#2563eb]" />
            <span className="font-semibold text-slate-700">Level 1 (Pass-Up)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span className="font-semibold text-slate-700">Pool / Reserve</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-blue-500 animate-ping" />
            <span className="font-semibold text-blue-600">Next Up Spot</span>
          </span>
        </div>

        {sponsor && sponsor !== "0x0000000000000000000000000000000000000000" && (
          <div className="text-[11px] font-semibold text-slate-500">
            Sponsor:{" "}
            <span className="font-mono font-bold text-[#2563eb]">
              {isVaultSponsor ? "Protocol Vault (Apex Root)" : formatAddress(toTrobBase58(sponsor))}
            </span>
          </div>
        )}
      </div>

      {/* ───────────────── TREE VISUALIZER CONTAINER (Large & Bold Binary Tree Layout) ───────────────── */}
      {viewMode === "tree" ? (
        <div className="mt-3 bg-gradient-to-b from-[#f8fbff] to-white border border-[#d8e6f8] rounded-2xl p-3 sm:p-5 w-full min-w-0">
          {/* Mobile Pan / Swipe Hint */}
          <div className="flex sm:hidden items-center justify-between px-2.5 py-1.5 mb-2.5 bg-blue-50/90 rounded-xl border border-blue-200/80 text-[11px] text-blue-700 font-semibold">
            <span>💡 Pan horizontally to explore all 14 tree positions</span>
            <span className="font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">14 Seats</span>
          </div>

          <div className="py-2 sm:py-4 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent pb-3">
            <div className="w-[640px] mx-auto shrink-0 flex flex-col items-center">
              {/* Root Node: YOU */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-400/30 text-xs sm:text-sm">
                <span>YOU</span>
                <span className="text-[9px] font-bold opacity-90 text-blue-100">Root Node</span>
              </div>

              {/* Connector: Root to Level 1 */}
              <svg className="w-[640px] h-9 overflow-visible" viewBox="0 0 640 36" fill="none">
                <path d="M 320 0 V 18 H 160 V 36" stroke={isNodeFilled(1) ? "#2563eb" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(1) ? "none" : "3 3"} />
                <path d="M 320 18 H 480 V 36" stroke={isNodeFilled(2) ? "#2563eb" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(2) ? "none" : "3 3"} />
              </svg>

              {/* Level 1: 2 Nodes (1, 2) */}
              <div className="w-[640px] flex justify-between px-[115px]">
                {renderTreeNode(1)}
                {renderTreeNode(2)}
              </div>

              {/* Connector: Level 1 to Level 2 */}
              <svg className="w-[640px] h-9 overflow-visible" viewBox="0 0 640 36" fill="none">
                <path d="M 160 0 V 18 H 80 V 36" stroke={isNodeFilled(3) ? "#10b981" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(3) ? "none" : "3 3"} />
                <path d="M 160 18 H 240 V 36" stroke={isNodeFilled(4) ? "#f59e0b" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(4) ? "none" : "3 3"} />
                <path d="M 480 0 V 18 H 400 V 36" stroke={isNodeFilled(5) ? "#f59e0b" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(5) ? "none" : "3 3"} />
                <path d="M 480 18 H 560 V 36" stroke={isNodeFilled(6) ? "#10b981" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(6) ? "none" : "3 3"} />
              </svg>

              {/* Level 2: 4 Nodes (3, 4, 5, 6) */}
              <div className="w-[640px] flex justify-between px-[40px]">
                {renderTreeNode(3)}
                {renderTreeNode(4)}
                {renderTreeNode(5)}
                {renderTreeNode(6)}
              </div>

              {/* Connector: Level 2 to Level 3 */}
              <svg className="w-[640px] h-9 overflow-visible" viewBox="0 0 640 36" fill="none">
                <path d="M 80 0 V 18 H 40 V 36" stroke={isNodeFilled(7) ? "#a855f7" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(7) ? "none" : "3 3"} />
                <path d="M 80 18 H 120 V 36" stroke={isNodeFilled(8) ? "#10b981" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(8) ? "none" : "3 3"} />
                <path d="M 240 0 V 18 H 200 V 36" stroke={isNodeFilled(9) ? "#10b981" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(9) ? "none" : "3 3"} />
                <path d="M 240 18 H 280 V 36" stroke={isNodeFilled(10) ? "#a855f7" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(10) ? "none" : "3 3"} />
                <path d="M 400 0 V 18 H 360 V 36" stroke={isNodeFilled(11) ? "#10b981" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(11) ? "none" : "3 3"} />
                <path d="M 400 18 H 440 V 36" stroke={isNodeFilled(12) ? "#10b981" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(12) ? "none" : "3 3"} />
                <path d="M 560 0 V 18 H 520 V 36" stroke={isNodeFilled(13) ? "#a855f7" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(13) ? "none" : "3 3"} />
                <path d="M 560 18 H 600 V 36" stroke={isNodeFilled(14) ? "#f43f5e" : "#cbd5e1"} strokeWidth="2" strokeDasharray={isNodeFilled(14) ? "none" : "3 3"} />
              </svg>

              {/* Level 3: 8 Nodes (7 through 14) */}
              <div className="w-[640px] flex justify-between px-[5px]">
                {[7, 8, 9, 10, 11, 12, 13, 14].map((pos) => renderTreeNode(pos))}
              </div>
            </div>
          </div>

          {/* Bottom Metrics: 3 Columns matching Figma */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 text-left divide-x divide-slate-100 mt-3">
            <div className="px-2 sm:px-4">
              <div className="text-lg sm:text-xl font-black text-[#0b132b] tracking-tight">
                {!isCurrentSlotUnlocked ? "0/14" : `${filledCount}/14`}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                {!isCurrentSlotUnlocked ? "Slot Locked" : "Nodes Filled"}
              </div>
            </div>
            <div className="px-2 sm:px-4">
              <div className="text-lg sm:text-xl font-black text-[#0b132b] tracking-tight">
                {!isCurrentSlotUnlocked ? "Locked" : `Cycle #${currentCycle}`}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                {!isCurrentSlotUnlocked ? "Auto-Reserve Tier" : "Board Cycle"}
              </div>
            </div>
            <div className="px-2 sm:px-4">
              <div className="text-lg sm:text-xl font-black text-emerald-600 tracking-tight">
                {!isCurrentSlotUnlocked ? "$0 Cost" : "Live On-Chain"}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                {!isCurrentSlotUnlocked ? "Auto-Upgrade" : "Verified"}
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* ───────────────── 14-POSITIONS LEDGER TABLE VIEW ───────────────── */
        <div className="mt-3.5 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>Position & Payout Rule</span>
            <span>Occupant / Settlement</span>
          </div>
          {Array.from({ length: 14 }, (_, i) => i + 1).map((pos) => {
            const cfg = SEAT_METAS[pos];
            const node = getNodeInfo(pos);
            const filled = isCurrentSlotUnlocked && node.filled;
            const styles = getCategoryStyles(cfg.type, filled);

            return (
              <div
                key={pos}
                onClick={() => {
                  if (!isCurrentSlotUnlocked) {
                    toast.info(
                      `Slot #${String(selectedSlot).padStart(2, "0")} is Locked`,
                      `Position #${pos} unlocks automatically at $0 out-of-pocket cost when Slot #${selectedSlot - 1} completes.`
                    );
                    return;
                  }
                  setSelectedNodeModal(cfg);
                }}
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
                        {cfg.type === "income"
                          ? `+$${slotCost} (YOU)`
                          : pos === 1
                          ? "Direct 1 (Pass-Up)"
                          : pos === 2
                          ? "Direct 2 (Pass-Up)"
                          : pos === 7
                          ? "Downline 1 Spill"
                          : pos === 10
                          ? "Downline 2 Spill"
                          : pos === 13
                          ? "Waterfall Spill"
                          : "Protocol Pools"}
                      </span>
                    </div>
                  ) : !isCurrentSlotUnlocked ? (
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Locked
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold">Available</span>
                  )}
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ───────────────── DIRECT PARTNERS ROSTER VIEW ───────────────── */
        <div className="mt-3.5 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3 sm:p-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Direct Referral Partners ({Math.max(directsCount, directMembersList.length)})
              </span>
              <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                First 2 direct referrals qualify your matrix for 100% P2P yields. All subsequent directs spill over dynamically top-to-bottom, left-to-right to strengthen your team!
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold border self-start sm:self-auto shrink-0 ${
              isOwnerQualified
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-amber-100 text-amber-800 border-amber-300"
            }`}>
              {isOwnerQualified ? "100% Yield Qualified" : `${Math.max(0, 2 - directsCount)} More Direct to Qualify`}
            </span>
          </div>

          <div className="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>Direct Partner</span>
            <span>Role / Tier Status</span>
          </div>

          {directMembersList.length > 0 ? (
            directMembersList.map((m: any, idx: number) => {
              const b58 = m.address || toTrobBase58(m.evmAddress);
              const isDirect1 = idx === 0;
              const isDirect2 = idx === 1;
              const roleTag = isDirect1
                ? "Level 1 • Seat #1 (Direct 1 Qualified)"
                : isDirect2
                ? "Level 1 • Seat #2 (Direct 2 Qualified)"
                : `Team Spillover • Direct #${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="px-3 sm:px-4 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
                      #{idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                        {m.username || `Partner #${m.userId || idx + 1}`}
                        <button
                          type="button"
                          onClick={() => copyText(b58)}
                          className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5 font-mono text-[10px] cursor-pointer"
                          title="Click to copy wallet address"
                        >
                          ({formatAddress(b58)})
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Joined: {new Date(m.joinedAt || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      idx < 2
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {roleTag}
                    </span>
                    <a
                      href={`${EXPLORER_URL}/#/address/${b58}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Direct Referrals Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                Share your personal referral link to invite partners and qualify for 100% P2P instant matrix yields.
              </p>
            </div>
          )}
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
                  {selectedNodeModal.type === "income"
                    ? isOwnerQualified
                      ? `100% P2P instant settlement ($${slotCost.toFixed(2)} USD) directly into your wallet.`
                      : `⚠️ 2-Direct Qualification Pending (${directsCount}/2 Directs): Per EquoraMatrix.sol rules, direct P2P income requires 2 active direct referrals. Because ${directsCount} direct is active, this settlement routed directly to the Protocol Pools Vault.`
                    : selectedNodeModal.pos === 1
                    ? `Level 1 frontline seat. 100% P2P pass-through to matrix sponsor ($${slotCost.toFixed(2)} USD). Frontline seats qualify you for 100% Level 2 and Level 3 income.`
                    : selectedNodeModal.pos === 2
                    ? `Level 1 frontline seat. 100% P2P pass-through routes to upline 2 ($${slotCost.toFixed(2)} USD). Frontline seats satisfy your 2-direct qualification.`
                    : selectedNodeModal.desc}
                </p>
              </div>

              {getNodeInfo(selectedNodeModal.pos).filled ? (() => {
                const nodeInfo = getNodeInfo(selectedNodeModal.pos);
                const vaultB58 = toTrobBase58(CONTRACT_ADDRESSES.vault);
                let recipientLabel = "YOU (Matrix Owner)";
                let recipientWallet = address ? toTrobBase58(address) : vaultB58;

                if (selectedNodeModal.type === "income") {
                  if (isOwnerQualified) {
                    recipientLabel = "YOU (Matrix Owner — 100% Direct P2P)";
                    recipientWallet = address ? toTrobBase58(address) : vaultB58;
                  } else {
                    recipientLabel = `4 Protocol Pools (Vault — ${directsCount}/2 Directs)`;
                    recipientWallet = vaultB58;
                  }
                } else if (selectedNodeModal.pos === 1) {
                  recipientLabel = "Upline Sponsor (Level 1 Pass-Up)";
                  recipientWallet = profile?.sponsorAddress
                    ? toTrobBase58(profile.sponsorAddress)
                    : (data?.sponsorAddress ? toTrobBase58(data.sponsorAddress) : vaultB58);
                } else if (selectedNodeModal.pos === 2) {
                  recipientLabel = "Upline 2 (Level 1 Pass-Up)";
                  recipientWallet = profile?.upline2Address ? toTrobBase58(profile.upline2Address) : vaultB58;
                } else if (selectedNodeModal.pos === 7) {
                  recipientLabel = "Downline 1 (Node 1 Spillover)";
                  const d1Addr = nodes[0]?.placedUser || nodes[0]?.base58;
                  recipientWallet = d1Addr ? toTrobBase58(d1Addr) : vaultB58;
                } else if (selectedNodeModal.pos === 10) {
                  recipientLabel = "Downline 2 (Node 2 Spillover)";
                  const d2Addr = nodes[1]?.placedUser || nodes[1]?.base58;
                  recipientWallet = d2Addr ? toTrobBase58(d2Addr) : vaultB58;
                } else if (selectedNodeModal.pos === 13) {
                  recipientLabel = "Waterfall (Nodes 3, 4, 5, 6)";
                  recipientWallet = vaultB58;
                } else if (selectedNodeModal.pos === 5) {
                  recipientLabel = "Pools + Slot Reserve";
                  recipientWallet = vaultB58;
                } else if (selectedNodeModal.pos === 14) {
                  recipientLabel = "Pools + Cycle Recycle";
                  recipientWallet = vaultB58;
                } else {
                  recipientLabel = "4 Protocol Pools (Vault)";
                  recipientWallet = vaultB58;
                }

                return (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Position Status
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9.5px] font-bold">
                        Settled On-Chain ✓
                      </span>
                    </div>

                    {/* Member Occupant Details */}
                    <div className="pt-1.5 pb-1 border-b border-emerald-200/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Seat Occupant:</span>
                        <span className="font-bold text-slate-900">
                          {nodeInfo.label || `Member #${selectedNodeModal.pos}`}
                        </span>
                      </div>
                      {nodeInfo.address && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 text-[10.5px]">Occupant Wallet:</span>
                          <button
                            type="button"
                            onClick={() => copyText(nodeInfo.address!)}
                            className="font-mono text-[10.5px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer font-bold transition-colors"
                            title="Click to copy occupant wallet address"
                          >
                            {formatAddress(nodeInfo.address)}
                            {copiedAddr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-600" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payout Recipient Destination */}
                    <div className="pt-1.5 pb-1 border-b border-emerald-200/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Payout Recipient:</span>
                        <span className={`font-extrabold px-2 py-0.5 rounded border text-[10.5px] ${
                          selectedNodeModal.type === "income" && !isOwnerQualified
                            ? "text-amber-800 bg-amber-50 border-amber-300"
                            : "text-blue-800 bg-blue-50 border-blue-200"
                        }`}>
                          {recipientLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 text-[10.5px]">Recipient Wallet:</span>
                        <button
                          type="button"
                          onClick={() => copyText(recipientWallet)}
                          className={`font-mono text-[10.5px] px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer font-bold transition-colors ${
                            selectedNodeModal.type === "income" && !isOwnerQualified
                              ? "text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300"
                              : "text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/70 border-emerald-300"
                          }`}
                          title="Click to copy on-chain recipient address"
                        >
                          {formatAddress(recipientWallet)}
                          {copiedAddr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Settled Amount */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 font-medium">Settled Amount:</span>
                      <span className="font-bold text-emerald-700">
                        ${slotCost.toFixed(2)} USD (100% On-Chain)
                      </span>
                    </div>

                    {/* Unqualified Warning Note */}
                    {selectedNodeModal.type === "income" && !isOwnerQualified && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-relaxed">
                        <strong>⚠️ Qualification Rule in EquoraMatrix.sol:</strong>
                        <p className="mt-0.5">
                          You currently have {directsCount} active direct referral (2 required). Under protocol rules, personal tree commissions route to Protocol Pools Vault until your 2nd direct referral activates Slot 1.
                        </p>
                      </div>
                    )}

                    {nodeInfo.txHash && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-200/50">
                        <span className="text-slate-500">Tx Hash:</span>
                        <a
                          href={`${EXPLORER_URL}/#/transaction/${nodeInfo.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          {nodeInfo.txHash?.slice(0, 10)}...
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Position Status
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[9.5px] font-bold">
                      Open Available
                    </span>
                  </div>
                  <p className="text-amber-900 text-[11px] leading-relaxed">
                    Open. The next operative placed under this cycle will automatically fill this position.
                  </p>
                  {/* Recipient Wallet Preview for Open Slots */}
                  {(() => {
                    const isPool = selectedNodeModal.type === "pool" || selectedNodeModal.pos === 4 || selectedNodeModal.pos === 5 || selectedNodeModal.pos === 14;
                    const previewWallet = isPool
                      ? toTrobBase58(CONTRACT_ADDRESSES.vault)
                      : selectedNodeModal.type === "income"
                      ? toTrobBase58(address || "")
                      : selectedNodeModal.pos === 1
                      ? toTrobBase58(profile?.sponsorAddress || data?.sponsorAddress || CONTRACT_ADDRESSES.vault)
                      : toTrobBase58(CONTRACT_ADDRESSES.vault);

                    if (!previewWallet) return null;

                    return (
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-amber-200/60">
                        <span className="text-amber-700 text-[10.5px] font-semibold">
                          {isPool ? "Designated Pool:" : "Designated Recipient:"}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(previewWallet)}
                          className="font-mono text-[10px] text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer font-bold"
                          title="Click to copy"
                        >
                          {formatAddress(previewWallet)}
                          <Copy className="w-2.5 h-2.5 text-amber-600" />
                        </button>
                      </div>
                    );
                  })()}
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
