'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    subtitle: 'SBT proof of membership, 500% earnings cap & governance access',
    url: '/dao/lounge',
    keywords: ['lounge', 'sbt', 'nft', 'cap', '500%', 'governance', 'dividends', 'vote'],
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

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

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

      {/* ── Mobile Search Button (visible on small screens <lg) ─────── */}
      <button
        onClick={() => setMobileModalOpen(true)}
        className="lg:hidden w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-[#60739A] hover:text-[#071A4A] flex items-center justify-center transition-all shadow-xs"
        aria-label="Open search"
      >
        <Search className="w-3.5 h-3.5 text-[#17334F]" />
      </button>

      {/* ── Mobile Search Modal Overlay (Accessible on all mobile devices) ── */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col p-3 sm:p-6 font-sans animate-fadeIn">
          <div className="bg-white w-full max-w-lg mx-auto rounded-2xl border border-[#E2ECF9] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Input Header */}
            <div className="p-3 border-b border-[#E7EEF8] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0E62E4] shrink-0" />
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
                className="flex-1 bg-transparent text-xs text-[#17334F] placeholder-[#4F6D87] focus:outline-none py-1"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setMobileModalOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                {query.trim() ? `Results for "${query}"` : 'Quick Navigation Suggestions'}
              </div>
              {results.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching results found.
                </div>
              ) : (
                results.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left p-2.5 rounded-xl flex items-center gap-3 hover:bg-[#EFF6FF] transition-colors border border-transparent hover:border-[#0E62E4]/20"
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
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#14304A] truncate">{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4F6D87] truncate">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
