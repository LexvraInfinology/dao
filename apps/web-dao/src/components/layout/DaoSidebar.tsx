'use client';

import React from 'react';
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
  ArrowRight,
  Hexagon,
  Shield,
} from 'lucide-react';
import { DAO_NAV_ITEMS } from '@/data/navigation';
import { EquoraLogo } from '@/components/ui/EquoraLogo';

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

export const DaoSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-[248px] shrink-0 bg-[#FBFCFF] border-r border-[#E2ECF9] hidden lg:flex flex-col justify-between p-4 min-h-screen sticky top-0 z-30 select-none">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="px-2 pt-2">
          <Link href="/dao" className="flex items-center gap-3 group">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <EquoraLogo className="w-9 h-9 drop-shadow-[0_2px_8px_rgba(21,94,239,0.3)] transition-transform group-hover:scale-105 duration-200" />
            </div>
            <div>
              <div className="text-sm font-black font-inter tracking-tight text-[#071A4A] leading-tight">
                EQUORA<span className="text-[#155EEF]">.FI</span>
              </div>
              <div className="text-[10px] font-semibold font-inter text-[#155EEF] tracking-wider">
                GENESIS DAO
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Menu (8 items from Figma) */}
        <nav className="space-y-1">
          {DAO_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dao' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-jakarta transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EEF5FF] text-[#071A4A] font-bold shadow-xs'
                    : 'text-[#60739A] font-medium hover:text-[#071A4A] hover:bg-slate-100/70'
                }`}
              >
                <span className={isActive ? 'text-[#155EEF]' : 'text-[#94A3B8]'}>
                  {NAV_ICONS[item.label] || <Shield className="w-4 h-4" />}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Card from Figma (215x187) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#2B71F8] to-[#1447E6] p-4 text-white shadow-[0_10px_25px_rgba(37,99,235,0.22)] min-h-[175px] flex flex-col justify-between">
        {/* Authentic Background Crystal Container Asset */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
          <img
            src="/dao/Container.png"
            alt="Crystal facet artwork"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <Link
              href="/dao"
              className="w-7 h-7 rounded-full bg-white text-[#155EEF] hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"
              title="Open DAO Portal"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <h4 className="text-[13px] font-bold font-jakarta leading-snug text-white">
            A Stronger Tomorrow,<br />
            Built Together.
          </h4>

          <div className="pt-2 border-t border-white/20 text-[10px] space-y-0.5 text-blue-100 font-jakarta">
            <div className="font-bold text-white tracking-wide">EQUORA_FI</div>
            <div className="text-blue-200/90 text-[9px]">Genesis DAO • dao.equora.fi</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
