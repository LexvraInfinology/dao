"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  EarningsHeader,
  EarningsStatsGrid,
  EarningsOverviewChart,
  EarningsBreakdownChart,
  RecentPayoutsTable,
  WithdrawModal,
} from "@/components/earnings";
import { MatrixAccessGate } from "@/components/matrix";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { WalletDropdown } from "@/components/common/WalletDropdown";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { useFinanceStore } from "@/lib/stores";
import { toast } from "@/lib/toast";
import { NETWORK_NAME } from "@/lib/contracts";
import { formatAddress, toTrobBase58 } from "@/lib/format";

export default function EarningsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { address, changeAddress, refreshAll } = useMatrixUser();
  const earnings = useFinanceStore((s) => s.earnings);
  const fetchEarnings = useFinanceStore((s) => s.fetchEarnings);

  React.useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings, address]);

  const handleCopyWallet = () => {
    if (address) {
      toast.copy(toTrobBase58(address), "Wallet Address");
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "Matrix",
      href: "/matrix",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="4.5" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="15.5" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 7v3M10 10l-4 2.5M10 10l4 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Earnings",
      href: "/earnings",
      active: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2.5 8.5h15M13.5 12h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3.5 17h13M5.5 17V9.5h3V17M8.5 17V5.5h3V17M11.5 17V7.5h3V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Transactions",
      href: "/transactions",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3.5 7h13l-3-3M16.5 13h-13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.5 17.5c0-2.5 3-4.5 6.5-4.5s6.5 2 6.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      active: false,
      icon: <Image src="/settings-icon.png" alt="Settings" width={20} height={20} className="w-5 h-5 object-contain" />,
    },
  ];

  return (
    <MatrixAccessGate>
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans flex flex-col lg:flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-[#e8ecf1] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="px-6 pt-6 pb-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center flex-shrink-0">
                <Image
                  src="/new-logo.png"
                  alt="EQUORA.FI"
                  width={100}
                  height={100}
                  className="w-[36px] h-[36px] object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-extrabold text-[#0f172a] tracking-tight">EQUORA_FI</span>
                <span className="text-[10px] font-bold text-[#2563eb] tracking-[0.14em] uppercase">MATRIX</span>
              </div>
            </Link>

            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-[10.5px] rounded-xl text-[13.5px] font-semibold transition-all cursor-pointer ${
                  item.active
                    ? "bg-[#edf5ff] text-[#2563eb]"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                }`}
              >
                <span
                  className={`w-5 h-5 flex items-center justify-center ${
                    item.active ? "text-[#2563eb]" : "text-[#94a3b8]"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-4 pb-5">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b44b8] via-[#1a3fa6] to-[#0d1e4c] p-4 shadow-sm text-white">
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-[34px] h-[34px] rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2l7 4v8l-7 4-7-4V6l7-4z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M10 2v16M3 6l14 8M17 6L3 14" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
                </svg>
              </div>
              <div className="w-[28px] h-[28px] rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center transition-colors cursor-pointer shadow-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <p className="text-white text-[13px] font-bold leading-[1.35] mb-3 relative z-10">
              A Stronger Tomorrow,<br />Built Together.
            </p>

            <div className="relative z-10 pt-1 border-t border-white/10">
              <div className="text-[10px] font-extrabold text-white/90 tracking-wider uppercase">EQUORAFI DAO</div>
              <a
                href={process.env.NEXT_PUBLIC_DAO_URL || "https://equorafidao.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-white/70 hover:text-white underline mt-0.5 transition-colors block"
              >
                Genesis DAO • {process.env.NEXT_PUBLIC_DAO_DOMAIN || "equorafidao.com"}
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* ── TOP HEADER ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e8ecf1] h-[60px] lg:h-[64px] px-4 lg:px-8 flex items-center justify-between gap-3">
          {/* Mobile Left: Hamburger + Brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="p-1.5 -ml-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] flex-shrink-0 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image
                src="/new-logo.png"
                alt="EQUORA.FI"
                width={64}
                height={64}
                className="w-[30px] h-[30px] object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="text-[13.5px] font-extrabold text-[#0f172a] tracking-tight">EQUORA_FI</span>
                <span className="text-[8.5px] font-bold text-[#2563eb] tracking-[0.14em] uppercase">MATRIX</span>
              </div>
            </Link>
          </div>

          {/* Desktop Left: Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-[#94a3b8] text-[13px] font-medium">
            <span className="text-[#0f172a] font-bold">EQUORA_FI</span>
            <span>/</span>
            <span className="text-[#2563eb] font-semibold">Earnings</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div
              onClick={() => toast.info(`${NETWORK_NAME} is operational and synced.`, "Protocol Live")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] cursor-pointer hover:bg-emerald-100/50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span className="text-[12px] font-semibold text-[#16a34a]">Protocol Live</span>
            </div>

            <button
              type="button"
              onClick={() => toast.info("You have no unread earnings alerts.", "Notifications")}
              className="hidden sm:flex relative w-[36px] h-[36px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] items-center justify-center hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2.5a5.5 5.5 0 00-5.5 5.5c0 4.5-2 5.5-2 5.5h15s-2-1-2-5.5a5.5 5.5 0 00-5.5-5.5zM11.5 16.5a1.5 1.5 0 01-3 0"
                  stroke="#64748b"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#ef4444] rounded-full border border-white" />
            </button>

            <WalletDropdown />

            <Link href="/profile" title="View Profile" className="hidden lg:flex w-[36px] h-[36px] rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
              <div className="w-full h-full rounded-full relative overflow-hidden" style={{ background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 35%, #1d4ed8 75%, #0f172a 100%)", boxShadow: "0 3px 6px -1px rgba(29,78,216,0.45), inset 0 2px 3px rgba(255,255,255,0.7), inset 0 -2px 3px rgba(0,0,0,0.4)" }}>
                <div className="absolute top-1 left-2 w-2 h-1.5 rounded-full bg-white/40 blur-[0.5px] transform -rotate-12" />
              </div>
            </Link>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 min-w-0">
          {/* ═══════════ HEADER: TITLE & DATE SELECTOR ═══════════ */}
          <EarningsHeader />

          {/* ═══════════ TOP 4 STAT CARDS ═══════════ */}
          <EarningsStatsGrid
            earnings={earnings}
            onWithdrawClick={() => setWithdrawModalOpen(true)}
          />

          {/* ═══════════ MIDDLE SECTION: OVERVIEW (BAR CHART) & BREAKDOWN (DONUT) ═══════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            <EarningsOverviewChart />
            <EarningsBreakdownChart />
          </div>

          {/* ═══════════ RECENT TRANSACTIONS ═══════════ */}
          <RecentPayoutsTable payouts={earnings?.recentPayouts} />
        </main>
      </div>

      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        address={address || undefined}
        earnings={earnings}
        onSuccess={() => {
          refreshAll(true, true);
        }}
      />

      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentAddress={address}
        onSelectAddress={(addr) => {
          changeAddress(addr);
          setWalletModalOpen(false);
        }}
      />
      </div>
    </MatrixAccessGate>
  );
}
