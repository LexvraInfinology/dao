'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Wallet,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Home,
  Users,
  Trophy,
  Layers,
  Coins,
  ArrowLeftRight,
  User,
  Settings,
} from 'lucide-react';
import { DAO_NAV_ITEMS } from '@/data/navigation';
import { usePathname } from 'next/navigation';
import { EquoraLogo } from '@/components/ui/EquoraLogo';

export const DaoHeader: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-14 sm:h-16 border-b border-[#E7EEF8] bg-white/95 backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Mobile Brand Link + Desktop Search Bar */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile Brand Logo */}
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

          {/* Desktop Search Bar matching Figma (340x42) */}
          <div className="relative w-full min-w-[180px] max-w-[340px] hidden lg:block">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member ID / wallet / transaction..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-xs text-[#071A4A] placeholder-[#94A3B8] focus:outline-none focus:border-[#155EEF] focus:bg-white transition-all font-jakarta"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white border border-[#E2ECF9] text-[10px] text-[#94A3B8] font-mono shadow-xs">
              /
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
          {/* Protocol Status Pill (139.8x30) - Desktop only */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#047857] font-jakarta shadow-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Protocol Live</span>
            <ChevronDown className="w-3 h-3 text-[#047857]" />
          </div>

          {/* Notification Bell (36x36) - Desktop only */}
          <button
            className="hidden lg:flex relative w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-[#60739A] hover:text-[#071A4A] hover:bg-slate-100 items-center justify-center transition-all shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white" />
          </button>

          {/* Connected Wallet Pill - Compact on mobile, full on desktop */}
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full sm:rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[10px] sm:text-xs font-mono font-semibold text-[#1E293B] shadow-xs">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="hidden md:inline">0x8A3F...91F2</span>
            <span className="md:hidden">0x8A...91F2</span>
            <ChevronDown className="w-3 h-3 text-[#64748B] hidden lg:block" />
          </div>

          {/* User Avatar Sphere (36x36) - Desktop only */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-xs border border-[#BFDBFE] shrink-0 hidden lg:block">
            <img
              src="/dao/Futuristic Glowing Blue 3D Spherical Avatar_margin.png"
              alt="User Avatar Sphere"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#071A4A] hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sub-banner matching Mobile reference (only shown on Dashboard/Seats where present in reference designs) */}
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

      {/* Mobile Drawer Menu matching Figma Html → Body MobileNavDrawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fadeIn flex justify-end">
          <div className="w-72 sm:w-80 bg-white h-full p-5 flex flex-col justify-between border-l border-[#E2ECF9] shadow-2xl animate-slideLeft">
            <div className="space-y-4">
              {/* Drawer Header matching mobile screenshot */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2ECF9]">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#155EEF] font-jakarta">
                  PROTOCOL NAVIGATION
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#071A4A] hover:bg-slate-100 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

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
                        {item.label === 'Dashboard' && <Home className="w-4 h-4" />}
                        {item.label === 'Council Seats' && <Users className="w-4 h-4" />}
                        {item.label === 'Member Lounge' && <Trophy className="w-4 h-4" />}
                        {item.label === 'Matrix Bridge' && <Layers className="w-4 h-4" />}
                        {item.label === 'Treasury' && <Coins className="w-4 h-4" />}
                        {item.label === 'Transactions' && <ArrowLeftRight className="w-4 h-4" />}
                        {item.label === 'Profile' && <User className="w-4 h-4" />}
                        {item.label === 'Settings' && <Settings className="w-4 h-4" />}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E2ECF9] space-y-2">
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
    </>
  );
};
