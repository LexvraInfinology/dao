"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

interface LandingNavbarProps {
  onOpenAuth: () => void;
}

export function LandingNavbar({ onOpenAuth }: LandingNavbarProps) {
  const { isConnected } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#about" },
    { label: "Levels", href: "#levels" },
    { label: "Pools", href: "#network" },
    { label: "Network", href: "#activity" },
    { label: "Rewards", href: "#rewards" },
    { label: "About", href: "#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F0F4F8]/95 backdrop-blur-md shadow-sm border-b border-[#E2E8F0] py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Logo with official squircle image */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-blue-200 group-hover:scale-105 transition-transform shrink-0">
            <img
              src="/assets/branding/equorafilogo.jpeg"
              alt="EQUORA.FI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-[18px] sm:text-[19px] tracking-tight text-[#0F172A] leading-none">
            EQUORA.FI
          </span>
        </Link>

        {/* Desktop Navigation Links matching Figma */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] lg:text-[14px] font-medium text-[#1E293B] hover:text-[#2563EB] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Button: Connect Wallet matching Figma */}
        <div className="hidden sm:flex items-center gap-3">
          {isConnected ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B1528] text-white font-medium text-[13px] hover:bg-[#1E293B] transition-all shadow-sm"
            >
              <span>Dashboard</span>
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B1528] text-white font-medium text-[13px] hover:bg-[#1E293B] transition-all shadow-sm cursor-pointer hover:shadow-md"
            >
              <svg
                className="w-4 h-4 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M19 7h-1V6a3 3 0 00-3-3H5a3 3 0 00-3 3v12a3 3 0 003 3h14a2 2 0 002-2V9a2 2 0 00-2-2zm-3 8a2 2 0 110-4 2 2 0 010 4z"
                />
              </svg>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-200/50 transition-colors focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 bg-[#F0F4F8] border-b border-slate-200 shadow-xl flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-white hover:text-blue-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            {isConnected ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F172A] text-white font-semibold text-sm"
              >
                <span>Launch App</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F172A] text-white font-semibold text-sm"
              >
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
