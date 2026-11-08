"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatrixDashboardOverview } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { CONTRACT_ADDRESSES, getOnChainSlotDetails, getOnChainDirectMembers, toHexAddress, EXPLORER_URL, APEX_LEADER_HEX } from "@/lib/contracts";
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
  ArrowRight,
  Award,
  Lock,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { SlotUnlockedCelebrationModal } from "@/components/modals/SlotUnlockedCelebrationModal";

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
    desc: "Left-leg frontline spillover. 100% P2P pass-through routes directly to Downline 1 (Node #1) if qualified ($30).",
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
    desc: "Right-leg frontline spillover. 100% P2P pass-through routes directly to Downline 2 (Node #2) if qualified ($30).",
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
  const storeSelectedCycle = useMatrixStore((s) => s.selectedCycle);
  const profile = useUserStore((s) => s.profile);
  const address = useUserStore((s) => s.address);

  const [selectedSlot, setSelectedSlot] = useState<number>(storeSelectedSlot || 1);
  const [selectedCycle, setSelectedCycle] = useState<number | null>(storeSelectedCycle ?? null);
  const [liveSlotData, setLiveSlotData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"tree" | "table" | "directs">("tree");
  const [directMembersList, setDirectMembersList] = useState<any[]>([]);
  const [selectedNodeModal, setSelectedNodeModal] = useState<SeatMeta | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [celebrationUnlockedSlot, setCelebrationUnlockedSlot] = useState<number>(2);


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
    setSelectedCycle(null);
    const raw = address || data?.address;
    const active = raw ? toHexAddress(raw) : undefined;
    const cacheKey = `${sNum}_1`;
    const cached = useMatrixStore.getState().slotDetailsCache[cacheKey];
    if (cached) {
      setLiveSlotData(cached);
      useMatrixStore.setState({ slotDetails: cached, selectedSlotNumber: sNum, selectedCycle: 1 });
    }
    selectSlotStore(sNum, undefined, active);
  };

  const handleCycleChange = (cNum: number) => {
    setSelectedCycle(cNum);
    const raw = address || data?.address;
    const active = raw ? toHexAddress(raw) : undefined;
    const cacheKey = `${selectedSlot}_${cNum}`;
    const cached = useMatrixStore.getState().slotDetailsCache[cacheKey];
    if (cached) {
      setLiveSlotData(cached);
      useMatrixStore.setState({ slotDetails: cached, selectedCycle: cNum });
    }
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
        const details = await getOnChainSlotDetails(active, selectedSlot, selectedCycle ?? undefined);
        if (isMounted && details) {
          setLiveSlotData(details);
          useMatrixStore.setState({
            slotDetails: details,
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

  // Dynamic Auto-Escalation:
  // When Node 4 (index 3) and Node 5 (index 4) of Slot 1 are filled,
  // Slot 2 unlocks automatically in Standby Mode at $0 out-of-pocket!
  const slot1Nodes =
    (activeSlotDetails?.slotNumber === 1 ? activeSlotDetails?.nodes : null) ||
    data?.activeSlotProgress?.nodes ||
    [];
  const isNodeOccupied = (n: any) =>
    Boolean(
      n?.filled ||
      (n?.placedUser && n.placedUser !== "0x0000000000000000000000000000000000000000" && n.placedUser !== "0x0") ||
      (n?.base58 && n.base58 !== "-" && n.base58.length > 5)
    );
  const slot1FilledCount =
    (activeSlotDetails?.slotNumber === 1 ? (activeSlotDetails?.filledNodes ?? (activeSlotDetails?.nodes ? activeSlotDetails.nodes.filter((n: any) => n?.filled).length : 0)) : 0) ||
    (data?.activeSlotProgress?.filledNodes ?? 0);
  const isUserRegistered = Boolean(profile?.isRegistered);
  const effectiveHighestUnlocked = isUserRegistered ? (highestUnlockedSlot || 1) : 0;
  const isSlot1Escalated = highestUnlockedSlot >= 2;

  const isCurrentSlotUnlocked = selectedSlot === 1
    ? true
    : (activeSlotDetails ? Boolean(activeSlotDetails.isUnlocked) : (isUserRegistered && selectedSlot <= effectiveHighestUnlocked));

  // Slot 1 completion check: When Slot 1 is 14/14 complete, Slot 2 is fully Live & Activated!
  const isSlot1Complete = Boolean(
    activeSlotDetails?.prevSlotCompleted ||
    (activeSlotDetails as any)?.isSlot1Completed ||
    (activeSlotDetails as any)?.slot1FilledNodes >= 14 ||
    slot1FilledCount >= 14 ||
    (data?.recyclesCount && data.recyclesCount > 0) ||
    (data?.activeSlotProgress?.filledNodes && data.activeSlotProgress.filledNodes >= 14) ||
    (data?.activeSlotProgress?.cycle && data.activeSlotProgress.cycle > 1) ||
    (profile as any)?.isSlot1Complete
  );

  const isCurrentSlotLive = Boolean(isCurrentSlotUnlocked);
  const isSlotStandby = false;


  const currentCycle = isCurrentSlotUnlocked ? (activeSlotDetails?.currentCycle ?? 1) : 0;
  const totalCycles = isCurrentSlotUnlocked ? (activeSlotDetails?.totalCycles ?? currentCycle) : 0;
  const snapshotCount = isCurrentSlotUnlocked ? (activeSlotDetails?.snapshotCount ?? 0) : 0;
  const isViewingSnapshot = isCurrentSlotUnlocked && Boolean(activeSlotDetails?.isViewingSnapshot);
  const effectiveSelectedCycle = isViewingSnapshot
    ? (activeSlotDetails?.selectedCycle || selectedCycle || 1)
    : (selectedCycle || currentCycle);
  const nodes = isCurrentSlotUnlocked
    ? (activeSlotDetails && activeSlotDetails.slotNumber === selectedSlot && Array.isArray(activeSlotDetails.nodes) && activeSlotDetails.nodes.length > 0
        ? activeSlotDetails.nodes
        : (selectedSlot === 1 ? (data?.activeSlotProgress?.nodes || []) : []))
    : [];
  const realFilledCount = isCurrentSlotUnlocked && nodes.length > 0 ? nodes.filter((n: any) => n?.filled).length : 0;
  const filledCount = realFilledCount > 0
    ? realFilledCount
    : (isCurrentSlotUnlocked && activeSlotDetails?.slotNumber === selectedSlot
        ? (activeSlotDetails?.filledNodes ?? 0)
        : (selectedSlot === 1 ? (data?.activeSlotProgress?.filledNodes ?? 0) : 0));
  const firstOpenIdx = nodes.length > 0 ? nodes.findIndex((n: any) => !n?.filled) : -1;
  const firstOpenSeat = firstOpenIdx >= 0 ? firstOpenIdx + 1 : (filledCount < 14 ? filledCount + 1 : 1);

  const isNodeFilled = (pos: number) => {
    if (!isCurrentSlotUnlocked) return false;
    return Boolean(nodes[pos - 1]?.filled);
  };

  // Check if P4 & P5 automated escalation fulfilled -> celebrate next slot unlock
  useEffect(() => {
    if (!address || !isCurrentSlotUnlocked) return;
    const isP4P5Filled = Boolean(nodes[3]?.filled && nodes[4]?.filled);
    const nextSlotNum = selectedSlot + 1;
    if (nextSlotNum <= 12 && (isP4P5Filled || highestUnlockedSlot >= nextSlotNum)) {
      const key = `equora_slot_unlocked_celebration_seen_${nextSlotNum}_${address.toLowerCase()}`;
      if (!localStorage.getItem(key)) {
        setCelebrationUnlockedSlot(nextSlotNum);
        setCelebrationModalOpen(true);
      }
    }
  }, [address, isCurrentSlotUnlocked, selectedSlot, nodes, highestUnlockedSlot]);

  const handleCloseCelebrationModal = () => {
    if (address) {
      localStorage.setItem(`equora_slot_unlocked_celebration_seen_${celebrationUnlockedSlot}_${address.toLowerCase()}`, "true");
    }
    setCelebrationModalOpen(false);
  };

  const handleNavigateCelebratedSlot = (slotNum: number) => {
    handleCloseCelebrationModal();
    handleSelectSlot(slotNum);
  };

  const getNodeInfo = (pos: number) => {
    const n = nodes[pos - 1];
    const filled = isNodeFilled(pos);
    if (!filled) {
      return { filled: false, label: "Available", code: null, address: null, txHash: null, metaLabel: null };
    }
    const occupantAddr = n?.placedUser || n?.base58 || null;
    if (!occupantAddr || occupantAddr === "0x0000000000000000000000000000000000000000" || occupantAddr === "0x0") {
      return { filled: false, label: "Available", code: null, address: null, txHash: null, metaLabel: null };
    }
    const occupantBase58 = n?.base58 || toTrobBase58(occupantAddr);
    const txHash = n?.txHash || null;
    const metaLabel = n?.label || (n?.code ? `Member #${n.code}` : (n?.userId ? `Member #${n.userId}` : formatAddress(occupantBase58)));
    const code = n?.code ? `#${n.code}` : (n?.userId ? `#${n.userId}` : formatAddress(occupantBase58));
    return { filled: true, label: metaLabel, code, address: occupantBase58, txHash, metaLabel, recipientAddress: n?.recipientAddress || null, payoutType: n?.payoutType || null };
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
    (Boolean(APEX_LEADER_HEX) && targetHex === APEX_LEADER_HEX) ||
    targetHex === toHexAddress(CONTRACT_ADDRESSES.vault).toLowerCase();

  const directsCount = Math.max(
    directMembersList.length,
    profile?.activeDirectsCount ?? 0,
    profile?.directReferralsCount ?? 0,
    data?.activeDirectsCount ?? 0
  );

  // The 2 direct referral restriction strictly applies ONLY to initial onboarding on Slot 1 Cycle 1.
  // For all higher slots (Slot 2-12) or subsequent cycles (Cycle 2, 3...), operatives are permanently qualified!
  const globalCycle = activeSlotDetails?.globalCycle ?? (data as any)?.globalCycle ?? 1;
  // Strictly only new users at initial Slot 1 in Cycle 1 require 2 directs:
  // In Cycle 2 or any slot > 1, operatives are 100% qualified from inception
  const isInitialSlot1Cycle1 = selectedSlot === 1 && globalCycle <= 1 && effectiveHighestUnlocked <= 1;
  const isCycledOrHigherSlot = Boolean(
    selectedSlot > 1 ||
    effectiveHighestUnlocked > 1 ||
    globalCycle > 1 ||
    currentCycle > 1 ||
    (data?.recyclesCount && data.recyclesCount > 0)
  );

  const isOwnerQualified = isCycledOrHigherSlot || !isInitialSlot1Cycle1 || directsCount >= 2;

  const firstOpenPosIndex = isCurrentSlotUnlocked && nodes.length > 0 ? nodes.findIndex((n: any) => !n?.filled) : -1;
  const nextUpcomingPos = isCurrentSlotUnlocked && !isSlotStandby
    ? (firstOpenPosIndex >= 0 ? firstOpenPosIndex + 1 : (filledCount < 14 ? filledCount + 1 : (filledCount === 14 ? null : 1)))
    : null;

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
    } else if (isSlotStandby) {
      styleClass =
        "bg-slate-50/70 border-2 border-dashed border-blue-200 text-slate-400 opacity-80 hover:opacity-100 transition-all";
      roleBadge = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      statusText = "Standby";
      statusDot = <Lock className="w-2.5 h-2.5 text-blue-500" />;
    } else if (isNextUp) {
      styleClass =
        "bg-gradient-to-b from-blue-500/15 via-sky-50 to-white border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20 text-slate-900 animate-pulse";
      roleBadge = "bg-blue-600 text-white font-black border-blue-600 shadow-xs";
      statusText = "Next Up";
      statusDot = <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />;
    } else {
      styleClass =
        "bg-white border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 text-slate-500";
      roleBadge = "bg-slate-100 text-slate-600 border-slate-200";
      statusText = "Open";
    }

    let dynamicRole = isSlotStandby ? "Standby" : cfg.role;
    if (cfg.type === "income") {
      if (filled) {
        dynamicRole = isOwnerQualified ? `+$30 YOU` : `Pool (${directsCount}/2)`;
      } else {
        dynamicRole = isOwnerQualified ? `+$30 YOU` : `+$30 (Req 2 Dir)`;
      }
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
        className={`animate-tree-node ${widthClass} rounded-2xl py-2 px-1 flex flex-col items-center justify-between transition-all hover:scale-105 active:scale-95 cursor-pointer ${styleClass}`}
        style={{ animationDelay: `${pos * 40}ms` }}
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
          {filled ? (node.code || (node.address ? formatAddress(node.address) : "Filled")) : statusText}
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

            {/* INTERACTIVE INFINITE CYCLE TOGGLE PILLS */}
            {!isCurrentSlotUnlocked ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Slot #{String(selectedSlot).padStart(2, "0")} Locked
              </span>
            ) : snapshotCount > 0 ? (
              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleCycleChange(1)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    isViewingSnapshot
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                  title="View Completed 14/14 History"
                >
                  <span>🏆 Board #1 History</span>
                  <span className="text-[9px] opacity-90">(14/14 Settled)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCycle(null);
                    const raw = address || data?.address;
                    const active = raw ? toHexAddress(raw) : undefined;
                    selectSlotStore(selectedSlot, undefined, active);
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    !isViewingSnapshot
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                  title="View Live Active Board"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>⚡ Active Board</span>
                  <span className="text-[9px] opacity-90">({realFilledCount}/14)</span>
                </button>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ecfbf5] text-[#15815f] border border-[#b4e9d6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15815f] animate-pulse" />
                Cycle #{String(currentCycle).padStart(2, "0")} (Active)
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-[11.5px] text-slate-500 mt-0.5">
            {!isCurrentSlotUnlocked ? (
              <span className="font-semibold text-slate-500">
                {selectedSlot === 1
                  ? "Slot #01 • Entry Tier ($30 USD) • Join Matrix to Activate"
                  : `Slot #${String(selectedSlot).padStart(2, "0")} • Locked Tier • Automatically unlocks at $0 out-of-pocket cost via Slot #${Math.max(1, selectedSlot - 1)} (P4 & P5)`}
              </span>
            ) : (
              <>
                Slot #{String(selectedSlot).padStart(2, "0")} • {filledCount} / 14 Nodes Filled •{" "}
                {isViewingSnapshot ? (
                  <strong className="text-emerald-600">Board #1 History (14/14 Fulfilled &amp; Settled 🏆)</strong>
                ) : (
                  <span>Cycle #01 Active • Next Up: Position #{firstOpenSeat}</span>
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



      {/* ───────────────── HORIZONTAL SLOT PICKER BAR ───────────────── */}
      <div className="py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((sNum) => {
          const isActive = selectedSlot === sNum;
          const isSlotUnlocked = sNum <= effectiveHighestUnlocked;
          const isCompleted = isSlotUnlocked && ((activeSlotDetails?.slotNumber === sNum && activeSlotDetails?.filledNodes >= 14) || (activeSlotDetails?.totalCycles && activeSlotDetails.totalCycles > 1 && sNum < activeSlotDetails.slotNumber));
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

      {/* ───────────────── AUTO-ESCALATION NOTIFICATION (Slot 2 Unlocked from P4+P5) ───────────────── */}
      {selectedSlot === 1 && isSlot1Escalated && (
        <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                🎉 Next Slot #02 Activated!
              </span>
              <span className="text-[11px] text-emerald-800 font-medium">
                Your Slot #02 is active on-chain ($60.00 Tier) for follow-me upgrades and team placements.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectSlot(2)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>View Slot #02 Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ───────────────── LOCKED SLOT NOTIFICATION BANNER ───────────────── */}
      {!isCurrentSlotUnlocked && selectedSlot > 1 && (
        <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-100 via-amber-50/40 to-slate-100 border border-slate-200 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Slot #{String(selectedSlot).padStart(2, "0")} is Locked ($0 Out-of-Pocket)
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                Automated progression ($0 out-of-pocket): Unlocks automatically when your Slot #{Math.max(1, selectedSlot - 1)} board completes all 14 positions (via P4 &amp; P5 auto-reserve funds).
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectSlot(effectiveHighestUnlocked)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-all"
          >
            ← View Active Slot #{String(effectiveHighestUnlocked).padStart(2, "0")}
          </button>
        </div>
      )}

      
      {/* ───────────────── STANDBY RESERVED SLOT BANNER ───────────────── */}
      {isSlotStandby && (
        <div className="my-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-950 block">
                Slot #{String(selectedSlot).padStart(2, "0")} is in Standby Mode (Reserved Tier)
              </span>
              <span className="text-[11px] text-blue-700 font-medium">
                You have unlocked this tier! Active placements will begin flowing into this board once Slot #{selectedSlot - 1} completes all 14/14 seats.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectSlot(selectedSlot - 1)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-all"
          >
            ← View Slot #{String(selectedSlot - 1).padStart(2, "0")} Tree
          </button>
        </div>
      )}

      {/* ───────────────── CLEAN LEGEND (Exact Image 5 Styling) ───────────────── */}
      <div className="py-2.5 px-1 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-600 border-b border-slate-100">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold text-slate-700">+$30 Direct Income</span>
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
      {/* Snapshot Viewing Indicator Banner */}
      {isViewingSnapshot && (
        <div className="my-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200 text-emerald-950 text-xs font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                Viewing Slot #{String(selectedSlot).padStart(2, "0")} Completed Board #1 History • 14/14 Placements Fulfilled &amp; Settled
              </span>
              <span className="text-[11px] text-emerald-800 font-medium">
                Cycle #01 • All 14 seats were 100% verified on-chain. Direct P2P rewards ($180.00 USD) and auto-reserve were fulfilled.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCycleChange(totalCycles)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>← Return to Live Active Board (2/14)</span>
          </button>
        </div>
      )}

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
              <div className="animate-tree-node w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-400/30 text-xs sm:text-sm">
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
                          ? `+$30 (YOU)`
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
              {isOwnerQualified ? "100% Yield Qualified" : `${Math.max(0, 2 - directsCount)} More Direct to Qualify (2 Required)`}
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
                  {(() => {
                    if (selectedNodeModal.type === "income") {
                      if (isOwnerQualified) {
                        return "100% P2P instant settlement ($30.00 USD) directly into your wallet.";
                      }
                      return `⚠️ 2-Direct Qualification Pending (${directsCount}/2 Directs): Per EquoraMatrix.sol rules, direct P2P income requires 2 active direct referrals. Because you have ${directsCount} active direct, this settlement routed directly to the Protocol Pools Vault.`;
                    }
                    if (selectedNodeModal.pos === 1) {
                      if (profile?.isUpline1Qualified) {
                        return "Level 1 frontline seat. 100% P2P pass-through to matrix sponsor ($30.00 USD). Frontline seats qualify you for 100% Level 2 and Level 3 income.";
                      }
                      const up1 = profile?.sponsorAddress || data?.sponsorAddress;
                      const up1Fmt = up1 ? formatAddress(toTrobBase58(up1)) : "Protocol Vault";
                      const up1Directs = profile?.upline1DirectsCount ?? 0;
                      return `⚠️ Upline 1 Pass-Up Fallback: Level 1 frontline pass-up routes to Upline 1 (${up1Fmt}). Because Upline 1 has fewer than 2 active direct referrals on-chain (${up1Directs}/2 Directs), this $30 settlement was automatically directed to the 4 Community Protocol Pools (Vault).`;
                    }
                    if (selectedNodeModal.pos === 2) {
                      if (profile?.isUpline2Qualified) {
                        return "Level 1 frontline seat. 100% P2P pass-through routes to upline 2 ($30.00 USD). Frontline seats satisfy your 2-direct qualification.";
                      }
                      return "⚠️ Upline 2 Pass-Up Fallback: Upline 2 is either unqualified (< 2 directs) or apex protocol root. This $30 settlement was automatically directed to the 4 Community Protocol Pools (Vault).";
                    }
                    return selectedNodeModal.desc;
                  })()}
                </p>
              </div>

              {getNodeInfo(selectedNodeModal.pos).filled ? (() => {
                const nodeInfo = getNodeInfo(selectedNodeModal.pos);
                const vaultB58 = toTrobBase58(CONTRACT_ADDRESSES.vault);
                const userB58 = address ? toTrobBase58(address) : "";
                const onChainRecip = nodeInfo.recipientAddress ? toTrobBase58(nodeInfo.recipientAddress) : null;
                const isVault = !onChainRecip || onChainRecip === vaultB58 || onChainRecip.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase();

                let recipientLabel = "YOU (Direct P2P Settlement)";
                let recipientWallet = userB58 || vaultB58;

                if (isVault) {
                  recipientLabel = "4 Protocol Pools (Vault)";
                  recipientWallet = vaultB58;
                } else if (userB58 && onChainRecip === userB58) {
                  recipientLabel = "YOU (Matrix Owner — 100% Direct P2P)";
                  recipientWallet = userB58;
                } else if (selectedNodeModal.pos === 1) {
                  recipientLabel = "Upline 1 (Level 1 Pass-Up)";
                  recipientWallet = onChainRecip;
                } else if (selectedNodeModal.pos === 2) {
                  recipientLabel = "Upline 2 (Level 1 Pass-Up)";
                  recipientWallet = onChainRecip;
                } else if (selectedNodeModal.pos === 7) {
                  recipientLabel = "Downline 1 (Spillover P2P)";
                  recipientWallet = onChainRecip;
                } else if (selectedNodeModal.pos === 10) {
                  recipientLabel = "Downline 2 (Spillover P2P)";
                  recipientWallet = onChainRecip;
                } else {
                  recipientLabel = "Settlement Recipient";
                  recipientWallet = onChainRecip;
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
                          {nodeInfo.label || "Available Position"}
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
                        $30.00 USD (100% On-Chain)
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
      {/* P4/P5 Auto-Escalation Unlock Celebration Modal */}
      <SlotUnlockedCelebrationModal
        isOpen={celebrationModalOpen}
        onClose={handleCloseCelebrationModal}
        unlockedSlot={celebrationUnlockedSlot}
        completedSlot={celebrationUnlockedSlot - 1}
        onNavigateToSlot={handleNavigateCelebratedSlot}
      />
    </div>
  );
}
