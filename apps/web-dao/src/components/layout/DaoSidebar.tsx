'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Layers,
  Coins,
  ArrowLeftRight,
  User,
  Settings,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { DAO_NAV_ITEMS } from '@/data/navigation';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { DaoWhatsAppCircle } from '@/components/dao/DaoWhatsAppCircle';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember } from '@/hooks/useApi';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { WalletModal } from '@/components/ui/WalletModal';
import { triggerSmartConnectWallet } from '@/utils/walletConnect';

const NAV_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="w-4 h-4" />,
  'Council Seats': <Users className="w-4 h-4" />,
  'Member Lounge': <User className="w-4 h-4" />,
  'Matrix Bridge': <Layers className="w-4 h-4" />,
  Treasury: <Coins className="w-4 h-4" />,
  Transactions: <ArrowLeftRight className="w-4 h-4" />,
  Profile: <User className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
};

function shortenAddress(addr: string | null | undefined, chars = 4): string {
  if (!addr) return '';
  if (addr.startsWith('T') && addr.length > 10) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  if (addr.startsWith('0x') && addr.length > 10) {
    return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
  }
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export const DaoSidebar: React.FC = () => {
  const pathname = usePathname();
  const wallet = useWallet();
  const auth = useAuthContext();

  const [mounted, setMounted] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storedAddr, setStoredAddr] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isConnected = mounted && Boolean(
    wallet.isConnected ||
    auth.isAuthenticated
  );

  const displayAddress = isConnected ? (
    wallet.base58Address ||
    wallet.hexAddress ||
    auth.user?.address ||
    storedAddr ||
    ''
  ) : '';

  const shortDisplay = shortenAddress(displayAddress);
  const { data: memberData } = useDaoMember(displayAddress);

  const handleConnectClick = () => {
    triggerSmartConnectWallet({
      wallet,
      openModal: () => setWalletModalOpen(true),
    });
  };

  const handleCopy = async () => {
    if (!displayAddress) return;
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleDisconnect = () => {
    auth.signOut();
    wallet.disconnect();
    setStoredAddr(null);
    try {
      localStorage.setItem('equora_wallet_explicit_disconnect', 'true');
      localStorage.removeItem('trobsafe_address');
      localStorage.removeItem('equora_auth_address');
      localStorage.removeItem('equora_jwt');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  return (
    <>
      <aside className="w-[248px] shrink-0 hidden lg:block select-none">
        <div className="fixed top-0 left-0 w-[248px] h-screen bg-[#FBFCFF] border-r border-[#E2ECF9] flex flex-col justify-between p-3.5 z-30 overflow-y-auto">
          {/* Top section: Brand Header & Navigation */}
          <div className="space-y-5">
            {/* Brand Logo Header */}
            <div className="px-2 pt-1.5">
              <Link href="/dao" className="flex items-center gap-3 group">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                  <EquoraLogo className="w-9 h-9 drop-shadow-[0_2px_8px_rgba(14,98,228,0.25)] transition-transform group-hover:scale-105 duration-200" />
                </div>
                <div>
                  <div className="text-sm font-black font-inter tracking-tight text-[#17334F] leading-tight">
                    EQUORA<span className="text-[#0E62E4]">.FI</span>
                  </div>
                  <div className="text-[10px] font-bold font-inter text-[#0E62E4] tracking-wider">
                    GENESIS DAO
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {DAO_NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dao' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0E62E4]/10 text-[#0E62E4] font-bold border border-[#0E62E4]/25 shadow-xs'
                        : 'text-[#4F6D87] font-medium hover:text-[#0E62E4] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    <span className={isActive ? 'text-[#0E62E4]' : 'text-[#64748B]'}>
                      {NAV_ICONS[item.label] || <Shield className="w-4 h-4" />}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom section: TrobSafe Wallet Widget + WhatsApp Circle */}
          <div className="space-y-3 pt-3 border-t border-[#E2ECF9]/80">
            {/* ── TrobSafe Wallet In-Sidebar Interactive Widget ── */}
            <div className="rounded-2xl p-3 bg-white border border-[#E2ECF9] shadow-[0_4px_16px_rgba(14,98,228,0.06)] space-y-2.5">
              {isConnected ? (
                /* Connected State */
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse" />
                      <span className="text-[10px] font-bold text-[#17334F] uppercase tracking-wider">
                        TrobSafe Active
                      </span>
                    </div>
                    {(memberData?.isMember && Number(memberData?.position) > 0) ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        Seat #{memberData.position}
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#0E62E4] border border-[#0E62E4]/20">
                        Genesis Explorer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#EFF6FF]/70 border border-[#0E62E4]/15">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar
                        address={displayAddress}
                        userId={auth.user?.userId || memberData?.userId}
                        size={28}
                        roundedClassName="rounded-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[9px] text-[#64748B] font-medium leading-none">Wallet</div>
                        <div className="text-xs font-mono font-bold text-[#17334F] truncate max-w-[110px]" title={displayAddress}>
                          {shortDisplay}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={handleCopy}
                        className="p-1 rounded-md text-[#4F6D87] hover:text-[#0E62E4] hover:bg-white transition-colors"
                        title="Copy address"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Disconnect wallet"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Disconnected State: Direct TrobSafe Wake-Up & Connect Button */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 shadow-xs">
                        <img
                          src="/trobsafe-logo.webp"
                          alt="TrobSafe"
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[#17334F]">TrobSafe Wallet</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Trobium L1 Ready" />
                  </div>

                  <p className="text-[10px] text-[#64748B] leading-snug">
                    Connect your installed TrobSafe extension to sign and interact.
                  </p>

                  <button
                    onClick={handleConnectClick}
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#0E62E4] hover:bg-[#0B52C4] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(14,98,228,0.25)] transition-all cursor-pointer group"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white transition-transform group-hover:scale-110" />
                    <span>Connect TrobSafe</span>
                  </button>

                  <button
                    onClick={() => setWalletModalOpen(true)}
                    type="button"
                    className="w-full text-center text-[10px] font-semibold text-[#0E62E4] hover:underline cursor-pointer pt-0.5"
                  >
                    Wake Up or Setup Extension →
                  </button>
                </div>
              )}
            </div>

            {/* WhatsApp circle badge */}
            <div>
              <DaoWhatsAppCircle variant="badge" />
            </div>
          </div>
        </div>
      </aside>

      {/* Wallet Modal mounted for sidebar triggers */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
};
