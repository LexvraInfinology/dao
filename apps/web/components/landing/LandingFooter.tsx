"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative py-16 sm:py-24 bg-[#F0F4F8] overflow-hidden">
      {/* Exact Figma Snowy Mountains Panorama Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40">
        <img
          src="/assets/images/Desktop - 9.png"
          alt="EQUORA snowy mountain footer panorama"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F0F4F8] via-transparent to-[#F0F4F8]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        {/* Floating Rounded Frosted Glass Container matching Figma */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E2E8F0] shadow-2xl shadow-black/5 p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E2E8F0]">
            {/* Brand Info & Socials (Column 1) */}
            <div className="lg:col-span-4 flex flex-col items-start">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
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

              <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mb-6 leading-relaxed">
                A decentralized economic protocol built for financial sovereignty, community wealth, and transparent governance.
              </p>

              {/* Social Links matching Figma */}
              <div className="flex items-center gap-2.5">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-8 h-8 rounded-lg bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] flex items-center justify-center transition-all duration-200"
                >
                  <span className="text-xs font-bold">𝕏</span>
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-8 h-8 rounded-lg bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] flex items-center justify-center transition-all duration-200"
                >
                  <span className="text-xs">✈</span>
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                  className="w-8 h-8 rounded-lg bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] flex items-center justify-center transition-all duration-200"
                >
                  <span className="text-xs font-bold">👾</span>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-8 h-8 rounded-lg bg-[#F1F5F9] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#2563EB] flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-3.5">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><a href="#about" className="hover:text-[#2563EB] transition-colors">How It Works</a></li>
                <li><a href="#levels" className="hover:text-[#2563EB] transition-colors">Levels</a></li>
                <li><a href="#network" className="hover:text-[#2563EB] transition-colors">Pools</a></li>
                <li><a href="#network" className="hover:text-[#2563EB] transition-colors">Network</a></li>
                <li><a href="#levels" className="hover:text-[#2563EB] transition-colors">Rewards</a></li>
                <li><a href="#about" className="hover:text-[#2563EB] transition-colors">About</a></li>
              </ul>
            </div>

            {/* Column 3: Network */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-3.5">
                Network
              </h4>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Explorer</span></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Contracts</span></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Docs</span></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">GitHub</span></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Audit</span></li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-3.5">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Help Center</span></li>
                <li><a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Community</span></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Brand Assets</span></li>
                <li><span className="hover:text-[#2563EB] cursor-pointer transition-colors">Terms of Use</span></li>
              </ul>
            </div>

            {/* Column 5: Stay in the loop */}
            <div className="lg:col-span-2 flex flex-col">
              <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-3.5">
                Stay in the loop
              </h4>
              <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">
                Join our newsletter for weekly updates on protocol metrics.
              </p>
              <div className="flex items-center relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full text-xs px-3.5 py-2.5 rounded-full border border-[#E2E8F0] bg-white text-[#0A1628] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] pr-10"
                />
                <button
                  aria-label="Subscribe"
                  className="absolute right-1 w-7 h-7 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors"
                >
                  <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>
              © 2026 EQUORA_Fi Protocol. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[#0A1628] font-semibold">Decentralized Mainnet Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
