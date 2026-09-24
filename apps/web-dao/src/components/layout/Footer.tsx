'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_LINKS } from '@/data/navigation';
import { Twitter, MessageSquare, Send, Github, CheckCircle2 } from 'lucide-react';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Twitter: <Twitter className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Send: <Send className="w-4 h-4" />,
  Github: <Github className="w-4 h-4" />,
};

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-[#F0F4F8] pt-16 pb-12 overflow-hidden border-t border-slate-200/80">
      {/* Authentic Footer Texture from Figma (e364e6c91d7fbbffe13f4bb9114abf0a61ec30ba) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 overflow-hidden">
        <Image
          src="/assets/e364e6c91d7fbbffe13f4bb9114abf0a61ec30ba.png"
          alt="EQUORA Footer Texture"
          fill
          className="object-cover object-bottom"
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-200">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-dark to-brand flex items-center justify-center shadow-sm">
                <div className="w-3.5 h-3.5 border-2 border-white rotate-45 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white" />
                </div>
              </div>
              <span className="text-xl font-extrabold font-sora tracking-tight text-navy">
                EQUORA<span className="text-brand">_Fi</span>
              </span>
            </Link>

            <div className="text-[10px] font-bold font-inter text-navy uppercase tracking-widest">
              Higher Ranks. A Brighter Tomorrow.
            </div>

            <p className="text-xs sm:text-sm text-slate-sub font-inter leading-relaxed max-w-sm">
              Join a global community, climb higher and unlock rewards that matter.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-2">
              {FOOTER_LINKS.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-muted hover:text-brand hover:border-brand/40 shadow-sm flex items-center justify-center transition-all"
                >
                  {SOCIAL_ICONS[s.icon]}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold font-sora text-navy">
              Product
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-sub hover:text-navy font-inter transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold font-sora text-navy">
              Company
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-sub hover:text-navy font-inter transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold font-sora text-navy">
              Resources
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-sub hover:text-navy font-inter transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay in the Loop Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold font-sora text-navy">
              Stay in the Loop
            </h4>
            <p className="text-xs text-slate-sub font-inter leading-relaxed">
              Get the latest updates, rewards and more.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2 pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 text-navy placeholder:text-slate-400 focus:outline-none focus:border-brand shadow-sm font-inter"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-navy hover:bg-navy-deep transition-all shadow-sm"
              >
                Subscribe
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium pt-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Thank you for subscribing!</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-muted font-inter">
          <div>
            © {new Date().getFullYear()} EQUORA_Fi Protocol. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#about" className="hover:text-navy transition-colors">
              Manifesto
            </Link>
            <Link href="/dao" className="hover:text-navy transition-colors">
              Genesis DAO
            </Link>
            <Link href="#network" className="hover:text-navy transition-colors">
              Network Hubs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
