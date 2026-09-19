"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { formatAddress } from "../../utils/btitan/formatters";
import { useI18n } from "../../services/i18n/I18nContext";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/matrix", label: "Matrix Slots", icon: "grid_view" },
  { path: "/dao", label: "Genesis DAO", icon: "account_balance" },
  { path: "/wallet", label: "Treasury Wallet", icon: "account_balance_wallet" },
  { path: "/rewards", label: "Rewards & Pools", icon: "token" },
  { path: "/referrals", label: "Partners & Team", icon: "group_add" },
  { path: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
];

export function TitanSidebar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { profile } = useUserProfile(address as `0x${string}`);
  const { t } = useI18n();

  // Hide sidebar on public landing page
  if (pathname === "/") return null;

  const referralCode = profile?.referralCode || (profile?.userId ? profile.userId + 9999 : 10000);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] bg-primary-container border-r border-outline-variant/15 z-50 flex-col pt-8 pb-8 select-none">
      {/* Brand Header with 3D Equora Logo */}
      <div className="px-7 mb-8 flex flex-col gap-2">
        <Link href="/dashboard" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[#0a1120] border border-tertiary/30 shadow-lg shadow-tertiary/10 group-hover:scale-105 transition-all duration-300 shrink-0 p-0.5">
            <img
              src="/assets/branding/equorafilogo.jpeg"
              alt="Equora.Fi Logo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-lg tracking-tight text-on-surface uppercase font-black">
              EQUORA.FI
            </span>
            <span className="text-[10px] font-label-md text-tertiary tracking-widest uppercase font-bold">
              SOVEREIGN PROTOCOL
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-surface-variant text-primary border-l-4 border-tertiary shadow-sm pl-3 font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-[20px] text-tertiary">
                {item.icon}
              </span>
              <span className="text-label-md font-label-md">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Connected Account Chip & 5-Digit ID in Sidebar Footer */}
      <div className="px-6 mt-auto pt-6 border-t border-outline-variant/15">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 font-bold text-xs">
            {isConnected ? "👑" : "⚪"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-label-md font-bold text-on-surface uppercase tracking-wider">
                {isConnected ? "ID" : "Offline"}
              </span>
              {isConnected && (
                <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded font-code font-bold">
                  #{referralCode}
                </span>
              )}
            </div>
            <span className="text-[11px] text-outline font-code truncate">
              {isConnected && address ? formatAddress(address) : "Connect Wallet"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
