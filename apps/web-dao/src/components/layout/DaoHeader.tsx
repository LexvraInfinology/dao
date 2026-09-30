'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DAO_NAV_ITEMS } from '@/data/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { WalletModal } from '@/components/ui/WalletModal';
import { useDaoMember } from '@/hooks/useApi';
import { DaoWhatsAppCircle, WHATSAPP_DAO_GROUP_URL } from '@/components/dao/DaoWhatsAppCircle';

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
  const router           = useRouter();
  const wallet           = useWallet();
  const auth             = useAuthContext();

  const [mobileNavOpen, setMobileNavOpen]   = useState(false);
  const [walletDropOpen, setWalletDropOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [storedAddr, setStoredAddr]         = useState<string | null>(null);
  const [isDevMode, setIsDevMode]           = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dev =
      sessionStorage.getItem('equora_dao_preview') === 'true' ||
      localStorage.getItem('equora_dev_mode') === 'true' ||
      window.location.search.includes('dev=');
    setIsDevMode(dev);
  }, []);

  const handleConnectClick = async () => {
    if (wallet.isInstalled) {
      try {
        const addr = await wallet.connect();
        if (addr) return;
      } catch {
        // If rejected or cancelled, open modal
      }
    }
    setWalletModalOpen(true);
  };


  // Read stored address immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('trobsafe_address');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.base58 || parsed?.hex) {
            setStoredAddr(parsed.base58 || parsed.hex);
            return;
          }
        } catch {
          if (typeof stored === 'string' && stored.length > 6) {
            setStoredAddr(stored);
            return;
          }
        }
      }
      const authAddr = localStorage.getItem('equora_auth_address');
      if (authAddr && typeof authAddr === 'string' && authAddr.length > 6) {
        setStoredAddr(authAddr);
      }
    } catch {}
  }, [wallet.isConnected, auth.isAuthenticated]);

  // Display address: prefer base58 (Trobium native), fallback to hex, auth user, or stored address
  const displayAddress =
    wallet.base58Address ||
    wallet.hexAddress ||
    auth.user?.address ||
    storedAddr ||
    '';

  const isConnected =
    wallet.isConnected ||
    auth.isAuthenticated ||
    Boolean(displayAddress && displayAddress.length > 6);

  const shortDisplay   = shortenAddress(displayAddress);
  const { data: memberData } = useDaoMember(displayAddress);

  // Verified seat member flag
  const isSeatMember = Boolean(
    memberData?.isMember ||
    (memberData?.position && memberData.position > 0) ||
    (auth.user?.daoPosition && auth.user.daoPosition > 0) ||
    isDevMode
  );

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
    setStoredAddr(null);
    try {
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
      localStorage.removeItem('equora_dao_preview');
    } catch { /* */ }
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
              <div className="text-[11px] font-black font-inter tracking-tight text-[#17334F] leading-tight">
                EQUORA<span className="text-[#3C78B1]">.FI</span>
              </div>
              <div className="text-[8px] font-bold font-inter text-[#3C78B1] tracking-wider leading-none">
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
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#F3F8FD] border border-[#3C78B1]/18 text-xs text-[#17334F] placeholder-[#4F6D87] focus:outline-none focus:border-[#3C78B1] focus:bg-white transition-all font-sans"
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

          {/* Dev Mode Indicator (if not connected and in dev mode) */}
          {!isConnected && isDevMode && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Dev Mode (Preview)</span>
            </div>
          )}

          {/* Round circle for WhatsApp (only for real DAO seat members) */}
          <DaoWhatsAppCircle variant="header" />

          {/* ── Wallet pill / connect button ───────────────────────────── */}
          {isConnected ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#0B1528] text-white border border-[#1E293B] hover:border-[#38BDF8]/50 hover:bg-[#0F1D36] text-[11px] sm:text-xs font-mono font-semibold shadow-sm transition-all duration-200"
                aria-label="Wallet menu"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-4 ring-emerald-400/20" />
                <span className="hidden sm:inline font-mono tracking-tight text-slate-100">{shortDisplay}</span>
                <span className="sm:hidden font-mono text-[11px]">
                  {displayAddress ? displayAddress.slice(0, 5) + '…' : 'Wallet'}
                </span>
                {(memberData?.position || auth.user?.daoPosition) && (
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Seat #{memberData?.position ?? auth.user?.daoPosition}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${walletDropOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {walletDropOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWalletDropOpen(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 sm:w-80 bg-white rounded-2xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-2.5 animate-fadeIn">
                    {/* Header info card */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0B1528] to-[#111C33] border border-[#1E293B] text-white mb-2 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-semibold text-emerald-300 tracking-wider uppercase">
                            TrobSafe Connected
                          </span>
                        </div>
                        <a
                          href={`https://tronscan.org/#/address/${displayAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                          title="View on Explorer"
                        >
                          <span>Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-black/40 rounded-lg p-2 border border-white/10">
                        <p className="text-xs font-mono font-semibold text-slate-100 truncate" title={displayAddress}>
                          {displayAddress}
                        </p>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[10px]"
                          title="Copy address"
                        >
                          {copied ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-sans">Copied</span>
                            </>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Council Tier indicator */}
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 text-[10px]">Membership Tier</span>
                        {(memberData?.position || auth.user?.daoPosition) ? (
                          <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Council Seat #{memberData?.position ?? auth.user?.daoPosition}
                          </span>
                        ) : (
                          <span className="font-medium text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                            Genesis Explorer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation shortcuts */}
                    <div className="space-y-0.5 py-1">
                      <Link
                        href="/dao/lounge"
                        onClick={() => setWalletDropOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#3E6180] hover:bg-[#F0F7FD] hover:text-[#3C78B1] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Trophy className="w-4 h-4 text-[#7CB3E1] group-hover:text-[#3C78B1] transition-colors" />
                          <span>Member Lounge</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-[#3C78B1]">Dividends & Pass →</span>
                      </Link>

                      <Link
                        href="/dao/profile"
                        onClick={() => setWalletDropOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#3E6180] hover:bg-[#F0F7FD] hover:text-[#3C78B1] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-[#7CB3E1] group-hover:text-[#3C78B1] transition-colors" />
                          <span>My Profile</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-[#3C78B1]">Badges & Activity →</span>
                      </Link>

                      <Link
                        href="/dao/settings"
                        onClick={() => setWalletDropOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#3E6180] hover:bg-[#F0F7FD] hover:text-[#3C78B1] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-4 h-4 text-[#7CB3E1] group-hover:text-[#3C78B1] transition-colors" />
                          <span>Settings & Keys</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-[#3C78B1]">Security →</span>
                      </Link>

                      {isSeatMember && (
                        <a
                          href={WHATSAPP_DAO_GROUP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setWalletDropOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200/80 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                              </svg>
                            </div>
                            <span>DAO WhatsApp Group</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">Join →</span>
                        </a>
                      )}
                    </div>

                    <div className="my-1.5 border-t border-[#F1F5F9]" />

                    {/* Sign Out / Disconnect Button */}
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100/90 border border-rose-100 transition-colors shadow-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out / Disconnect</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Not connected — show Connect button */
            <button
              onClick={handleConnectClick}
              className="btn-primary px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* User avatar sphere — desktop only, shown when connected */}
          {isConnected && (
            <button
              onClick={() => setWalletDropOpen((v) => !v)}
              className="relative w-9 h-9 rounded-full overflow-hidden shadow-xs border border-[#3C78B1]/30 shrink-0 hidden lg:block hover:ring-2 hover:ring-[#3C78B1]/40 transition-all"
              title="Open Wallet Menu"
            >
              <img
                src="/dao/Futuristic Glowing Blue 3D Spherical Avatar_margin.png"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#17334F] hover:bg-[#F3F8FD] transition-colors"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile sub-banner */}
      {(pathname === '/dao' || pathname === '/dao/seats') && (
        <div className="lg:hidden w-full bg-white border-b border-[#3C78B1]/15 px-4 sm:px-6 py-1.5 flex items-center justify-between text-[10px] font-semibold font-sans select-none">
          <div className="flex items-center gap-1.5 text-[#3C78B1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3C78B1]" />
            <span className="tracking-wider uppercase">GENESIS DAO PHASE 1</span>
          </div>
          <a
            href="https://dao.equora.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3C78B1] hover:underline uppercase tracking-wider font-semibold"
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
              <div className="flex items-center justify-between pb-3 border-b border-[#E2EEF9]">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#3C78B1] font-sans">
                  PROTOCOL NAVIGATION
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#14304A] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet info in drawer */}
              {isConnected && (
                <div className="px-3.5 py-3 rounded-xl bg-[#14304A] text-white border border-[#234668] shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Connected</span>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 rounded text-slate-300 hover:text-white"
                      title="Copy"
                    >
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-100 truncate">
                    {displayAddress}
                  </div>
                  {(memberData?.position || auth.user?.daoPosition) && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[10px]">Council Seat</span>
                      <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                        Seat #{memberData?.position ?? auth.user?.daoPosition}
                      </span>
                    </div>
                  )}
                  {isSeatMember && (
                    <div className="mt-2.5">
                      <DaoWhatsAppCircle variant="badge" />
                    </div>
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#EBF3FA] text-[#3C78B1] font-bold shadow-xs'
                          : 'text-[#4F6D87] hover:text-[#14304A] hover:bg-[#F7FBFF]'
                      }`}
                    >
                      <span className={isActive ? 'text-[#3C78B1]' : 'text-[#7CB3E1]'}>
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

            <div className="pt-4 border-t border-[#E2EEF9] space-y-2">
              {isConnected ? (
                <button
                  onClick={() => { handleDisconnect(); setMobileNavOpen(false); }}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-center text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Disconnect</span>
                </button>
              ) : (
                <button
                  onClick={() => { handleConnectClick(); setMobileNavOpen(false); }}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-center text-white bg-[#3C78B1] hover:bg-[#5FA2D1] transition-colors shadow-xs"
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
