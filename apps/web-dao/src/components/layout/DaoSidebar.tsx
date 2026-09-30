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
  Shield,
} from 'lucide-react';
import { DAO_NAV_ITEMS } from '@/data/navigation';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { DaoWhatsAppCircle } from '@/components/dao/DaoWhatsAppCircle';

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
    <aside className="w-[248px] shrink-0 hidden lg:block select-none">
      <div className="fixed top-0 left-0 w-[248px] h-screen bg-[#FBFCFF] border-r border-[#E2ECF9] flex flex-col justify-between p-4 z-30 overflow-y-auto">
        <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="px-2 pt-2">
          <Link href="/dao" className="flex items-center gap-3 group">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <EquoraLogo className="w-9 h-9 drop-shadow-[0_2px_8px_rgba(21,94,239,0.3)] transition-transform group-hover:scale-105 duration-200" />
            </div>
            <div>
              <div className="text-sm font-black font-inter tracking-tight text-[#17334F] leading-tight">
                EQUORA<span className="text-[#0E62E4]">.FI</span>
              </div>
              <div className="text-[10px] font-semibold font-inter text-[#0E62E4] tracking-wider">
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

      {/* Bottom section with WhatsApp circle badge for verified members */}
      <div className="pt-2">
        <DaoWhatsAppCircle variant="badge" />
      </div>
      </div>
    </aside>
  );
};
