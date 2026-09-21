"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useI18n } from "../../services/i18n/I18nContext";

const NAV_ITEMS = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: "dashboard" },
  { path: "/matrix", labelKey: "nav.matrix", icon: "grid_view" },
  { path: "/dao", labelKey: "nav.dao", icon: "account_balance" },
  { path: "/wallet", labelKey: "nav.wallet", icon: "account_balance_wallet" },
  { path: "/rewards", labelKey: "nav.rewards", icon: "token" },
  { path: "/referrals", labelKey: "nav.referrals", icon: "group_add" },
];

export function TitanMobileNav() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { t } = useI18n();

  if (pathname === "/" || !isConnected) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-primary-container/95 backdrop-blur-2xl border-t border-outline-variant/20 z-50 grid grid-cols-6 items-center px-1 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isActive
                ? "text-secondary font-bold scale-105"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            <span className="text-[10px] font-label-md truncate max-w-[50px]">
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
