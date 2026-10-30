"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MatrixStats,
  MatrixViewSwitcher,
  MatrixLevelView,
  MatrixListView,
  MatrixTreeView,
  MatrixPositionDetails,
  MatrixDirectMembers,
  MatrixAccessGate,
} from "@/components/matrix";
import { ReferralLinkCard } from "@/components/dashboard";
import {
  WalletConnectModal,
  WalletDropdown,
  EquoraLogoLoader,
  HeaderSearchBar,
  ProtocolNotificationsModal,
} from "@/components/common";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { matrixApi } from "@/lib/api";
import { getOnChainDirectMembers } from "@/lib/contracts";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58 } from "@/lib/format";

export default function MatrixPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"matrix" | "list" | "level">("level");
  const [directMembers, setDirectMembers] = useState<any[]>([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    address,
    changeAddress,
    disconnect,
    slots,
    selectedSlotNumber,
    slotDetails,
    profile,
    loadSlot,
    buySlot,
    loading,
  } = useMatrixUser();

  React.useEffect(() => {
    if (address) {
      getOnChainDirectMembers(address)
        .then((members) => {
          if (members && members.length > 0) {
            setDirectMembers(members);
          } else {
            matrixApi.getDirectMembers(address).then(setDirectMembers).catch(() => {});
          }
        })
        .catch(() => {
          matrixApi.getDirectMembers(address).then(setDirectMembers).catch(() => {});
        });
    }
  }, [address]);

  if (!mounted || (loading && (!slots || slots.length === 0))) {
    return (
      <MatrixAccessGate>
        <EquoraLogoLoader
          message="Loading Matrix Grid..."
          submessage="Querying 14-node slots and cycle tree from smart contract..."
        />
      </MatrixAccessGate>
    );
  }

  const handleOpenBuyModal = (slotNum: number) => {
    loadSlot(slotNum);
    toast.info(
      "Automated Progression ($0 Out-of-Pocket)",
      `Slot #${slotNum} auto-unlocks when Nodes 4 & 5 fill in Slot #${Math.max(1, slotNum - 1)}.`
    );
  };

  const handleCopy = (text: string) => {
    toast.copy(toTrobBase58(text), "Wallet Address");
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
      active: true,
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
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 8h15M6.5 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 16.5v-6h3v6M8.5 16.5V5.5h3v11M12 16.5v-4h3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 16.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Transactions",
      href: "/transactions",
      active: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3.5 7h12l-3-3M16.5 13h-12l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <path d="M3.5 17c0-2.5 3-4.5 6.5-4.5s6.5 2 6.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased selection:bg-blue-600 selection:text-white flex">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MOBILE DRAWER / SIDEBAR OVERLAY                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR (Desktop Fixed, Mobile Slide-Over)                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-[#e8ecf1] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo */}
          <Link href="/" className="px-6 pt-6 pb-5 flex items-center gap-3 group">
            <div className="flex items-center justify-center flex-shrink-0">
              <Image
                src="/new-logo.png"
                alt="EQUORA.FI Logo"
                width={36}
                height={36}
                className="w-[34px] h-[34px] object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-black text-[#0f172a] tracking-tight">EQUORA_FI</span>
              <span className="text-[10px] font-bold text-[#2563eb] tracking-[0.14em] uppercase">MATRIX</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="px-3.5 mt-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all ${
                  item.active
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${item.active ? "text-[#2563eb]" : "text-[#64748b]"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Promotional Card */}
        <div className="px-4 pb-5">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e40af] p-4 text-white shadow-lg shadow-blue-500/10">
            <div className="flex items-start justify-between mb-4">
              {/* Hexagon wireframe circle icon */}
              <div className="w-[36px] h-[36px] rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              {/* Up-Right Arrow Circle */}
              <div className="w-[28px] h-[28px] rounded-full bg-[#3b82f6] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-white text-[13.5px] font-extrabold leading-snug">
              A Stronger Tomorrow,<br />Built Together.
            </p>
            <div className="mt-4 pt-1">
              <div className="text-[10px] font-extrabold text-white/95 tracking-wider uppercase">EQUORAFI DAO</div>
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* DESKTOP TOP HEADER (>= lg)                                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-[#e8ecf1] px-8 h-[64px] items-center justify-between">
          {/* Robust On-Chain Search Bar (Wallet, Member ID, Tx Hash) */}
          <HeaderSearchBar className="w-full max-w-[200px] xl:max-w-[360px]" />

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Protocol Live Badge */}
            <div
              onClick={() => toast.info("Protocol Live", "Matrix smart contracts are operational and syncing blocks in real time.")}
              className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] text-[#16a34a] text-[12px] font-bold cursor-pointer hover:bg-emerald-100/50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              <span>Protocol Live</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative w-[38px] h-[38px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-[#ef4444] rounded-full border-2 border-white" />
            </button>

            {/* Wallet Dropdown & Account Switcher */}
            <WalletDropdown />

            {/* User 3D Avatar Sphere */}
            <Link href="/profile" title="View Profile" className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all rounded-full flex-shrink-0">
              <div className="w-[36px] h-[36px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#60a5fa,#2563eb_65%,#1e3a8a_100%)] shadow-md shadow-blue-500/20" />
            </Link>
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* MOBILE HEADER (< lg)                                          */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="lg:hidden bg-white border-b border-[#e8ecf1]">
          {/* Mobile Main Header */}
          <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 -ml-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] flex-shrink-0"
                aria-label="Open navigation sidebar"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>

              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-xl border border-[#e2e8f0] bg-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Image
                    src="/new-logo.png"
                    alt="EQUORA_FI"
                    width={28}
                    height={28}
                    className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[13.5px] sm:text-[14px] font-black text-[#0f172a] tracking-tight">EQUORA_FI</span>
                  <span className="text-[9px] sm:text-[9.5px] font-bold text-[#2563eb] tracking-[0.14em] uppercase">MATRIX</span>
                </div>
              </Link>
            </div>

            {/* Right Controls: Wallet & Account Switcher */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <WalletDropdown />
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 max-w-[1400px] w-full mx-auto min-w-0 space-y-4">
          {/* ═══════════ PAGE TITLE & TOP STATS ROW ═══════════ */}
          <MatrixStats
            slots={slots}
            selectedSlotNumber={selectedSlotNumber}
            onSelectSlot={loadSlot}
            onBuySlot={handleOpenBuyModal}
            profile={profile}
          />

          {/* Unified On-Chain Referral & Affiliate Link */}
          <div>
            <ReferralLinkCard
              address={address}
              directsCount={profile?.directReferralsCount ?? 0}
              sponsorAddress={profile?.sponsorAddress}
              upline2Address={profile?.upline2Address}
              isQualified={profile?.isQualified ?? (profile?.directReferralsCount ?? 0) >= 2}
            />
          </div>

          {/* ═══════════ VIEW SWITCHER TABS ═══════════ */}
          <MatrixViewSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* ═══════════ MAIN TWO-COLUMN SECTION (Desktop) / STACKED (Mobile) ═══════════ */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 mb-5 items-start">
            {/* ──────── LEFT CARD: LEVEL VIEW, LIST VIEW, or MATRIX VIEW ──────── */}
            {activeTab === "level" ? (
              <MatrixLevelView
                onSelectSlot={loadSlot}
                selectedSlotNumber={selectedSlotNumber}
                slots={slots}
                onBuySlot={handleOpenBuyModal}
              />
            ) : activeTab === "list" ? (
              <MatrixListView
                handleCopy={handleCopy}
                slotDetails={slotDetails}
                selectedSlotNumber={selectedSlotNumber}
                slots={slots}
              />
            ) : (
              <MatrixTreeView
                slotDetails={slotDetails}
                selectedSlotNumber={selectedSlotNumber}
                slots={slots}
              />
            )}

            {/* ──────── RIGHT CARD: POSITION DETAILS (Desktop) / NODE 1 (Mobile) ──────── */}
            <MatrixPositionDetails
              handleCopy={handleCopy}
              onBuySlot={handleOpenBuyModal}
              slotDetails={slotDetails}
              selectedSlotNumber={selectedSlotNumber}
              address={address}
            />
          </div>

          {/* ═══════════ DIRECT MEMBERS (LEVEL 1) SECTION ═══════════ */}
          <MatrixDirectMembers handleCopy={handleCopy} members={directMembers} />
        </main>


        {/* Wallet Connection & Switcher Modal */}
        <WalletConnectModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          currentAddress={address || undefined}
          onSelectAddress={changeAddress}
          onDisconnect={disconnect}
        />

        {/* Live Protocol Notifications Drawer / Modal */}
        <ProtocolNotificationsModal
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
      </div>
    </div>
    </MatrixAccessGate>
  );
}
