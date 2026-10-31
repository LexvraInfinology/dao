"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function FooterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  return (
    <footer className="relative w-full overflow-hidden m-0 p-0 pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20 flex items-center justify-center">
      {/* Background Image: Sci-Fi landscape with planet, towers, red leaves & sunset clouds */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/e364e6c91d7fbbffe13f4bb9114abf0a61ec30ba.png"
          alt="Footer Sci-Fi Landscape"
          fill
          className="object-cover object-center"
        />
        {/* Soft top gradient blend from preceding FAQ section */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#f8fafc] to-transparent" />
      </div>

      {/* Floating Frosted Glass Card Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.2fr_0.75fr_0.75fr_0.85fr_1.45fr] gap-8 lg:gap-6 xl:gap-8 items-start">
            
            {/* Column 1: Brand & Socials (Figma Exact) */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-start">
              {/* Logo & Brand Name */}
              <Link href="/" className="relative inline-flex items-center mb-3.5 group">
                <Image
                  src="/equora-logo.png"
                  alt="EQUORA.FI"
                  width={184}
                  height={42}
                  className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
                <span className="absolute left-[24.3%] bottom-0 sm:bottom-[0.5px] text-[7.5px] sm:text-[8.5px] font-extrabold text-[#0279e3] tracking-[0.24em] uppercase leading-none select-none pointer-events-none">
                  Matrix
                </span>
              </Link>

              {/* Eyebrow Tagline */}
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-[0.14em] uppercase leading-tight mb-2.5">
                HIGHER RANKS,<br />
                A BRIGHTER TOMORROW.
              </div>

              {/* Brand Description */}
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-[210px] mb-6">
                Join a global community, climb higher and unlock rewards that matter.
              </p>

              {/* Social Channels (Matching web-dao footer: Twitter/X & Telegram) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* 1. X / Twitter */}
                <a
                  href="https://x.com/EquoraFi"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-blue-50 text-slate-600 hover:text-blue-600 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="X (formerly Twitter)"
                  title="Follow @EquoraFi on X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* 2. Telegram */}
                <a
                  href="https://t.me/EquoraFi"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-sky-50 text-slate-600 hover:text-[#0088cc] shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="Telegram"
                  title="Join @EquoraFi on Telegram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="lg:col-span-1">
              <h4 className="text-sm sm:text-[15px] font-bold text-[#0b132b] mb-3.5 sm:mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                <li>
                  <Link href="#about" className="hover:text-blue-600 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#levels" className="hover:text-blue-600 transition-colors">
                    Levels
                  </Link>
                </li>
                <li>
                  <Link href="#activity" className="hover:text-blue-600 transition-colors">
                    Live Activity
                  </Link>
                </li>
                <li>
                  <Link href="#pools" className="hover:text-blue-600 transition-colors">
                    Reward Pools
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-blue-600 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="lg:col-span-1">
              <h4 className="text-sm sm:text-[15px] font-bold text-[#0b132b] mb-3.5 sm:mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                <li>
                  <Link href="#about" className="hover:text-blue-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_DAO_URL || "https://equorafidao.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors font-semibold text-blue-600"
                  >
                    Genesis DAO Portal ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://testnet.trobchain.com/#/contract/0x599C88bFdEDC7C7a7d5B726b27dE90fe34B3632A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Matrix Contract ↗
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@equora.fi"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="lg:col-span-1">
              <h4 className="text-sm sm:text-[15px] font-bold text-[#0b132b] mb-3.5 sm:mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                <li>
                  <Link href="/dashboard" className="hover:text-blue-600 transition-colors font-semibold">
                    Matrix Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/transactions" className="hover:text-blue-600 transition-colors">
                    Ledger / Transactions
                  </Link>
                </li>
                <li>
                  <a
                    href="https://testnet.trobchain.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    TrobChain Explorer ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/EquoraFi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Telegram Community ↗
                  </a>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-blue-600 transition-colors">
                    Help & FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Stay in the Loop (Figma Exact) */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-start">
              <h4 className="text-sm sm:text-[15px] font-bold text-[#0b132b] mb-1.5 sm:mb-2">
                Stay in the Loop
              </h4>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mb-4 whitespace-normal sm:whitespace-nowrap">
                Get the latest updates, rewards and more.
              </p>

              <form onSubmit={handleSubscribe} className="flex items-center gap-2.5 w-full max-w-[320px]">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    suppressHydrationWarning
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white/95 border border-slate-100 shadow-sm rounded-full text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2563eb] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all shrink-0 group"
                  aria-label="Subscribe"
                >
                  <svg
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 transform group-hover:translate-x-0.5 transition-transform"
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
              </form>

              {subscribed && (
                <span className="text-[11px] text-emerald-600 font-semibold mt-2.5 flex items-center gap-1">
                  ✓ Thanks for subscribing!
                </span>
              )}
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
