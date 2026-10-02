'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Layers,
  Users,
  Trophy,
  Coins,
  ArrowLeftRight,
  User,
  Settings,
  Shield,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SearchItem {
  id: string;
  category: 'Pages' | 'Council Seats' | 'Protocol & Pools' | 'Transactions';
  title: string;
  subtitle: string;
  url: string;
  keywords: string[];
  icon: 'page' | 'seat' | 'pool' | 'tx';
}

const SEARCH_INDEX: SearchItem[] = [
  // Pages
  {
    id: 'page_matrix',
    category: 'Pages',
    title: 'Matrix Bridge',
    subtitle: 'Day 22 Retail Matrix launch, $30 Slot 1, and 14-Node Tree Graph',
    url: '/dao/matrix-bridge',
    keywords: ['matrix', 'retail', 'day 22', 'slot 1', 'spillover', 'tree', 'root', 'leader', '30'],
    icon: 'page',
  },
  {
    id: 'page_seats',
    category: 'Pages',
    title: 'Council Seats Grid',
    subtitle: '100 Genesis Council seats, real-time 300/N FIFO claim status',
    url: '/dao/seats',
    keywords: ['seats', 'council', 'queue', 'grid', 'claim', 'fifo', '100', 'membership'],
    icon: 'seat',
  },
  {
    id: 'page_lounge',
    category: 'Pages',
    title: 'Member Lounge',
    subtitle: 'SBT proof of membership, 5X Cap ($1,500 USD) & governance access',
    url: '/dao/lounge',
    keywords: ['lounge', 'sbt', 'nft', 'cap', '5x', '1500', 'retopup', 'governance', 'dividends', 'vote'],
    icon: 'page',
  },
  {
    id: 'page_treasury',
    category: 'Pages',
    title: 'Treasury & Pools',
    subtitle: 'Autonomous 4 Value Pools, 35% Matrix royalty stream & reserves',
    url: '/dao/treasury',
    keywords: ['treasury', 'pools', 'vault', '35%', 'value pools', 'royalties', 'salary', 'drops'],
    icon: 'pool',
  },
  {
    id: 'page_txs',
    category: 'Pages',
    title: 'Transactions & Ledger',
    subtitle: 'On-chain audit trails, instant cashbacks & dividend payout ledger',
    url: '/dao/transactions',
    keywords: ['transactions', 'tx', 'ledger', 'cashback', 'payout', 'inflow', 'audit', 'trob'],
    icon: 'tx',
  },
  {
    id: 'page_profile',
    category: 'Pages',
    title: 'Member Profile',
    subtitle: 'Connected wallet status, personal Council seat details & SBT token',
    url: '/dao/profile',
    keywords: ['profile', 'account', 'wallet', 'my seat', 'address', 'sbt'],
    icon: 'page',
  },
  {
    id: 'page_settings',
    category: 'Pages',
    title: 'Preferences & Settings',
    subtitle: 'Network RPC config, notification chimes & device security',
    url: '/dao/settings',
    keywords: ['settings', 'preferences', 'rpc', 'audio', 'sound', 'network', 'device'],
    icon: 'page',
  },

  // Council Seats Highlights
  {
    id: 'seat_1',
    category: 'Council Seats',
    title: 'Council Seat #1 (Genesis Apex)',
    subtitle: 'First DAO member — 100% instant refund ($300 back) & Root Matrix priority',
    url: '/dao/seats',
    keywords: ['seat 1', 'seat #1', '#1', 'first seat', 'apex', 'founder', 'root leader'],
    icon: 'seat',
  },
  {
    id: 'seat_2',
    category: 'Council Seats',
    title: 'Council Seat #2 (Active Member)',
    subtitle: 'Second DAO member — $150 instant cashback + 35% downstream pool share',
    url: '/dao/seats',
    keywords: ['seat 2', 'seat #2', '#2', 'active member', 'cashback 150', 'TFcipr'],
    icon: 'seat',
  },
  {
    id: 'seat_3_10',
    category: 'Council Seats',
    title: 'Council Seats #3–#10 (Priority Tier)',
    subtitle: 'Rapid cashbacks (300/N) & eligible for Root Matrix waterfall offer',
    url: '/dao/seats',
    keywords: ['seat 3', 'seat 4', 'seat 5', 'seat 10', 'priority tier', 'waterfall'],
    icon: 'seat',
  },
  {
    id: 'seats_available',
    category: 'Council Seats',
    title: 'Open Genesis Seats (98 Available)',
    subtitle: 'Claim your seat before the 100-member cap seals permanently',
    url: '/dao/seats',
    keywords: ['open seats', 'available', 'unclaimed', 'join dao', 'claim seat', '98'],
    icon: 'seat',
  },

  // Protocol & Pools
  {
    id: 'pool_35_dao',
    category: 'Protocol & Pools',
    title: '35% Genesis DAO Treasury Pool',
    subtitle: 'Perpetual downstream instant push from all global Matrix boards to DAO members',
    url: '/dao/treasury',
    keywords: ['35%', 'dao pool', 'instant push', 'matrix share', 'treasury pool', 'royalties'],
    icon: 'pool',
  },
  {
    id: 'pool_40_salary',
    category: 'Protocol & Pools',
    title: '40% Monthly Leader Salary Pool',
    subtitle: 'Automated recurring distributor incentive pool for top builders',
    url: '/dao/treasury',
    keywords: ['40%', 'salary', 'leader pool', 'monthly rewards', 'builder pool'],
    icon: 'pool',
  },
  {
    id: 'pool_10_magic',
    category: 'Protocol & Pools',
    title: '10% Magic Blind Box Pool',
    subtitle: 'Algorithmic surprise bonus distribution on node completions',
    url: '/dao/treasury',
    keywords: ['10%', 'blind box', 'magic box', 'surprise reward'],
    icon: 'pool',
  },
  {
    id: 'pool_15_drops',
    category: 'Protocol & Pools',
    title: '15% Lucky Drops Pool',
    subtitle: 'Randomized high-impact community community drops',
    url: '/dao/treasury',
    keywords: ['15%', 'lucky drops', 'community drops'],
    icon: 'pool',
  },
];

// Helper: Calculate fuzzy matching score
function fuzzyMatchScore(query: string, target: string, keywords: string[]): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = target.toLowerCase();

  // Exact match
  if (t === q) return 100;
  // Prefix match
  if (t.startsWith(q)) return 85;
  // Contains word
  if (t.includes(q)) return 70;

  // Keyword exact or prefix match
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (k === q) return 90;
    if (k.startsWith(q)) return 75;
    if (k.includes(q)) return 60;
  }

  // Character subsequence fuzzy match
  let qIdx = 0;
  let score = 0;
  let consecutive = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      qIdx++;
      consecutive++;
      score += 5 + consecutive * 2;
    } else {
      consecutive = 0;
    }
  }

  return qIdx === q.length ? Math.min(55, score) : 0;
}

export const DaoSearchBar: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when mobile modal is open
  useEffect(() => {
    if (mobileModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileModalOpen]);

  // Filter and score results
  const results = useMemo(() => {
    if (!query.trim()) {
      return SEARCH_INDEX.slice(0, 6); // Default top recommendations
    }

    const scored = SEARCH_INDEX.map((item) => {
      const score = Math.max(
        fuzzyMatchScore(query, item.title, item.keywords),
        fuzzyMatchScore(query, item.subtitle, item.keywords)
      );
      return { item, score };
    })
      .filter((res) => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);

    return scored;
  }, [query]);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setMobileModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Auto-focus mobile input when mobile modal opens
  useEffect(() => {
    if (mobileModalOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
  }, [mobileModalOpen]);

  // Listen for open-mobile-search event from drawer
  useEffect(() => {
    const handleOpen = () => setMobileModalOpen(true);
    window.addEventListener('open-mobile-search', handleOpen);
    return () => window.removeEventListener('open-mobile-search', handleOpen);
  }, []);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    setMobileModalOpen(false);
    setQuery('');
    router.push(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  return (
    <>
      {/* ── Desktop Search Bar (hidden on mobile, visible on lg+) ───── */}
      <div ref={containerRef} className="relative w-full min-w-[200px] max-w-[340px] hidden lg:block font-sans">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
          placeholder="Search seat / pool / member / page…"
          className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#EFF6FF] border border-[#0E62E4]/20 text-xs text-[#17334F] placeholder-[#4F6D87] focus:outline-none focus:border-[#0E62E4] focus:bg-white transition-all shadow-xs"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white border border-[#E2ECF9] text-[10px] text-[#94A3B8] font-mono shadow-xs select-none">
            /
          </div>
        )}

        {/* Desktop Results Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-2xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-2 animate-fadeIn max-h-[360px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  {query.trim() ? 'Matching Results' : 'Quick Suggestions'}
                </div>
                {results.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                      idx === selectedIndex ? 'bg-[#EFF6FF] text-[#0E62E4]' : 'hover:bg-slate-50 text-[#14304A]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
                      {item.icon === 'seat' ? (
                        <Users className="w-3.5 h-3.5" />
                      ) : item.icon === 'pool' ? (
                        <Coins className="w-3.5 h-3.5" />
                      ) : item.icon === 'tx' ? (
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      ) : (
                        <Layers className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{item.title}</span>
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#4F6D87] truncate">{item.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile Search Button (visible on tablet screens sm..lg, hidden on tiny mobile to save navbar space) ─────── */}
      <button
        onClick={() => setMobileModalOpen(true)}
        className="hidden sm:flex lg:hidden w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-[#60739A] hover:text-[#071A4A] items-center justify-center transition-all shadow-xs"
        aria-label="Open search"
      >
        <Search className="w-3.5 h-3.5 text-[#17334F]" />
      </button>

      {/* ── Mobile Search Modal Overlay (Portaled to document.body to escape header backdrop-filter) ── */}
      {mounted && mobileModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col p-3 sm:p-6 font-sans animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileModalOpen(false);
          }}
        >
          <div
            className="bg-white w-full max-w-lg mx-auto rounded-2xl border border-[#E2ECF9] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] my-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="p-3.5 border-b border-[#E7EEF8] flex items-center gap-2.5 bg-[#FAFBFD]">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search seats, pools, members, pages…"
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#17334F] placeholder-[#4F6D87] focus:outline-none py-1"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    mobileInputRef.current?.focus();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setMobileModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Results or Fallback Suggestions */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 overscroll-contain">
              {results.length > 0 ? (
                <>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>{query.trim() ? `Results for "${query}"` : 'Quick Navigation'}</span>
                    <span className="text-[10px] lowercase font-normal">{results.length} found</span>
                  </div>
                  {results.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors border ${
                        idx === selectedIndex
                          ? 'bg-[#EFF6FF] border-[#0E62E4]/30 text-[#0E62E4]'
                          : 'hover:bg-slate-50 border-transparent text-[#14304A]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
                        {item.icon === 'seat' ? (
                          <Users className="w-4 h-4" />
                        ) : item.icon === 'pool' ? (
                          <Coins className="w-4 h-4" />
                        ) : item.icon === 'tx' ? (
                          <ArrowLeftRight className="w-4 h-4" />
                        ) : (
                          <Layers className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold truncate">{item.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4F6D87] truncate mt-0.5">{item.subtitle}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </>
              ) : (
                /* Enhanced empty state when user types e.g. "jkk" */
                <div className="py-6 px-3 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#14304A]">
                      No matching results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-[11px] text-[#4F6D87] max-w-xs mx-auto">
                      Try searching with keywords like <strong>matrix</strong>, <strong>seat</strong>, <strong>pool</strong>, or jump directly below:
                    </p>
                  </div>
                  {/* Quick fallback action tiles */}
                  <div className="grid grid-cols-2 gap-2 text-left pt-2">
                    <button
                      onClick={() => handleSelect(SEARCH_INDEX[0])}
                      className="p-2.5 rounded-xl border border-[#E2EEF9] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#0E62E4]/30 transition-all text-xs flex flex-col gap-0.5"
                    >
                      <span className="font-bold text-[#14304A]">Matrix Bridge</span>
                      <span className="text-[10px] text-[#4F6D87]">Day 22 Retail Matrix & Tree</span>
                    </button>
                    <button
                      onClick={() => handleSelect(SEARCH_INDEX[1])}
                      className="p-2.5 rounded-xl border border-[#E2EEF9] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#0E62E4]/30 transition-all text-xs flex flex-col gap-0.5"
                    >
                      <span className="font-bold text-[#14304A]">Council Seats</span>
                      <span className="text-[10px] text-[#4F6D87]">100 Genesis Seats Queue</span>
                    </button>
                    <button
                      onClick={() => handleSelect(SEARCH_INDEX[3])}
                      className="p-2.5 rounded-xl border border-[#E2EEF9] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#0E62E4]/30 transition-all text-xs flex flex-col gap-0.5"
                    >
                      <span className="font-bold text-[#14304A]">Treasury Pools</span>
                      <span className="text-[10px] text-[#4F6D87]">35% Instant Push & Reserves</span>
                    </button>
                    <button
                      onClick={() => handleSelect(SEARCH_INDEX[2])}
                      className="p-2.5 rounded-xl border border-[#E2EEF9] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#0E62E4]/30 transition-all text-xs flex flex-col gap-0.5"
                    >
                      <span className="font-bold text-[#14304A]">Member Lounge</span>
                      <span className="text-[10px] text-[#4F6D87]">SBT Proof & Governance</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
