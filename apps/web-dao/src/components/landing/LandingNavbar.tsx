'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowUpRight,
  Wallet,
  LogOut,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { WalletModal } from '@/components/ui/WalletModal';
import { useDaoMember } from '@/hooks/useApi';
import { DaoWhatsAppCircle } from '@/components/dao/DaoWhatsAppCircle';
import { triggerSmartConnectWallet } from '@/utils/walletConnect';

function shortenAddress(addr: string | null, chars = 4): string {
  if (!addr) return '';
  if (addr.startsWith('T') && addr.length > 10) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export const LandingNavbar: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storedAddr, setStoredAddr] = useState<string | null>(null);

  const wallet = useWallet();
  const auth = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Read stored address immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('equora_wallet_explicit_disconnect') === 'true') {
      setStoredAddr(null);
      return;
    }
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

  const isConnected = mounted && Boolean(
    wallet.isConnected ||
    auth.isAuthenticated ||
    storedAddr
  );

  const displayAddress = isConnected ? (
    wallet.base58Address ||
    wallet.hexAddress ||
    auth.user?.address ||
    storedAddr ||
    ''
  ) : '';

  const shortAddress = shortenAddress(displayAddress) || 'Connected';
  const { data: memberData } = useDaoMember(displayAddress);

  const isSeatMember = Boolean(
    memberData?.isMember ||
    (memberData?.position && memberData.position > 0) ||
    (auth.user?.daoPosition && auth.user.daoPosition > 0)
  );

  const handleConnectClick = () => {
    if (wallet.isConnected) {
      window.location.href = '/dao';
      return;
    }
    triggerSmartConnectWallet({
      wallet,
      openModal: () => setWalletModalOpen(true),
      onConnected: () => {
        window.location.href = '/dao';
      },
    });
  };

  const handleCopyAddress = async () => {
    if (!displayAddress) return;
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDisconnect = () => {
    auth.signOut();
    wallet.disconnect();
    setStoredAddr(null);
    setMobileMenuOpen(false);
    try {
      localStorage.setItem('equora_wallet_explicit_disconnect', 'true');
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
    } catch {}
  };

  const navLinks = [
    { label: 'About',      href: '#about' },
    { label: 'Queue',      href: '#queue' },
    { label: 'Calculator', href: '#simulator' },
    { label: 'Network',    href: '#trobchain' },
    { label: 'FAQ',        href: '#faq' },
  ];

  return (
    <>
      <header
        className="fixed top-2 sm:top-3.5 inset-x-0 z-50 flex flex-col items-center px-2 sm:px-4 lg:px-6 pointer-events-none transition-all duration-300"
      >
        <div
          className={`w-full max-w-[1140px] 2xl:max-w-[1180px] pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-xl sm:rounded-2xl transition-all duration-300 ${
            scrolled
              ? 'shadow-[0_12px_32px_-6px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)] py-1.5 sm:py-2 px-2.5 min-[360px]:px-3.5 sm:px-4 lg:px-5 xl:px-6 border-slate-300/80'
              : 'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)] py-1.5 sm:py-2.5 px-2.5 min-[360px]:px-3.5 sm:px-4 lg:px-5 xl:px-6'
          }`}
        >
          <div className="flex items-center justify-between min-h-[40px] sm:min-h-[44px] gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4 w-full">
            {/* Logo with DAO subtext */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
              <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center">
                <EquoraLogo className="w-6.5 h-6.5 sm:w-7 sm:h-7 drop-shadow-[0_2px_6px_rgba(21,94,239,0.25)] transition-transform group-hover:scale-105 duration-200" />
              </div>
              <div className="flex flex-col justify-center leading-none">
                <span className="text-[13px] min-[360px]:text-[14px] sm:text-[15px] font-extrabold tracking-wide uppercase text-[#0F172A] leading-tight shrink-0 whitespace-nowrap">
                  EQUORA<span className="text-[#155EEF]">.FI</span>
                </span>
                <span className="text-[7.5px] sm:text-[8px] font-extrabold tracking-[0.24em] text-[#155EEF] uppercase mt-0.5 leading-none select-none">
                  DAO
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink-0">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={pathname === '/' ? item.href : `/${item.href}`}
                  className="px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-lg text-[13px] xl:text-sm font-medium text-[#475467] hover:text-[#0F172A] hover:bg-slate-100/80 transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA actions */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">

              {!isConnected ? (
                <button
                  onClick={handleConnectClick}
                  className="h-9 xl:h-10 px-4 xl:px-5 rounded-xl font-semibold text-xs uppercase tracking-[0.05em] text-white bg-[#155EEF] hover:bg-[#124bcf] active:bg-[#0e3ea6] shadow-[0_1px_3px_rgba(21,94,239,0.3),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(21,94,239,0.3)] border border-blue-400/20 transition-all duration-150 flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap active:scale-[0.98]"
                >
                  <Wallet className="w-4 h-4 text-white shrink-0" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="h-9 xl:h-10 px-2.5 xl:px-3 rounded-xl font-mono text-[11px] xl:text-[11.5px] font-medium tabular-nums text-[#0F172A] bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
                    title="TrobSafe Wallet Connected"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="whitespace-nowrap select-none">{shortAddress}</span>
                  </button>
                  {isSeatMember ? (
                    <Link
                      href="/dao"
                      className="h-9 xl:h-10 px-3.5 xl:px-4 rounded-xl font-semibold text-xs uppercase tracking-[0.05em] text-white bg-[#0B132B] hover:bg-[#1E293B] shadow-xs transition-all duration-200 flex items-center gap-1.5 group shrink-0 whitespace-nowrap"
                    >
                      <span>Member Dashboard</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </Link>
                  ) : (
                    <Link
                      href="/dao"
                      className="h-9 xl:h-10 px-3.5 xl:px-4 rounded-xl font-bold text-xs uppercase tracking-[0.05em] text-white bg-gradient-to-r from-[#0E62E4] to-[#1F70F5] hover:from-[#0B52C4] hover:to-[#175cd3] shadow-[0_2px_10px_rgba(14,98,228,0.3)] transition-all duration-200 flex items-center gap-1.5 group shrink-0 whitespace-nowrap active:scale-[0.98]"
                    >
                      <span>Claim Seat ($300)</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile CTA + hamburger */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              {!isConnected ? (
                <button
                  onClick={handleConnectClick}
                  className="whitespace-nowrap h-8 min-[360px]:h-8.5 sm:h-9 px-2.5 min-[360px]:px-3.5 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-[10.5px] min-[360px]:text-[11px] sm:text-xs uppercase tracking-[0.04em] text-white bg-[#155EEF] hover:bg-[#124bcf] active:bg-[#0e3ea6] shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-[0.98]"
                >
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>Connect</span>
                </button>
              ) : (
                <Link
                  href="/dao"
                  className={`whitespace-nowrap h-8 min-[360px]:h-8.5 sm:h-9 px-2 min-[360px]:px-3 sm:px-3.5 rounded-lg sm:rounded-xl font-bold text-[10px] min-[360px]:text-[11px] uppercase tracking-wide text-white shadow-xs transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 active:scale-[0.98] ${
                    isSeatMember
                      ? 'bg-[#0B132B] hover:bg-[#1E293B]'
                      : 'bg-[#0E62E4] hover:bg-[#0B52C4]'
                  }`}
                >
                  {isSeatMember && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                  <span>{isSeatMember ? 'Dashboard' : 'Claim Seat'}</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-80" />
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg text-[#0F172A] hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer fixed to the right side (matching dashboard view) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="w-72 sm:w-80 bg-white h-full p-5 flex flex-col justify-between border-l border-[#E2ECF9] shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto pointer-events-auto">
            <div className="space-y-4">
              {/* Close Button */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#071A4A] hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close Navigation Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>


              {/* Wallet info in drawer if connected */}
              {isConnected && (
                <div className="px-3.5 py-3 rounded-xl bg-[#0B1528] text-white border border-[#1E293B] shadow-sm">
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

              {/* Exact Landing Page Navigation Links */}
              <nav className="space-y-1 pt-1">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={pathname === '/' ? item.href : `/${item.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold text-[#344054] hover:text-[#155EEF] hover:bg-[#EEF5FF] transition-all group"
                  >
                    <span>{item.label}</span>
                    <span className="text-[#94A3B8] group-hover:text-[#155EEF] group-hover:translate-x-0.5 transition-all text-xs">→</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Bottom Actions from landing page navbar */}
            <div className="pt-4 border-t border-[#E2ECF9] space-y-2.5">

              {!isConnected ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleConnectClick();
                  }}
                  className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect TrobSafe Wallet</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/dao"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#0B132B] hover:bg-[#1E293B] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>{isSeatMember ? 'Open Member Dashboard' : 'Claim Genesis Seat ($300)'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      handleDisconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs text-center text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TrobSafe wallet modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
};
