"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, LogOut, ShieldCheck, Wallet, LayoutDashboard } from "lucide-react";
import { HeroVideo } from "./HeroVideo";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useUserStore } from "@/lib/stores";
import {
  hasTrobSafeProvider,
  connectTrobSafe,
  getInjectedAuthorizedAccount,
} from "@/lib/web3Wallet";
import { wakeUpExtension } from "@/lib/walletConnect";
import { getStoredUserAddress } from "@/lib/api";
import { toast } from "@/lib/toast";
import { formatAddress, toTrobBase58 } from "@/lib/format";
import { isUserRegisteredInMatrix } from "@/lib/contracts";

export function HeroSection() {
  const router = useRouter();
  const address = useUserStore((s) => s.address);
  const setAddress = useUserStore((s) => s.setAddress);
  const disconnect = useUserStore((s) => s.disconnect);
  const [mounted, setMounted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("#about");
  const walletDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for wallet dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(e.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    if (walletDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [walletDropdownOpen]);

  // Read existing wallet if user did not explicitly disconnect
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("equora_wallet_explicit_disconnect") === "true") {
      return;
    }
    const existing = getInjectedAuthorizedAccount() || getStoredUserAddress();
    if (existing && existing.startsWith("0x")) {
      setAddress(existing);
    }
  }, [setAddress]);

  // Check on-chain if current address is already a registered member
  useEffect(() => {
    let isCurrent = true;
    if (!address) {
      setIsRegistered(false);
      return;
    }
    isUserRegisteredInMatrix(address)
      .then((reg) => {
        if (isCurrent) setIsRegistered(reg);
      })
      .catch(() => {
        if (isCurrent) setIsRegistered(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [address]);

  // Navigate to Dashboard if active, else Matrix Access Gate
  const handleEnterMatrix = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("equora_wallet_explicit_disconnect");
    }
    if (address) {
      const isReg = await isUserRegisteredInMatrix(address);
      if (isReg) {
        router.push("/dashboard");
      } else {
        router.push("/gate");
      }
      return;
    }
    handleConnectClick();
  };

  const handleConnectClick = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("equora_wallet_explicit_disconnect");
    }
    wakeUpExtension();
    if (hasTrobSafeProvider()) {
      try {
        const connected = await connectTrobSafe();
        if (connected && connected.startsWith("0x")) {
          setAddress(connected);
          toast.success("Wallet Connected", `Active: ${formatAddress(connected)}`);
          const isReg = await isUserRegisteredInMatrix(connected);
          if (isReg) {
            router.push("/dashboard");
          } else {
            router.push("/gate");
          }
          return;
        }
      } catch (err: any) {
        console.warn("[Landing] Direct connect notice:", err);
      }
    }
    setWalletModalOpen(true);
  };

  const handleCopyAddress = () => {
    if (!address) return;
    const b58 = toTrobBase58(address);
    navigator.clipboard.writeText(b58 || address);
    setCopied(true);
    toast.copy(formatAddress(b58 || address), "Wallet Address");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnectWallet = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("equora_wallet_explicit_disconnect", "true");
      localStorage.removeItem("equora_auth_address");
      localStorage.removeItem("trobsafe_address");
      localStorage.removeItem("equora_matrix_address");
      localStorage.removeItem("equora_user_address");
      localStorage.removeItem("walletconnect");
      if (address) {
        localStorage.removeItem(`equora_matrix_registered_${address.toLowerCase()}`);
      }
    }
    setAddress("");
    setIsRegistered(false);
    disconnect();
    setWalletDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.info("Wallet Disconnected", "Active wallet disconnected successfully.");
    window.location.href = "/";
  };



  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Levels", href: "#levels" },
    { label: "Activity", href: "#activity" },
    { label: "Pools", href: "#pools" },
  ];

  // Track scroll position to update navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling & close on Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ────────────── FIXED TOP NAVBAR ────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-md border-b border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] py-3 sm:py-3.5"
            : "bg-white/60 backdrop-blur-md border-b border-white/50 py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="relative flex items-center group py-1">
                <Image
                  src="/equora-logo.png"
                  alt="EQUORA.FI"
                  width={184}
                  height={42}
                  priority
                  className="h-8 sm:h-9 md:h-10 lg:h-[42px] w-auto object-contain transition-all duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute left-[24.3%] bottom-0 sm:bottom-[1px] text-[7.5px] sm:text-[8.5px] md:text-[9.5px] lg:text-[10px] font-extrabold text-[#0279e3] tracking-[0.24em] uppercase leading-none select-none pointer-events-none">
                  Matrix
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
              {navLinks.map((link) => {
                const isActive = activeNav === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setActiveNav(link.href)}
                    className={`text-sm font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? "text-blue-600 font-bold"
                        : "text-slate-700 hover:text-blue-600"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Right Action Button & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Connect / Active Wallet Dropdown Button - Visible on ALL screens including mobile */}
              <div className="relative" ref={walletDropdownRef}>
                {mounted && address && isRegistered ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#1d69f0] to-[#0279e3] hover:from-blue-700 hover:to-blue-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                    id="header-dashboard-link"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    <span>Dashboard</span>
                    <span className="text-[11px] font-bold">→</span>
                  </Link>
                ) : mounted && address ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setWalletDropdownOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3.5 sm:py-2 rounded-xl bg-[#0b132b] hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer border border-slate-700/60 max-w-[130px] sm:max-w-none"
                      title="Manage Wallet"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="font-mono text-xs hidden sm:inline">{formatAddress(address)}</span>
                      <span className="font-mono text-[11px] font-bold sm:hidden truncate">{toTrobBase58(address).slice(0, 4)}…{toTrobBase58(address).slice(-3)}</span>
                      <svg
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${walletDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {walletDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.18)] p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Network Badge */}
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            TrobChain Testnet
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px]">
                            13000
                          </span>
                        </div>

                        {/* Account Address Card */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-3">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                            Connected Account
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-slate-800 font-bold truncate">
                              {toTrobBase58(address) || address}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyAddress}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                              title="Copy Address"
                            >
                              {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Action Link: Direct to Dashboard */}
                        <div className="space-y-1.5 mb-2">
                          <button
                            type="button"
                            onClick={async () => {
                              setWalletDropdownOpen(false);
                              if (address) {
                                const isReg = await isUserRegisteredInMatrix(address);
                                if (isReg) {
                                  router.push("/dashboard");
                                } else {
                                  router.push("/gate");
                                }
                              }
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold transition-colors group cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              Go to Matrix Dashboard
                            </span>
                            <span className="text-[11px] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                          </button>
                        </div>

                        {/* Disconnect Button */}
                        <button
                          type="button"
                          onClick={handleDisconnectWallet}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 text-xs font-bold transition-all cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectClick}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#0b132b] hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8]" />
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden text-xs">Connect</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:bg-white active:scale-90 transition-all shrink-0 cursor-pointer"
                aria-label="Open Menu"
                suppressHydrationWarning
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ────────────── RIGHT SLIDE-OVER DRAWER MENU ────────────── */}
      {/* High-performance GPU accelerated backdrop overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 z-[99] lg:hidden transition-opacity duration-200 ease-out will-change-[opacity] ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Right Drawer Panel - Naturally aligned from top, balanced spacing, clean button gap */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[100] w-[80vw] max-w-[320px] sm:max-w-[340px] h-[100dvh] max-h-[100dvh] bg-white shadow-[-16px_0_40px_rgba(15,23,42,0.18)] flex flex-col justify-between p-5 sm:p-6 lg:hidden transform-gpu transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform overflow-hidden ${
          mobileMenuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Top Content Block: Close Button & Navigation Links */}
        <div className="flex flex-col">
          {/* Top Bar: Logo & Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative flex items-center group">
              <Image
                src="/equora-logo.png"
                alt="EQUORA.FI"
                width={140}
                height={32}
                className="h-7 w-auto object-contain"
              />
              <span className="absolute left-[24.3%] bottom-0 text-[7px] font-extrabold text-[#0279e3] tracking-[0.24em] uppercase leading-none select-none pointer-events-none">
                Matrix
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
              aria-label="Close Menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links - Natural top alignment matching reference */}
          <nav className="flex flex-col space-y-2 pt-1">
            {navLinks.map((link) => {
              const isActive = activeNav === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveNav(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`group flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-2xl text-[15px] font-bold transition-all ${
                    isActive
                      ? "bg-[#edf5ff] text-[#2563eb]"
                      : "text-slate-800 hover:text-[#2563eb] hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span>{link.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isActive ? "text-[#2563eb]" : "text-slate-400 group-hover:text-[#2563eb]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Action Section: Connected details or Connect button */}
        <div className="pt-4 pb-1 sm:pb-2 border-t border-slate-100 mt-auto shrink-0 space-y-2">
          {mounted && address ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Active Wallet
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs text-slate-800 font-bold truncate">
                    {formatAddress(address)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Link
                href={isRegistered ? "/dashboard" : "/gate"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-[#1d69f0] hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer text-center"
              >
                {isRegistered ? (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Matrix Access Gate</span>
                  </>
                )}
              </Link>

              <button
                type="button"
                onClick={handleDisconnectWallet}
                className="w-full py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleConnectClick();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1d69f0] hover:bg-blue-700 active:scale-[0.98] text-white text-[15px] font-bold flex items-center justify-center gap-2.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Wallet className="w-5 h-5 text-white" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* ────────────── HERO SECTION ────────────── */}
      <section className="relative w-full overflow-hidden bg-[#eef4fb] pt-14 sm:pt-16 lg:pt-18 min-h-[580px] sm:min-h-0">
        {/* Mobile Background Video: Boy with dog video in background on mobile (< md) */}
        <div className="absolute inset-0 pointer-events-none z-0 md:hidden overflow-hidden">
          <video
            src="/hero_section.mp4"
            poster="/hero-character-cropped.png"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-[center_18%] opacity-35"
          />
          {/* Translucent overlay so text is crisp and 100% readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#eef4fb]/85 via-[#eef4fb]/70 to-[#f1f5f9]/95" />
        </div>

        {/* Desktop Background Image: High-res snowy peaks + sunrise clouds matching Figma */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
          <Image
            src="/e6a310ebbc2aa55ae6bf2a597fa3630383efedbb.png"
            alt="Equora Hero Background"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle bottom fade to seamlessly blend into section 2 */}
          <div className="absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-b from-transparent to-[#f1f5f9]/90" />
        </div>

        {/* ────────────── HERO MAIN CONTENT ────────────── */}
        <div className="relative z-10 max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4 lg:py-5">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {/* Left Content Column */}
            <div className="w-full md:w-auto md:max-w-[430px] lg:max-w-[480px] xl:max-w-[510px] flex flex-col items-start text-left shrink-0 z-10">
              {/* Eyebrow - Plain text, wide tracking, no pill */}
              <div className="text-xs sm:text-[12px] font-bold tracking-[0.2em] text-[#0f172a] uppercase mb-1.5 sm:mb-2">
                MATRIX PLATFORM
              </div>

              {/* Title - Exact typography and period */}
              <h1 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[38px] xl:text-[42px] font-black text-[#0b132b] leading-[1.12] tracking-tight mb-2.5 sm:mb-3">
                The Matrix <br />
                <span className="text-[#2563eb]">Built to Move.</span>
              </h1>

              {/* Subtitle - Exact copy from Figma */}
              <p className="text-xs sm:text-[14px] text-slate-700 max-w-[420px] lg:max-w-[450px] leading-relaxed mb-4 sm:mb-5">
                Start with just $30 USD and step into a 12-slot progression
                system. Grow your network, unlock higher tiers automatically, and
                earn real rewards on-chain.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 sm:gap-4.5 mb-5 sm:mb-6 w-full flex-nowrap">
                {/* Primary: Start Now → Direct Matrix Buy Gate */}
                <button
                  type="button"
                  onClick={handleEnterMatrix}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white font-semibold text-xs sm:text-base inline-flex items-center gap-1.5 sm:gap-2 shadow-md shadow-blue-500/25 transition-all hover:gap-3 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <span>{isRegistered ? "Enter Dashboard" : "Start Now"}</span>
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>

                {/* Secondary: Watch Our Story (displays 'Watch' on mobile to stay on one single row) */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("about");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center group cursor-pointer shrink-0 whitespace-nowrap"
                  suppressHydrationWarning
                >
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#0b132b] group-hover:scale-105 transition-transform shrink-0">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="ml-2 sm:ml-3 text-xs sm:text-base font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    <span className="sm:hidden">Watch</span>
                    <span className="hidden sm:inline">Watch Our Story</span>
                  </span>
                </button>
              </div>

              {/* Hero Stats Row - Exact Figma copy and numbers */}
              <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 lg:gap-7 pt-4 sm:pt-5 border-t border-slate-200/70 w-full max-w-md">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b132b] tracking-tight">
                    600%
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Return on Slot 1
                  </div>
                </div>

                <div className="w-px h-9 bg-slate-300/80" />

                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b132b] tracking-tight">
                    12
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Progressive Slots
                  </div>
                </div>

                <div className="w-px h-9 bg-slate-300/80" />

                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b132b] tracking-tight">
                    14
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Node Matrix
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Column - Hero Video on Desktop (hidden on mobile since video is the background) */}
            <div className="hidden md:flex md:w-auto md:mx-0 items-center justify-center shrink-0 mt-3 md:mt-0">
              <HeroVideo />
            </div>
          </div>
        </div>
      </section>

      {/* Safe Read-Only Wallet Connection & Test Account Modal */}
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentAddress={address || undefined}
        onSelectAddress={async (newAddr) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("equora_wallet_explicit_disconnect");
          }
          setAddress(newAddr);
          setWalletModalOpen(false);
          const isReg = await isUserRegisteredInMatrix(newAddr);
          if (isReg) {
            router.push("/dashboard");
          } else {
            router.push("/gate");
          }
        }}
        onDisconnect={handleDisconnectWallet}
      />
    </>
  );
}
