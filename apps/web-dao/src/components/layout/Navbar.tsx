'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Wallet, ExternalLink } from 'lucide-react';
import { LANDING_NAV_ITEMS } from '@/data/navigation';
import { WalletModal } from '@/components/ui/WalletModal';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { useWallet } from '@/context/WalletContext';
import { DevModeButton } from '@/components/ui/DevModeButton';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const wallet = useWallet();

  const displayAddr = wallet.base58Address
    ? `${wallet.base58Address.slice(0, 5)}…${wallet.base58Address.slice(-4)}`
    : wallet.hexAddress
    ? `${wallet.hexAddress.slice(0, 6)}…${wallet.hexAddress.slice(-4)}`
    : null;

  const handleConnectClick = () => {
    if (wallet.isConnected) {
      window.location.href = '/dao';
      return;
    }
    // If TrobSafe extension is not installed or active, redirect to the APK/extension installation page
    if (!wallet.isInstalled) {
      window.location.href = '/trobsafe/install';
      return;
    }
    setWalletModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-border-figma shadow-card py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                <EquoraLogo className="w-9 h-9 drop-shadow-[0_2px_8px_rgba(21,94,239,0.3)] transition-transform group-hover:scale-105 duration-200" />
              </div>
              <span className="text-xl font-bold font-inter tracking-tight text-navy">
                EQUORA<span className="text-brand">.FI</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {LANDING_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium font-inter text-[#475467] hover:text-[#071A4A] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Dev Mode direct bypass to DAO */}
              <DevModeButton />

              {/* Connect / Address */}
              <button
                onClick={handleConnectClick}
                className="px-4 h-[40px] rounded-xl font-medium text-sm text-[#071A4A] bg-white hover:bg-slate-50 border border-[#E2ECF9] shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {wallet.isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs">{displayAddr}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 text-[#155EEF]" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-navy hover:bg-black/5"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-border-figma px-6 py-6 space-y-4 shadow-xl animate-fadeIn">
            <div className="space-y-2">
              {LANDING_NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-base font-semibold text-navy hover:bg-brand-light hover:text-brand transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {/* Dev Mode button in mobile menu */}
              <DevModeButton variant="drawer" />

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleConnectClick();
                }}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-navy hover:bg-navy-deep transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
              <Link
                href="/dao"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl font-semibold text-sm text-center text-navy bg-brand-light hover:bg-blue-100 transition-colors"
              >
                Open Genesis DAO Portal →
              </Link>
            </div>
          </div>
        )}
      </header>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={() => {
          setWalletModalOpen(false);
        }}
      />
    </>
  );
};
