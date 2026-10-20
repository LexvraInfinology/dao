'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Send, Twitter, Check } from 'lucide-react';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { EXPLORER_BASE_URL, WHATSAPP_DAO_GROUP_URL } from '@/config/env';

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

  const ecosystemLinks = [
    { label: 'Genesis Queue', href: '/#queue', external: false },
    { label: 'Simulator', href: '/#simulator', external: false },
    { label: 'Live Activity', href: '/#activity', external: false },
    { label: 'TrobChain Network', href: '/#trobchain', external: false },
    { label: 'TrobSafe Wallet', href: '/trobsafe', external: false },
  ];

  const daoLinks = [
    { label: 'Member Lounge', href: '/dao/lounge', external: false },
    { label: '100 Council Seats', href: '/dao/seats', external: false },
    { label: 'Matrix Structure', href: '/dao/matrix', external: false },
    { label: 'Protocol Treasury', href: '/dao/treasury', external: false },
    { label: 'Launch Dashboard', href: '/dao', external: false },
  ];

  const resourceLinks = [
    { label: 'Security & Audit', href: '/audit', external: false },
    { label: 'TrobiumScan Explorer', href: EXPLORER_BASE_URL, external: true },
    { label: 'Telegram Community', href: 'https://t.me/EquoraFi', external: true },
    { label: 'WhatsApp Channel', href: WHATSAPP_DAO_GROUP_URL, external: true },
  ];

  return (
    <footer className="relative pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#EAF2FF] to-[#DCE9FF]">
      {/* Background Cosmic Mountain Artwork */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/landing/footer-cosmic.webp"
          alt="Cosmic Mountain Landscape"
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-[center_70%] sm:object-bottom"
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/70 to-transparent" />
      </div>

      <div className="max-w-[1360px] mx-auto px-3 min-[360px]:px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Crisp Frosted Footer Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-white/95 sm:bg-white/90 border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
          
          {/* 1. TOP DIVIDED SECTION: Brand Identity & Social Channels */}
          <div className="pb-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                  <EquoraLogo className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_2px_8px_rgba(21,94,239,0.3)] transition-transform group-hover:scale-105 duration-200" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-wide uppercase text-[#0F172A]">
                    EQUORA<span className="text-[#155EEF]">.FI</span>
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#155EEF] border border-blue-200/70 uppercase">
                    DAO
                  </span>
                </div>
              </Link>
              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
                The sovereign decentralized autonomous organization powered by 100 genesis council members. Built on TrobChain.
              </p>
            </div>

            {/* Social Icons & Status */}
            <div className="flex items-center gap-2.5 shrink-0 pt-1 md:pt-0">
              <a
                href="https://x.com/EquoraFi"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100/90 hover:bg-blue-50 hover:text-[#155EEF] text-[#475467] flex items-center justify-center transition-all shadow-2xs group border border-slate-200/60"
                aria-label="Twitter / X"
                title="Follow on Twitter / X"
              >
                <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://t.me/EquoraFi"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100/90 hover:bg-sky-50 hover:text-[#0088cc] text-[#475467] flex items-center justify-center transition-all shadow-2xs group border border-slate-200/60"
                aria-label="Telegram"
                title="Join Telegram Community"
              >
                <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={WHATSAPP_DAO_GROUP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100/90 hover:bg-emerald-50 hover:text-[#25D366] text-[#475467] flex items-center justify-center transition-all shadow-2xs group border border-slate-200/60"
                aria-label="WhatsApp Channel"
                title="Official WhatsApp Channel"
              >
                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 2. MIDDLE DIVIDED SECTION: 3-Column Clean Navigation Grid + Newsletter */}
          <div className="grid grid-cols-2 min-[640px]:grid-cols-3 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Nav Column 1: Ecosystem */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#0B132B] uppercase tracking-wider font-inter">
                Ecosystem
              </h4>
              <ul className="space-y-2">
                {ecosystemLinks.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs sm:text-[13px] font-medium text-[#475467] hover:text-[#155EEF] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs sm:text-[13px] font-medium text-[#475467] hover:text-[#155EEF] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Nav Column 2: Genesis DAO & Governance */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#0B132B] uppercase tracking-wider font-inter">
                Genesis DAO
              </h4>
              <ul className="space-y-2">
                {daoLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-[13px] font-medium text-[#475467] hover:text-[#155EEF] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nav Column 3: Resources & Trust */}
            <div className="col-span-2 min-[640px]:col-span-1 lg:col-span-3 space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#0B132B] uppercase tracking-wider font-inter">
                Resources
              </h4>
              <ul className="space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs sm:text-[13px] font-medium text-[#475467] hover:text-[#155EEF] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs sm:text-[13px] font-medium text-[#475467] hover:text-[#155EEF] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Stay in the loop */}
            <div className="col-span-2 min-[640px]:col-span-3 lg:col-span-3 space-y-3 pt-2 lg:pt-0">
              <h4 className="text-[11px] sm:text-xs font-bold text-[#0B132B] uppercase tracking-wider font-inter">
                Stay In The Loop
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Subscribe for Genesis queue distributions and protocol announcements.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:border-[#155EEF] shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 w-8 rounded-lg bg-[#155EEF] hover:bg-[#004EEB] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subscribed && (
                  <div className="text-[11px] text-[#027A48] font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>You are subscribed!</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* 3. BOTTOM DIVIDED SECTION: Copyright, Legal & Compliance */}
          <div className="pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-medium">
              <Link href="/privacy" className="hover:text-[#155EEF] transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms" className="hover:text-[#155EEF] transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/audit" className="hover:text-[#155EEF] transition-colors">
                Security Audit
              </Link>
            </div>

            <div className="text-[11px] text-slate-400 text-center sm:text-right">
              © 2026 EQUORA DAO. All rights reserved. Built on TrobChain.
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
