'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, Wallet } from 'lucide-react';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { useWallet } from '@/context/WalletContext';
import { WalletModal } from '@/components/ui/WalletModal';

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled]             = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#queue' },
    { label: 'Levels',       href: '#simulator' },
    { label: 'Pools',        href: '#simulator' },
    { label: 'Network',      href: '#trobchain' },
    { label: 'Rewards',      href: '#activity' },
    { label: 'About',        href: '#about' },
  ];

  const shortAddress = wallet.base58Address
    ? `${wallet.base58Address.slice(0, 5)}…${wallet.base58Address.slice(-4)}`
    : wallet.hexAddress
    ? `${wallet.hexAddress.slice(0, 6)}…${wallet.hexAddress.slice(-4)}`
    : 'Connected';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 ${
          scrolled
            ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] py-3'
            : 'shadow-xs py-3.5 sm:py-4'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-3.5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-12 gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                <EquoraLogo className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_2px_8px_rgba(21,94,239,0.3)] transition-transform group-hover:scale-105 duration-200" />
              </div>
              <span className="text-[15px] sm:text-[17px] font-bold font-inter tracking-tight text-[#0F172A] shrink-0">
                EQUORA<span className="text-[#155EEF]">.FI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[14px] font-medium font-inter text-[#475467] hover:text-[#0F172A] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA — Connect Wallet */}
            <div className="hidden lg:flex items-center">
              {!wallet.isConnected ? (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="px-5 py-2.5 rounded-full font-semibold text-[13px] text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_4px_14px_rgba(21,94,239,0.3)] hover:shadow-[0_6px_20px_rgba(21,94,239,0.4)] transition-all duration-200 flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="px-3.5 py-2 rounded-full font-mono text-[12px] font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all flex items-center gap-2"
                    title="TrobSafe Wallet Connected"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{shortAddress}</span>
                  </button>
                  <Link
                    href="/dao"
                    className="px-4 py-2 rounded-full font-semibold text-[13px] text-white bg-[#0B132B] hover:bg-[#1E293B] shadow-sm transition-all duration-200 flex items-center gap-1.5"
                  >
                    <span>Dashboard</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile CTA + hamburger */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2.5 shrink-0">
              {!wallet.isConnected ? (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full font-semibold text-[11px] sm:text-[12px] text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                  <span>Connect</span>
                </button>
              ) : (
                <Link
                  href="/dao"
                  className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 rounded-full font-semibold text-[11px] sm:text-[12px] text-white bg-[#0B132B] hover:bg-[#1E293B] shadow-sm transition-all flex items-center gap-1 shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>DAO</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 sm:p-1.5 rounded-lg text-[#0F172A] hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-6 py-6 space-y-4 shadow-xl">
            <div className="space-y-1">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-blue-50 hover:text-[#155EEF] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {!wallet.isConnected ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); setWalletModalOpen(true); }}
                  className="w-full py-3 rounded-full font-semibold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] flex items-center justify-center gap-2 shadow-sm"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect TrobSafe Wallet</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Connected:</span>
                    <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {shortAddress}
                    </span>
                  </div>
                  <Link
                    href="/dao"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-full font-semibold text-sm text-white bg-[#0B132B] hover:bg-[#1E293B] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Enter Genesis DAO</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* TrobSafe wallet modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
};
