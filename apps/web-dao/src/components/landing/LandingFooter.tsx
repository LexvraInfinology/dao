'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Send, Twitter, Disc as Discord, Github } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const productLinks = [
    { label: 'Genesis Queue', href: '#queue' },
    { label: 'Simulator', href: '#simulator' },
    { label: 'TrobChain', href: '#trobchain' },
    { label: 'Retail Matrix', href: '/dao' },
    { label: 'Governance', href: '/dao' },
  ];

  const companyLinks = [
    { label: 'About', href: '#about' },
    { label: 'Manifesto', href: '#about' },
    { label: 'Brand Assets', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ];

  const resourceLinks = [
    { label: 'Docs', href: '#' },
    { label: 'Whitepaper', href: '#' },
    { label: 'TrobiumScan', href: 'https://trobiumscan.io' },
    { label: 'GitHub', href: '#' },
    { label: 'Security Audit', href: '#' },
  ];

  return (
    <footer className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#EAF2FF] to-[#DCE9FF]">
      {/* Background Cosmic Mountain Artwork */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/footer-cosmic.png"
          alt="Cosmic Mountain Landscape"
          fill
          className="object-cover object-bottom"
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/70 to-transparent" />
      </div>

      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Frosted Glass Footer Card */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-200/80">
            {/* Column 1: Brand & Socials (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8L16 12L12 16L8 12L12 8Z" fill="white"/>
                  </svg>
                </div>
                <span className="text-[18px] font-bold font-inter tracking-tight text-[#0F172A]">
                  EQUORA<span className="text-[#0052FF]">_FI</span>
                </span>
              </Link>

              <p className="text-xs sm:text-[13px] text-[#475467] leading-relaxed font-inter max-w-sm">
                The sovereign decentralized autonomous organization powered by 100 genesis council members. Built on TrobChain.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#155EEF] text-[#475467] flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#155EEF] text-[#475467] flex items-center justify-center transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#155EEF] text-[#475467] flex items-center justify-center transition-colors"
                  aria-label="Discord"
                >
                  <Discord className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#155EEF] text-[#475467] flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Product (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-xs font-bold font-inter text-[#0B132B] uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs sm:text-[13px] text-[#475467] hover:text-[#155EEF] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Company (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-xs font-bold font-inter text-[#0B132B] uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs sm:text-[13px] text-[#475467] hover:text-[#155EEF] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Resources (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-xs font-bold font-inter text-[#0B132B] uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs sm:text-[13px] text-[#475467] hover:text-[#155EEF] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Stay in the loop (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-xs font-bold font-inter text-[#0B132B] uppercase tracking-wider">
                Stay In The Loop
              </h4>
              <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed">
                Subscribe for Genesis updates and protocol alerts.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:border-[#155EEF] shadow-xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 w-8 rounded-lg bg-[#155EEF] hover:bg-[#004EEB] text-white flex items-center justify-center shadow-xs transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subscribed && (
                  <div className="text-[11px] text-[#027A48] font-medium">
                    ✓ Thank you for subscribing!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div>
              © 2026 EQUORA DAO. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#0B132B] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#0B132B] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[#0B132B] transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
