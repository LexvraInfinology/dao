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
          priority
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

              {/* 5 Social Icons (Figma Exact: Discord, X, Instagram, YouTube, LinkedIn) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* 1. Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="Discord"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>

                {/* 2. X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="X (formerly Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* 3. Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>

                {/* 4. YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* 5. LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Product (Figma Exact) */}
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
                    Activity
                  </Link>
                </li>
                <li>
                  <Link href="#pools" className="hover:text-blue-600 transition-colors">
                    Pools
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-blue-600 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company (Figma Exact) */}
            <div className="lg:col-span-1">
              <h4 className="text-sm sm:text-[15px] font-bold text-[#0b132b] mb-3.5 sm:mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                <li>
                  <Link href="/about" className="hover:text-blue-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-blue-600 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-blue-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:text-blue-600 transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources (Figma Exact) */}
            <div className="lg:col-span-1">
              <h4 className="text-sm sm:text-[15px] font-bold text-[#0b132b] mb-3.5 sm:mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                <li>
                  <Link href="/help" className="hover:text-blue-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-blue-600 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-blue-600 transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                    Privacy Policy
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
