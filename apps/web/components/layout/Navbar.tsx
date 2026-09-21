"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "../../context/AuthContext";
import { LoginRegisterModal } from "../auth/LoginRegisterModal";
import {
  LogoTitan,
  IconMenu,
  IconClose,
  IconChart,
  IconShield,
  IconGrid,
  IconUsers,
  IconAward,
  IconWallet,
  IconLock,
} from "../ui/Icons";

// Navigation links for Authenticated Members
const memberNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: IconChart },
  { href: "/dao", label: "Genesis DAO", icon: IconShield },
  { href: "/matrix", label: "12-Matrix", icon: IconGrid },
  { href: "/referrals", label: "Referrals", icon: IconUsers },
  { href: "/rewards", label: "Rewards", icon: IconAward },
  { href: "/wallet", label: "Wallet", icon: IconWallet },
  { href: "/leaderboard", label: "Leaderboard", icon: IconChart },
];

// Navigation links for Public Visitors (Landing Page)
const visitorNavLinks = [
  { href: "/#dao", label: "Genesis DAO", icon: IconShield },
  { href: "/#matrix", label: "12-Matrix", icon: IconGrid },
  { href: "/#rewards", label: "Magic Box", icon: IconAward },
  { href: "/#faq", label: "FAQ", icon: IconChart },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"register" | "login">("register");

  const openAuth = (tab: "register" | "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const navLinks = isAuthenticated ? memberNavLinks : visitorNavLinks;

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "var(--nav-height)",
          background: "rgba(8, 1, 20, 0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(168, 85, 247, 0.15)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          padding: "0 1.25rem",
        }}
      >
        {/* Centered Constrained Container */}
        <div
          style={{
            maxWidth: "1320px",
            width: "100%",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {/* Brand Logo & Name */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <LogoTitan size={38} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
                className="gradient-text-gold"
              >
                EQUORA_Fi
              </span>
              <span style={{ fontSize: "0.62rem", color: "#a855f7", fontWeight: 700, letterSpacing: "0.12em" }}>
                PROTOCOL • BSC
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#fcd34d" : "#94a3b8",
                    background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    border: isActive ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <Icon size={16} color={isActive ? "#fcd34d" : "#94a3b8"} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => openAuth("login")}
                  className="btn btn-secondary btn-sm desktop-only-btn"
                  style={{ fontWeight: 700 }}
                >
                  Login
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="btn btn-violet btn-sm desktop-only-btn"
                  style={{ fontWeight: 800 }}
                >
                  Register
                </button>
              </>
            ) : (
              <Link href="/dashboard" className="btn btn-secondary btn-sm desktop-only-btn">
                Dashboard
              </Link>
            )}

            {/* RainbowKit Connect Button */}
            <div style={{ flexShrink: 0 }}>
              <ConnectButton
                chainStatus="none"
                accountStatus="avatar"
                showBalance={false}
              />
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
              aria-label="Open navigation menu"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e2e8f0",
                width: 38,
                height: 38,
                borderRadius: "10px",
                cursor: "pointer",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Right-to-Left Slide-in Side Drawer ─────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-side-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                paddingBottom: "0.85rem",
                borderBottom: "1px solid rgba(168, 85, 247, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <LogoTitan size={30} />
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    fontFamily: "var(--font-heading)",
                  }}
                  className="gradient-text-gold"
                >
                  EQUORA_Fi
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e2e8f0",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Nav Links List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#fcd34d" : "#e2e8f0",
                      background: isActive ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                      border: isActive ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon size={18} color={isActive ? "#fcd34d" : "#94a3b8"} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "1.25rem",
                borderTop: "1px solid rgba(168, 85, 247, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuth("register")}
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Register Account
                  </button>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Go to Dashboard
                </Link>
              )}

              <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                BNB Smart Chain • 100% On-Chain
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login & Register Modal */}
      <LoginRegisterModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}
