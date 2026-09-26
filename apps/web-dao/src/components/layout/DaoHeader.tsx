'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  Trophy,
  Layers,
  Coins,
  ArrowLeftRight,
  User,
  Settings,
  LogOut,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { DAO_NAV_ITEMS } from '@/data/navigation';
import { usePathname } from 'next/navigation';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { WalletModal } from '@/components/ui/WalletModal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortenAddress(addr: string | null, chars = 4): string {
  if (!addr) return '';
  if (addr.startsWith('T') && addr.length > 10) {
    // Trobium base58 — show first 6 + last 4
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  // Hex 0x address
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export const DaoHeader: React.FC = () => {
  const pathname         = usePathname();
  const wallet           = useWallet();
  const auth             = useAuthContext();

  const [mobileNavOpen, setMobileNavOpen]   = useState(false);
  const [walletDropOpen, setWalletDropOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied]                 = useState(false);

  // Display address: prefer base58 (Trobium native), fallback to hex
  const displayAddress = wallet.base58Address ?? wallet.hexAddress ?? '';
  const shortDisplay   = shortenAddress(displayAddress);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleCopyAddress = async () => {
    if (!displayAddress) return;
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const handleDisconnect = () => {
    setWalletDropOpen(false);
    auth.signOut();
    wallet.disconnect();
  };

  return (
    <>
      <header className="h-14 sm:h-16 border-b border-[#E7EEF8] bg-white/95 backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">

        {/* Left: Mobile brand + Desktop search */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link href="/dao" className="lg:hidden flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center">
              <EquoraLogo className="w-8 h-8 drop-shadow-[0_2px_6px_rgba(21,94,239,0.25)]" />
            </div>
            <div>
              <div className="text-[11px] font-black font-inter tracking-tight text-[#071A4A] leading-tight">
                EQUORA<span className="text-[#155EEF]">.FI</span>
              </div>
              <div className="text-[8px] font-bold font-inter text-[#155EEF] tracking-wider leading-none">
                GENESIS DAO
              </div>
            </div>
          </Link>

          {/* Desktop search */}
          <div className="relative w-full min-w-[180px] max-w-[340px] hidden lg:block">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member ID / wallet / transaction…"
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-xs text-[#071A4A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF] focus:bg-white transition-all font-jakarta"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white border border-[#E2ECF9] text-[10px] text-[#94A3B8] font-mono shadow-xs">
              /
            </div>
          </div>
        </div>

        {/* Right: Status + bell + wallet pill + avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">

          {/* Protocol status pill — desktop only */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857] font-jakarta shadow-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Protocol Live</span>
          </div>

          {/* Notification bell — desktop only */}
          <button
            className="hidden lg:flex relative w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-[#60739A] hover:text-[#071A4A] hover:bg-slate-100 items-center justify-center transition-all shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white" />
          </button>

          {/* ── Wallet pill / connect button ───────────────────────────── */}
          {wallet.isConnected ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full sm:rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[10px] sm:text-xs font-mono font-semibold text-[#1E293B] shadow-xs hover:bg-[#DBEAFE] transition-colors"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="hidden md:inline">{shortDisplay}</span>
                <span className="md:hidden">
                  {displayAddress ? displayAddress.slice(0, 5) + '…' : '…'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {/* Dropdown */}
              {walletDropOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWalletDropOpen(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 bg-white rounded-2xl border border-[#E2ECF9] shadow-xl p-2">
                    {/* Address row */}
                    <div className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] mb-1.5">
                      <p className="text-[10px] text-[#94A3B8] font-medium mb-0.5">Connected wallet</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-mono text-[#071A4A] truncate">{shortDisplay}</p>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 rounded-md hover:bg-slate-100 text-[#94A3B8] hover:text-[#071A4A] transition-colors shrink-0"
                          title="Copy address"
                        >
                          {copied
                            ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                      {auth.user && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {auth.user.daoMember && (
                            <span className="text-[10px] font-semibold text-[#155EEF] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                              Seat #{auth.user.daoPosition}
                            </span>
                          )}
                          {auth.user.userId && (
                            <span className="text-[10px] text-[#64748B]">
                              ID #{auth.user.userId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation shortcuts */}
                    <Link
                      href="/dao/profile"
                      onClick={() => setWalletDropOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#344054] hover:bg-[#F8FAFC] hover:text-[#071A4A] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                      View Profile
                    </Link>
                    <Link
                      href="/dao/settings"
                      onClick={() => setWalletDropOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#344054] hover:bg-[#F8FAFC] hover:text-[#071A4A] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Settings
                    </Link>

                    <div className="my-1 border-t border-[#F1F5F9]" />

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect Wallet
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Not connected — show Connect button */
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#155EEF] text-white text-xs font-semibold shadow-sm hover:bg-[#004EEB] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-white/60 shrink-0" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* User avatar sphere — desktop only, shown when connected */}
          {wallet.isConnected && (
            <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-xs border border-[#BFDBFE] shrink-0 hidden lg:block">
              <img
                src="/dao/Futuristic Glowing Blue 3D Spherical Avatar_margin.png"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#071A4A] hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile sub-banner */}
      {(pathname === '/dao' || pathname === '/dao/seats') && (
        <div className="lg:hidden w-full bg-white border-b border-[#E7EEF8] px-4 sm:px-6 py-2 flex items-center justify-between text-[10px] font-bold font-jakarta select-none">
          <div className="flex items-center gap-1.5 text-[#155EEF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
            <span className="tracking-wider">GENESIS DAO PHASE 1</span>
          </div>
          <a
            href="https://dao.equora.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#155EEF] hover:underline uppercase tracking-wider font-semibold"
          >
            DAO.EQUORA.FI
          </a>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-72 sm:w-80 bg-white h-full p-5 flex flex-col justify-between border-l border-[#E2ECF9] shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2ECF9]">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#155EEF] font-jakarta">
                  PROTOCOL NAVIGATION
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#071A4A] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet info in drawer */}
              {wallet.isConnected && (
                <div className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-mono text-[#071A4A] truncate">{shortDisplay}</span>
                  </div>
                  {auth.user?.daoMember && (
                    <p className="text-[10px] text-[#155EEF] mt-1 font-semibold">
                      Seat #{auth.user.daoPosition}
                    </p>
                  )}
                </div>
              )}

              <nav className="space-y-1 pt-1">
                {DAO_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold font-jakarta transition-all ${
                        isActive
                          ? 'bg-[#EEF5FF] text-[#155EEF] font-bold shadow-xs'
                          : 'text-[#4F6184] hover:text-[#071A4A] hover:bg-slate-50'
                      }`}
                    >
                      <span className={isActive ? 'text-[#155EEF]' : 'text-[#94A3B8]'}>
                        {item.label === 'Dashboard'     && <Home className="w-4 h-4" />}
                        {item.label === 'Council Seats' && <Users className="w-4 h-4" />}
                        {item.label === 'Member Lounge' && <Trophy className="w-4 h-4" />}
                        {item.label === 'Matrix Bridge' && <Layers className="w-4 h-4" />}
                        {item.label === 'Treasury'      && <Coins className="w-4 h-4" />}
                        {item.label === 'Transactions'  && <ArrowLeftRight className="w-4 h-4" />}
                        {item.label === 'Profile'       && <User className="w-4 h-4" />}
                        {item.label === 'Settings'      && <Settings className="w-4 h-4" />}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E2ECF9] space-y-2">
              {wallet.isConnected ? (
                <button
                  onClick={() => { handleDisconnect(); setMobileNavOpen(false); }}
                  className="w-full py-2.5 rounded-xl font-medium text-xs text-center text-red-500 hover:bg-red-50 border border-red-100 transition-colors"
                >
                  Disconnect Wallet
                </button>
              ) : (
                <button
                  onClick={() => { setWalletModalOpen(true); setMobileNavOpen(false); }}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-center text-white bg-[#155EEF] hover:bg-[#004EEB] transition-colors"
                >
                  Connect TrobSafe Wallet
                </button>
              )}
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="w-full py-2.5 rounded-xl font-medium text-xs text-center text-[#60739A] hover:text-[#071A4A] bg-slate-50 border border-slate-100 block transition-colors"
              >
                Back to Public Landing
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Wallet connect modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
};
