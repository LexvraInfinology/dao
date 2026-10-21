"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ProfileHeroCard,
  ProfileStatsGrid,
  PersonalInfoCard,
  WalletInfoCard,
} from "@/components/profile";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useMatrixUser } from "@/lib/useMatrixUser";
import { toast } from "@/lib/toast";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { address, changeAddress } = useMatrixUser();

  const copy = (t: string) => {
    toast.copy(t, "Wallet Address");
  };

  const navItems = [
    {
      label: "Dashboard", href: "/dashboard", active: false,
      icon: (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>),
    },
    {
      label: "Matrix", href: "/matrix", active: false,
      icon: (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="4.5" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="15.5" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M10 7v3M10 10l-4 2.5M10 10l4 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    },
    {
      label: "Earnings", href: "/earnings", active: false,
      icon: (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M2.5 8.5h15M13.5 12h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
    },
    {
      label: "Leaderboard", href: "/leaderboard", active: false,
      icon: (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.5 17h13M5.5 17V9.5h3V17M8.5 17V5.5h3V17M11.5 17V7.5h3V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    },
    {
      label: "Transactions", href: "/transactions", active: false,
      icon: (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.5 7h13l-3-3M16.5 13h-13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    },
    {
      label: "Profile", href: "/profile", active: true,
      icon: (<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 17.5c0-2.5 3-4.5 6.5-4.5s6.5 2 6.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    },
    {
      label: "Settings", href: "/settings", active: false,
      icon: <Image src="/settings-icon.png" alt="Settings" width={20} height={20} className="w-5 h-5 object-contain" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans flex flex-col lg:flex-row antialiased overflow-x-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden cursor-pointer" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-white border-r border-[#e8ecf1] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="flex flex-col gap-7">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <Image src="/new-logo.png" alt="EQUORA.FI" width={64} height={64} className="w-[32px] h-[32px] object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-[14px] font-extrabold text-[#0f172a] tracking-tight">EQUORA_FI</span>
                <span className="text-[9px] font-bold text-[#2563eb] tracking-[0.16em] uppercase mt-0.5">MATRIX</span>
              </div>
            </Link>
            <button type="button" className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer ${item.active ? "bg-[#eff6ff] text-[#2563eb] font-semibold" : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"}`}>
                <span className={item.active ? "text-[#2563eb]" : "text-[#94a3b8]"}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <p className="text-white text-[13px] font-bold leading-[1.35] mb-3">A Stronger Tomorrow,<br/>Built Together.</p>
          <div className="pt-1 border-t border-white/15">
            <div className="text-[10px] font-extrabold text-white/95 tracking-wider uppercase">EQUORA_FI</div>
            <div className="text-[9px] text-white/70 mt-0.5">Genesis DAO • dao.equora.fi</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen min-w-0 overflow-x-hidden">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#e8ecf1] h-[60px] lg:h-[64px] px-4 lg:px-8 flex items-center justify-between gap-3">
          {/* Mobile Left: Hamburger + Logo */}
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
              <Image src="/new-logo.png" alt="EQUORA.FI" width={64} height={64} className="w-[30px] h-[30px] object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-[13.5px] font-extrabold text-[#0f172a] tracking-tight">EQUORA_FI</span>
                <span className="text-[8.5px] font-bold text-[#2563eb] tracking-[0.14em] uppercase">MATRIX</span>
              </div>
            </Link>
          </div>
          <div className="hidden lg:flex items-center flex-1 max-w-[200px] xl:max-w-[360px]">
            <div className="relative w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
              <input type="text" placeholder="Search member ID / wallet / transaction..." className="w-full h-[40px] pl-10 pr-9 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[13px] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"/>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[11px] font-semibold text-[#94a3b8] flex items-center justify-center select-none">/</div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div
              onClick={() => toast.info("Polygon Amoy testnet is operational and synced.", "Protocol Live")}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] cursor-pointer hover:bg-emerald-100/50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"/>
              <span className="text-[12px] font-semibold text-[#16a34a]">Protocol Live</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5 7.5 4" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <button
              type="button"
              onClick={() => toast.info("You have no unread profile notifications.", "Notifications")}
              className="hidden lg:flex relative w-[38px] h-[38px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] items-center justify-center hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2.5a5.5 5.5 0 00-5.5 5.5c0 4.5-2 5.5-2 5.5h15s-2-1-2-5.5a5.5 5.5 0 00-5.5-5.5zM11.5 16.5a1.5 1.5 0 01-3 0" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-[#ef4444] rounded-full border border-white"/>
            </button>
            <div className="lg:hidden flex items-center gap-1.5">
              <button type="button" onClick={() => setWalletModalOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-[11px] font-medium cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]"/>
                <span className="font-mono font-semibold text-[#1e40af]">{address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "0x..."}</span>
              </button>
            </div>
            <button type="button" onClick={() => setWalletModalOpen(true)} className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9] cursor-pointer">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9.5" rx="2" stroke="#64748b" strokeWidth="1.3"/><path d="M1.5 6.5h13" stroke="#64748b" strokeWidth="1.3"/><circle cx="11.5" cy="9.5" r="1" fill="#64748b"/></svg>
              <span className="text-[12.5px] font-medium text-[#334155] font-mono">{address ? `${address.slice(0, 6)} . . ${address.slice(-4)}` : "0x..."}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5 7.5 4" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <Link href="/profile" title="Current Profile" className="hidden lg:flex w-[38px] h-[38px] rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
              <div className="w-full h-full rounded-full relative overflow-hidden" style={{background:"radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 35%, #1d4ed8 75%, #0f172a 100%)", boxShadow:"0 3px 6px -1px rgba(29,78,216,0.45), inset 0 2px 3px rgba(255,255,255,0.7), inset 0 -2px 3px rgba(0,0,0,0.4)"}}>
                <div className="absolute top-1 left-2 w-2 h-1.5 rounded-full bg-white/40 blur-[0.5px] transform -rotate-12"/>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:py-7 w-full space-y-5 min-w-0 overflow-x-hidden">

          {/* ── PAGE TITLE ROW ── */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] lg:text-[11.5px] font-bold text-[#2563eb] tracking-wider uppercase mb-1">PROFILE</p>
              <h1 className="text-[26px] lg:text-[30px] font-extrabold text-[#0f172a] tracking-tight leading-tight">Your Profile</h1>
              <p className="text-[12.5px] lg:text-[13px] text-[#64748b] mt-1">Manage your account, wallet, and protocol details.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("personal-info-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                toast.info("Scroll to Personal Information to edit profile.", "Edit Profile");
              }}
              title="Edit Profile"
              className="w-10 h-10 rounded-[14px] bg-white border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] hover:bg-[#eff6ff] transition-all shadow-xs cursor-pointer flex-shrink-0 mt-1"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>

          {/* ── PROFILE HERO CARD ── */}
          <ProfileHeroCard copy={copy} />

          {/* ── STATS 2×2 / 4-COL GRID ── */}
          <ProfileStatsGrid />

          {/* ── PERSONAL & WALLET INFORMATION (VERTICAL STACK) ── */}
          <div className="flex flex-col gap-4 lg:gap-5 w-full">
            <PersonalInfoCard />
            <WalletInfoCard copy={copy} onManage={() => setWalletModalOpen(true)} />
          </div>

          {/* Bottom spacing */}
          <div className="h-6" />
        </main>
      </div>

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
  );
}
