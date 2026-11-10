"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { searchOperativeOnChain, EXPLORER_URL } from "@/lib/contracts";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { useMatrixStore } from "@/lib/stores";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import {
  Search,
  X,
  Layers,
  Network,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  User,
  LayoutDashboard,
  Users,
  Settings,
  Receipt,
  Gift,
  Award,
  Crown,
  Loader2,
  CornerDownLeft,
} from "lucide-react";

export type SearchCategory =
  | "OPERATIVE"
  | "SLOT"
  | "CYCLE"
  | "POOL"
  | "VIEW"
  | "TRANSACTION";

export interface SearchResultItem {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface HeaderSearchBarProps {
  className?: string;
}

export function HeaderSearchBar({ className = "" }: HeaderSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [onChainResult, setOnChainResult] = useState<SearchResultItem | null>(null);
  const [isSearchingOnChain, setIsSearchingOnChain] = useState(false);

  const { changeAddress } = useMatrixUser();
  const directMembers = useMatrixStore((s) => s.directMembers);
  const selectedSlotNumber = useMatrixStore((s) => s.selectedSlotNumber);
  const dashboard = useMatrixStore((s) => s.dashboard);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current && document.activeElement !== mobileInputRef.current) {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setMobileModalOpen(true);
        } else {
          inputRef.current?.focus();
          setIsOpen(true);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setMobileModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Base catalog of searchable actions, slots, cycles, pools, and navigation
  const staticCatalog: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. App Views & Navigation
    items.push(
      {
        id: "view-overview",
        category: "VIEW",
        title: "Network Overview",
        subtitle: "Personal matrix performance, direct referrals, and rank progress",
        badge: "Overview",
        icon: <LayoutDashboard className="w-4 h-4 text-blue-600" />,
        keywords: ["overview", "dashboard", "home", "stats", "performance"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "overview" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "view-tree",
        category: "VIEW",
        title: "Matrix Tree Visualizer",
        subtitle: "14-Seat dual-tier binary network board & live placements",
        badge: "Matrix Tree",
        icon: <Network className="w-4 h-4 text-indigo-600" />,
        keywords: ["tree", "matrix", "board", "nodes", "graph", "seats", "14"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "matrix" }));
            window.dispatchEvent(new CustomEvent("equora_switch_viewmode", { detail: "tree" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "view-directs",
        category: "VIEW",
        title: "Direct Partners Directory",
        subtitle: "Your direct referral team members, active slots, and volume",
        badge: "Team",
        icon: <Users className="w-4 h-4 text-emerald-600" />,
        keywords: ["directs", "referrals", "team", "partners", "downline", "members"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "matrix" }));
            window.dispatchEvent(new CustomEvent("equora_switch_viewmode", { detail: "directs" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "view-pools",
        category: "VIEW",
        title: "The 4 Protocol Pools",
        subtitle: "Instant Push (35%), Leadership Royalty (40%), Blind Box (10%), Milestones (15%)",
        badge: "Pools",
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        keywords: ["pools", "protocol", "dao", "royalty", "blindbox", "milestones", "dividends"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "pools" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "view-transactions",
        category: "VIEW",
        title: "Transaction Audit Ledger",
        subtitle: "On-chain settlements, auto-escalations, and royalty disbursements",
        badge: "Ledger",
        icon: <Receipt className="w-4 h-4 text-slate-600" />,
        keywords: ["transactions", "tx", "history", "audit", "ledger", "receipts"],
        action: () => {
          router.push("/transactions");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "view-settings",
        category: "VIEW",
        title: "Settings & Wallet Security",
        subtitle: "Manage connected TrobSafe wallet, referral links, and preferences",
        badge: "Settings",
        icon: <Settings className="w-4 h-4 text-slate-600" />,
        keywords: ["settings", "profile", "account", "security", "wallet"],
        action: () => {
          router.push("/settings");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      }
    );

    // 2. All 12 Matrix Slots
    for (let s = 1; s <= 12; s++) {
      const costUsd = 30 * Math.pow(2, s - 1);
      items.push({
        id: `slot-${s}`,
        category: "SLOT",
        title: `Matrix Slot #${s.toString().padStart(2, "0")}`,
        subtitle: `$${costUsd.toLocaleString()} USD Board • 14 Seats P2P Settlement Engine`,
        badge: `Slot ${s}`,
        icon: <Network className="w-4 h-4 text-blue-600" />,
        keywords: [
          `slot ${s}`,
          `slot${s}`,
          `s${s}`,
          `level ${s}`,
          `tier ${s}`,
          `$${costUsd}`,
          `${costUsd} usd`,
        ],
        action: () => {
          useMatrixStore.setState({ selectedSlotNumber: s });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "matrix" }));
            window.dispatchEvent(new CustomEvent("equora_select_slot", { detail: s }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
          toast.success("Slot Selected", `Switched to Slot #${s.toString().padStart(2, "0")} ($${costUsd.toLocaleString()} USD)`);
        },
      });
    }

    // 3. Infinite Multi-Cycle Quick Navigation
    items.push(
      {
        id: "cycle-live",
        category: "CYCLE",
        title: "Active Live Cycle Board",
        subtitle: "View current active cycle positions and ongoing P2P settlements",
        badge: "Live Cycle",
        icon: <RotateCcw className="w-4 h-4 text-blue-600" />,
        keywords: ["active cycle", "current cycle", "live cycle", "cycle active"],
        action: () => {
          const totalC = (dashboard?.activeSlotProgress as any)?.totalCycles || 1;
          useMatrixStore.setState({ selectedCycle: totalC });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "matrix" }));
            window.dispatchEvent(new CustomEvent("equora_select_cycle", { detail: totalC }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
          toast.info("Cycle Switched", `Viewing Live Cycle #${totalC}`);
        },
      },
      {
        id: "cycle-snapshot-1",
        category: "CYCLE",
        title: "Cycle #1 Fulfilled Archive",
        subtitle: "Inspect historical 14/14 settled nodes snapshot and P2P payouts",
        badge: "Cycle 1 Snapshot",
        icon: <RotateCcw className="w-4 h-4 text-emerald-600" />,
        keywords: ["cycle 1", "c1", "snapshot 1", "cycle snapshot", "history", "fulfilled"],
        action: () => {
          useMatrixStore.setState({ selectedCycle: 1 });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "matrix" }));
            window.dispatchEvent(new CustomEvent("equora_select_cycle", { detail: 1 }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
          toast.info("Snapshot Loaded", "Viewing Archived Snapshot of Cycle #1 (14/14 Fulfilled)");
        },
      }
    );

    // 4. The 4 Protocol Pools
    items.push(
      {
        id: "pool-dao",
        category: "POOL",
        title: "Pool 01: DAO Instant Push (35%)",
        subtitle: "Instant per-placement liquidity stream to Genesis Council wallets",
        badge: "35% Share",
        icon: <Layers className="w-4 h-4 text-blue-600" />,
        keywords: ["dao", "instant push", "dao pool", "pool 1", "council", "35%"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "pools" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "pool-salary",
        category: "POOL",
        title: "Pool 02: Leadership Royalty (40%)",
        subtitle: "Monthly equity dividend distributed on 11th across Alpha, Prime, Elite, Crown",
        badge: "40% Share",
        icon: <Award className="w-4 h-4 text-indigo-600" />,
        keywords: ["leadership", "royalty", "salary", "pool 2", "11th", "monthly", "40%"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "pools" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "pool-magicbox",
        category: "POOL",
        title: "Pool 03: Magic Blind Box (10%)",
        subtitle: "Quarterly random reward distributed to active operatives • Tap to claim video",
        badge: "10% Share",
        icon: <Gift className="w-4 h-4 text-purple-600" />,
        keywords: ["magic box", "blind box", "pool 3", "quarterly", "claim", "gift", "10%"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "pools" }));
            window.dispatchEvent(new CustomEvent("equora_open_blindbox_modal", {}));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      },
      {
        id: "pool-rewards",
        category: "POOL",
        title: "Pool 04: Rank Milestone Bounties (15%)",
        subtitle: "Apex rank progression bounty distributed on 21st monthly",
        badge: "15% Share",
        icon: <Crown className="w-4 h-4 text-amber-600" />,
        keywords: ["rank", "milestone", "bounty", "pool 4", "apex", "21st", "15%"],
        action: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("equora_switch_tab", { detail: "pools" }));
          }
          router.push("/dashboard");
          setIsOpen(false);
          setMobileModalOpen(false);
        },
      }
    );

    // 5. Direct Members list from store
    if (Array.isArray(directMembers)) {
      directMembers.forEach((dm) => {
        items.push({
          id: `operative-${dm.address}`,
          category: "OPERATIVE",
          title: dm.username ? `${dm.username} • #${dm.userId}` : `Operative #${dm.userId}`,
          subtitle: `Wallet: ${formatAddress(toTrobBase58(dm.address))} • ${dm.activeSlots || 1} Active Slots`,
          badge: `#${dm.userId}`,
          icon: <User className="w-4 h-4 text-emerald-600" />,
          keywords: [
            dm.address.toLowerCase(),
            toTrobBase58(dm.address).toLowerCase(),
            String(dm.userId),
            `#${dm.userId}`,
            (dm.username || "").toLowerCase(),
          ],
          action: () => {
            window.open(`https://trobscan.com/address/${toTrobBase58(dm.address)}`, "_blank", "noopener,noreferrer");
            toast.info("Member Ledger Verified", `Viewing on-chain ledger for Operative #${dm.userId} (${formatAddress(toTrobBase58(dm.address))})`);
            setIsOpen(false);
            setMobileModalOpen(false);
          },
        });
      });
    }

    return items;
  }, [directMembers, dashboard, router, changeAddress]);

  // Fuzzy scoring algorithm: matches prefixes, contains, word boundaries, and character sequences
  const fuzzyMatchScore = (q: string, target: string, keywords: string[] = []): number => {
    const qLower = q.toLowerCase().trim();
    if (!qLower) return 0;
    const tLower = target.toLowerCase();

    // Exact match
    if (tLower === qLower) return 100;
    // Prefix match
    if (tLower.startsWith(qLower)) return 85;
    // Word boundary match
    if (tLower.includes(" " + qLower)) return 75;
    // Substring match
    if (tLower.includes(qLower)) return 60;

    // Check keywords
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === qLower) return 95;
      if (kwLower.startsWith(qLower)) return 80;
      if (kwLower.includes(qLower)) return 55;
    }

    // Sequence character match
    let score = 0;
    let tIdx = 0;
    for (let i = 0; i < qLower.length; i++) {
      const char = qLower[i];
      const foundIdx = tLower.indexOf(char, tIdx);
      if (foundIdx === -1) return 0;
      score += (foundIdx === tIdx ? 4 : 1);
      tIdx = foundIdx + 1;
    }
    return score;
  };

  // Filtered and sorted results based on query
  const filteredResults = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Default: show quick navigation, slots, and pools
      return staticCatalog.slice(0, 8);
    }

    const scored = staticCatalog
      .map((item) => {
        const score = Math.max(
          fuzzyMatchScore(q, item.title, item.keywords),
          fuzzyMatchScore(q, item.subtitle, item.keywords) * 0.8
        );
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    // If on-chain search result exists and matches query, prepend it
    if (onChainResult) {
      return [onChainResult, ...scored];
    }

    return scored;
  }, [query, staticCatalog, onChainResult]);

  // Debounced on-chain search for wallet addresses, tx hashes, or numeric codes
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 3) {
      setOnChainResult(null);
      setIsSearchingOnChain(false);
      return;
    }

    const isTx = (q.startsWith("0x") && q.length === 66) || (!q.startsWith("0x") && q.length === 64 && /^[0-9a-fA-F]+$/.test(q));
    const isAddress = (q.startsWith("T") && q.length >= 10) || (q.startsWith("0x") && q.length >= 10);
    const isCode = /^\d{3,6}$/.test(q.replace(/^#/, ""));

    if (!isTx && !isAddress && !isCode) {
      setOnChainResult(null);
      return;
    }

    setIsSearchingOnChain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchOperativeOnChain(q);
        if (res.found) {
          if (res.type === "tx" && res.txUrl) {
            setOnChainResult({
              id: `tx-${q}`,
              category: "TRANSACTION",
              title: `Transaction: ${q.slice(0, 10)}...${q.slice(-8)}`,
              subtitle: "Open transaction record on TrobChain Block Explorer",
              badge: "Tx Hash",
              icon: <ExternalLink className="w-4 h-4 text-blue-600" />,
              action: () => {
                window.open(res.txUrl, "_blank", "noopener,noreferrer");
                setIsOpen(false);
                setMobileModalOpen(false);
              },
            });
          } else if (res.address) {
            setOnChainResult({
              id: `chain-op-${res.address}`,
              category: "OPERATIVE",
              title: res.referralCode ? `Operative #${res.referralCode}` : `Operative ${formatAddress(toTrobBase58(res.address))}`,
              subtitle: res.message || `Wallet: ${toTrobBase58(res.address)} (Verified On-Chain)`,
              badge: res.referralCode ? `#${res.referralCode}` : "On-Chain",
              icon: <User className="w-4 h-4 text-emerald-600" />,
              action: () => {
                window.open(`https://trobscan.com/address/${toTrobBase58(res.address!)}`, "_blank", "noopener,noreferrer");
                toast.info("Member Ledger Verified", `Viewing public on-chain ledger for ${formatAddress(toTrobBase58(res.address!))}`);
                setIsOpen(false);
                setMobileModalOpen(false);
              },
            });
          }
        } else {
          setOnChainResult(null);
        }
      } catch (err) {
        setOnChainResult(null);
      } finally {
        setIsSearchingOnChain(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, changeAddress]);

  // Handle keyboard arrow navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && filteredResults.length > 0) {
      setIsOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    }
  };

  const getCategoryBadgeClass = (category: SearchCategory) => {
    switch (category) {
      case "OPERATIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SLOT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CYCLE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "POOL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "VIEW":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "TRANSACTION":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <>
      {/* ── DESKTOP FUZZY SEARCH BAR ────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`hidden lg:flex relative items-center ${className
          .replace(/\b(hidden|flex|inline-flex|block)\b/g, "")
          .trim()}`}
      >
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search slots, cycles, pools, operatives, tx..."
            className="w-full h-[38px] pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
          />

          {isSearchingOnChain ? (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOnChainResult(null);
                setIsOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 px-1.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-400 shadow-2xs pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Desktop Dropdown Floating Results */}
        {isOpen && (
          <div className="absolute top-[44px] left-0 right-0 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-fade-in max-h-[440px] flex flex-col">
            <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-bold px-3 bg-slate-50/60">
              <span>{query ? `Results for "${query}"` : "Quick Navigation & Slots"}</span>
              <span className="flex items-center gap-1">
                <span>Navigate</span>
                <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px]">↑↓</kbd>
                <span>Select</span>
                <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px]">↵</kbd>
              </span>
            </div>

            <div className="overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-50">
              {filteredResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No matching results found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching for a slot number (e.g. "Slot 2"), cycle ("Cycle 1"), wallet, or pool name.</p>
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected ? "bg-blue-50/80 text-blue-950" : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-slate-900 truncate">
                              {item.title}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase border ${getCategoryBadgeClass(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {item.badge && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-300"}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE SEARCH TRIGGER BUTTON (Visible on Small Screens) ────── */}
      <button
        type="button"
        onClick={() => setMobileModalOpen(true)}
        className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Open search palette"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* ── MOBILE FULL-SCREEN SEARCH MODAL OVERLAY ─────────────────────── */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in p-3 pt-12">
          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            {/* Header / Input */}
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search slots, cycles, pools, operatives, tx..."
                className="w-full text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Results Scrollable */}
            <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">No matching results found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try searching for a slot (e.g. "Slot 1"), cycle, pool, or wallet.</p>
                </div>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-blue-50/80 active:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-slate-900 truncate">
                            {item.title}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${getCategoryBadgeClass(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
