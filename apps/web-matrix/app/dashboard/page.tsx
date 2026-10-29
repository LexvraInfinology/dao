"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  WelcomeBanner,
  DashboardStats,
  MatrixTreePanel,
  NextPositionPanel,
  RecentActivityPanel,
  DashboardMobileCard,
  ProtocolPoolsPanel,
} from "@/components/dashboard";
import { ReferralLinkCard } from "@/components/dashboard/ReferralLinkCard";
import { MatrixAccessGate, MatrixQualificationAlert } from "@/components/matrix";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { WalletDropdown } from "@/components/common/WalletDropdown";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { matrixApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58 } from "@/lib/format";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { address, changeAddress, disconnect, dashboard, profile, refreshAll, loading } = useMatrixUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if ((q.startsWith("0x") && q.length === 42) || (q.startsWith("T") && q.length === 34)) {
      changeAddress(q);
      toast.success("Operative Loaded", `Inspecting wallet ${formatAddress(q)}`);
      setSearchQuery("");
    } else if (/^\d+$/.test(q)) {
      toast.info("Operative Search", `Looking up Operative #${q}...`);
    } else {
      toast.error("Invalid Input", "Please enter a valid TrobSafe wallet address or numeric operative ID.");
    }
  };


  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      active: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "Matrix",
      href: "/matrix",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="4" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6.5V10M10 10L4 11.5M10 10L16 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Earnings",
      href: "/earnings",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2v16M6 6h5.5a2.5 2.5 0 010 5H6M6 11h6.5a2.5 2.5 0 010 5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 17h14M5 17V9h3v8M8.5 17V5h3v12M12 17V7h3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Transactions",
      href: "/transactions",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 7h14l-3-3M17 13H3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <path d="M3 17.5c0-2.485 3.134-4.5 7-4.5s7 2.015 7 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      active: false,
      icon: (
        <Image
          src="/settings-icon.png"
          alt="Settings"
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
        />
      ),
    },
  ];

  return (
    <MatrixAccessGate>
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans flex antialiased">
      {/* ═══════════ MOBILE SIDEBAR OVERLAY ═══════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-white border-r border-[#e8ecf1] flex flex-col justify-between p-4 transition-transform duration-200 lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Sidebar Logo */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center flex-shrink-0">
                <Image
                  src="/new-logo.png"
                  alt="EQUORA.FI"
                  width={100}
                  height={100}
                  className="w-[32px] h-[32px] object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-extrabold text-[#0f172a] tracking-tight leading-none">
                  EQUORA_FI
                </span>
                <span className="text-[10px] font-bold text-[#2563eb] tracking-wider mt-0.5">
                  MATRIX
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="lg:hidden text-[#94a3b8] hover:text-[#0f172a]"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  item.active
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                }`}
              >
                <span className={item.active ? "text-[#2563eb]" : "text-[#64748b]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">→</span>
          </div>
          <p className="text-white text-[13px] font-bold leading-[1.35] mb-3">
            A Stronger Tomorrow,<br />Built Together.
          </p>
          <div className="border-t border-white/20 pt-2 text-[10.5px] text-blue-100 flex flex-col leading-tight">
            <div className="text-[10px] font-bold text-white/90 tracking-wide uppercase">EQUORAFI DAO</div>
            <a
              href={process.env.NEXT_PUBLIC_DAO_URL || "https://equorafidao.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-white/70 hover:text-white underline mt-0.5 transition-colors"
            >
              Genesis DAO • {process.env.NEXT_PUBLIC_DAO_DOMAIN || "equorafidao.com"}
            </a>
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT AREA ═══════════ */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* ═══════════ TOP HEADER ═══════════ */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e8ecf1] px-3 sm:px-4 lg:px-6 h-[60px] flex items-center justify-between gap-2 sm:gap-3">
          {/* Mobile Left: Hamburger + Logo */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              type="button"
              className="p-1.5 -ml-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="flex items-center justify-center flex-shrink-0">
                <Image
                  src="/new-logo.png"
                  alt="EQUORA.FI"
                  width={100}
                  height={100}
                  className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] object-contain"
                />
              </div>
              <span className="text-[13px] font-extrabold text-[#0f172a] tracking-tight whitespace-nowrap">EQUORA_FI</span>
            </Link>
          </div>

          {/* Search Bar - Desktop only */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-[240px] xl:max-w-[360px]">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member ID / wallet..."
                className="w-full h-[38px] pl-9 pr-9 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center cursor-pointer">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 4h7M4 2v7" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Header Section */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Protocol Live Badge */}
            <div
              onClick={() => toast.info("Protocol Live", "Matrix smart contracts are operational and syncing blocks in real time.")}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] cursor-pointer hover:bg-emerald-100/50 transition-colors"
            >
              <span className="text-[12px] font-semibold text-[#16a34a]">Protocol Live</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l2.5 2.5L9 4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => toast.info("Notifications", "You have no unread protocol alerts.")}
              className="hidden sm:flex relative w-[36px] h-[36px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] items-center justify-center hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 6.75a4.5 4.5 0 10-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5s-2.25-1.5-2.25-6.75M10.295 15.75a1.5 1.5 0 01-2.59 0" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#ef4444] rounded-full border border-white" />
            </button>

            {/* Professional Wallet Dropdown & Account Switcher */}
            <WalletDropdown />

            {/* Avatar */}
            <Link href="/profile" title="View Profile" className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all rounded-full flex-shrink-0">
              <div className="hidden sm:flex w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#2563eb] to-[#1e40af] items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : "OP"}
              </div>
            </Link>
          </div>
        </header>

        {/* ═══════════ DASHBOARD MAIN CONTENT ═══════════ */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto space-y-5">
          {/* Welcome Banner */}
          <WelcomeBanner />

          {/* Qualification Status & Direct Referrals Progress Alert */}
          <MatrixQualificationAlert
            isQualified={profile?.isQualified ?? false}
            activeDirectsCount={profile?.activeDirectsCount ?? profile?.directReferralsCount ?? 0}
            referralUrl={address ? `${typeof window !== "undefined" ? window.location.origin : "https://equorafi.com"}/?ref=${toTrobBase58(address)}` : undefined}
          />

          {/* Referral & Affiliate Link Card */}
          <ReferralLinkCard
            address={address}
            directsCount={profile?.directReferralsCount ?? 0}
            sponsorAddress={profile?.sponsorAddress}
            upline2Address={profile?.upline2Address}
          />

          {/* Stat Cards Row (Desktop + Mobile) */}
          <DashboardStats data={dashboard} />

          {/* MAIN DASHBOARD GRID: Matrix + Right Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_295px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-5 mb-6">
            <div className="min-w-0">
              <MatrixTreePanel data={dashboard} />
            </div>
            <div className="min-w-0">
              <NextPositionPanel data={dashboard} />
            </div>
          </div>

          {/* 4 CLOSED-LOOP PROTOCOL POOLS & GAMIFIED APEX LEVEL REWARDS */}
          <ProtocolPoolsPanel
            currentSlot={dashboard?.currentSlot ?? profile?.currentSlot ?? 1}
            isQualified={profile?.isQualified ?? false}
          />

          {/* RECENT ACTIVITY */}
          <RecentActivityPanel activities={dashboard?.recentActivity} />

          {/* MOBILE BOTTOM CARD */}
          <DashboardMobileCard />
        </main>

        {/* Safe Read-Only Wallet Connection & Test Account Modal */}
        <WalletConnectModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          currentAddress={address || undefined}
          onSelectAddress={changeAddress}
          onDisconnect={disconnect}
        />
      </div>
    </div>
    </MatrixAccessGate>
  );
}
