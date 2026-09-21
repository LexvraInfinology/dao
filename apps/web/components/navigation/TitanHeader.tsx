"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";
import { WalletConnectButton } from "../ui/WalletConnectButton";
import { TitanBot } from "../titanbot/TitanBot";
import { useI18n } from "../../services/i18n/I18nContext";

const NAV_ITEMS = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: "dashboard" },
  { path: "/matrix", labelKey: "nav.matrix", icon: "grid_view" },
  { path: "/dao", labelKey: "nav.dao", icon: "account_balance" },
  { path: "/wallet", labelKey: "nav.wallet", icon: "account_balance_wallet" },
  { path: "/rewards", labelKey: "nav.rewards", icon: "token" },
  { path: "/referrals", labelKey: "nav.referrals", icon: "group_add" },
  { path: "/leaderboard", labelKey: "nav.leaderboard", icon: "leaderboard" },
];

export function TitanHeader() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { t } = useI18n();
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-16 bg-background/90 backdrop-blur-2xl border-b border-outline-variant/15 z-40 flex items-center justify-between px-2.5 sm:px-6 lg:px-8 transition-all ${
          isLanding ? "left-0" : "left-0 lg:left-[280px]"
        }`}
      >
        {/* Left Area: Mobile Menu Toggle & Brand (on mobile) or Search Bar (on desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 text-on-surface-variant max-w-md min-w-0">
          {!isLanding && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
              aria-label="Open mobile menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
          )}

          {/* Mobile Logo on internal pages */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#0a1120] border border-tertiary/30 shadow-md p-0.5">
              <img
                src="/assets/branding/equorafilogo.jpeg"
                alt="Equora Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <span className="hidden sm:inline font-headline-md text-sm font-black text-on-surface uppercase tracking-tight">
              EQUORA.FI
            </span>
          </Link>

          {!isLanding && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 text-xs w-64 lg:w-72 text-outline focus-within:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">search</span>
              <input
                type="text"
                placeholder={t("nav.search")}
                className="bg-transparent border-none outline-none text-xs text-on-surface w-full placeholder:text-outline"
              />
            </div>
          )}
        </div>

        {/* Right Area: Status, Language, Theme, Assistant, Wallet */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Node Connectivity Status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-primary font-code uppercase tracking-wider">
              CA-WEST NODE
            </span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* TitanBot Assistant Trigger (desktop) */}
          <div
            onClick={() => setShowAssistantModal(true)}
            className="hidden md:flex cursor-pointer hover:scale-105 transition-transform shrink-0"
            title="Equora Assistant Support"
          >
            <TitanBot variant="mini" interactive={false} />
          </div>

          {/* Wallet Connect Button */}
          <WalletConnectButton />
        </div>
      </header>

      {/* ─── Mobile / Tablet Drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-primary-container border-r border-outline-variant/20 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Brand & Close */}
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#0a1120] border border-tertiary/30 shadow-md p-0.5 shrink-0">
                    <img
                      src="/assets/branding/equorafilogo.jpeg"
                      alt="Equora Logo"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div>
                    <span className="font-headline-md text-base font-black text-on-surface uppercase block">
                      EQUORA.FI
                    </span>
                    <span className="text-[10px] font-label-md text-tertiary tracking-widest uppercase font-bold">
                      SOVEREIGN PROTOCOL
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-surface-container text-outline hover:text-on-surface"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-surface-variant text-primary border-l-4 border-secondary-container font-bold"
                          : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-outline-variant/15 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2 font-code">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Node: CA-WEST Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Assistant Support Modal ──────────────────────────────────────── */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAssistantModal(false)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 text-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-4">
              <TitanBot variant="companion" state="welcome" interactive={false} />
              <div>
                <h3 className="text-base font-bold text-on-surface">Equora AI Assistant</h3>
                <p className="text-xs text-primary font-code">Autonomous Protocol Support</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest/80 rounded-2xl p-4 text-xs text-on-surface-variant space-y-2.5 border border-outline-variant/20 mb-5">
              <p>🇨🇦 <strong>Canadian Institutional Standards:</strong> 100% decentralized non-custodial execution.</p>
              <p>⚡ <strong>Genesis DAO:</strong> 100 founding seats receive 100% instant push payouts directly to your connected wallet.</p>
              <p>🔢 <strong>12-Slot Matrix:</strong> 14-node binary hierarchy with auto-upgrades and 3-year Magic Box milestone locks.</p>
            </div>
            <button
              onClick={() => setShowAssistantModal(false)}
              className="w-full py-3.5 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider hover:bg-secondary-container/90 transition-colors shadow-md"
            >
              Close Assistant
            </button>
          </div>
        </div>
      )}
    </>
  );
}
