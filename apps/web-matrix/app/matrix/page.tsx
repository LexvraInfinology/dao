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
import { SlotPurchaseModal } from "@/components/matrix/SlotPurchaseModal";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { matrixApi } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function MatrixPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"matrix" | "list" | "level">("level");
  const [buyingSlot, setBuyingSlot] = useState(false);
  const [directMembers, setDirectMembers] = useState<any[]>([]);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [pendingSlotNumber, setPendingSlotNumber] = useState<number>(5);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
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
  } = useMatrixUser();

  React.useEffect(() => {
    if (address) {
      matrixApi.getDirectMembers(address).then(setDirectMembers).catch(() => {});
    }
  }, [address]);

  const handleOpenBuyModal = (slotNum: number) => {
    setPendingSlotNumber(slotNum);
    setPurchaseModalOpen(true);
  };

  const handleConfirmBuySlot = async (slotNum: number, txHash?: string) => {
    setBuyingSlot(true);
    try {
      await buySlot(slotNum, txHash);
    } finally {
      setBuyingSlot(false);
    }
  };

  const handleCopy = (text: string) => {
    toast.copy(text, "Wallet Address");
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
              <div className="text-[10px] font-extrabold text-white/95 tracking-wider uppercase">EQUORA_FI</div>
              <div className="text-[9px] text-white/65 mt-0.5">Genesis DAO • dao.equora.fi</div>
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
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("search") as HTMLInputElement)?.value;
              if (input?.trim()) {
                toast.info("Searching Ledger", `Querying operative/wallet: ${input.trim()}`);
              }
            }}
            className="relative w-full max-w-[200px] xl:max-w-[360px]"
          >
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              name="search"
              type="text"
              placeholder="Search member ID / wallet / transaction..."
              className="w-full h-[38px] pl-10 pr-9 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[12.5px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[11px] font-semibold text-[#94a3b8] hover:bg-[#e2e8f0] cursor-pointer"
            >
              /
            </button>
          </form>

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
              onClick={() => toast.info("Notifications", "You have no unread protocol alerts.")}
              className="relative w-[38px] h-[38px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-[#ef4444] rounded-full border-2 border-white" />
            </button>

            {/* Wallet Pill Button */}
            <button
              type="button"
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[12px] font-semibold text-[#334155] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              title="Click to connect or switch wallet"
            >
              {mounted && address ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-mono text-xs">
                    {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span className="font-semibold text-[#2563eb]">Connect Wallet</span>
                </>
              )}
            </button>

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
              <button
                type="button"
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e2e8f0] text-[10.5px] sm:text-[11px] font-semibold text-[#1e293b] cursor-pointer transition-colors"
                title="Click to connect or switch wallet"
              >
                {mounted && address ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="font-mono">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                    <span className="text-[9px] text-[#64748b]">▼</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] flex-shrink-0" />
                    <span className="font-semibold text-[#2563eb]">Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto min-w-0">
          {/* ═══════════ PAGE TITLE & TOP STATS ROW ═══════════ */}
          <MatrixStats
            slots={slots}
            selectedSlotNumber={selectedSlotNumber}
            onSelectSlot={loadSlot}
            onBuySlot={handleOpenBuyModal}
            profile={profile}
            buyingSlot={buyingSlot}
          />

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
              <MatrixListView handleCopy={handleCopy} />
            ) : (
              <MatrixTreeView slotDetails={slotDetails} selectedSlotNumber={selectedSlotNumber} slots={slots} />
            )}

            {/* ──────── RIGHT CARD: POSITION DETAILS (Desktop) / NODE 1 (Mobile) ──────── */}
            <MatrixPositionDetails handleCopy={handleCopy} onBuySlot={handleOpenBuyModal} />
          </div>

          {/* ═══════════ DIRECT MEMBERS (LEVEL 1) SECTION ═══════════ */}
          <MatrixDirectMembers handleCopy={handleCopy} members={directMembers} />
        </main>

        {/* Slot Purchase Confirmation Modal */}
        <SlotPurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          slotNumber={pendingSlotNumber}
          cost={
            slots.find((s) => s.slotNumber === pendingSlotNumber)?.cost ||
            10 * Math.pow(2, pendingSlotNumber - 1)
          }
          onConfirm={handleConfirmBuySlot}
        />

        {/* Wallet Connection & Switcher Modal */}
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
