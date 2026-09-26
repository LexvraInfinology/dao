'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, Download, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export const LandingTrobSafeDownload: React.FC = () => {
  return (
    <section id="download-wallet" className="relative py-16 sm:py-24 bg-white border-t border-b border-slate-200/80 overflow-hidden font-inter">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-500/5 via-sky-400/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-14">
          
          {/* ── Left Column: Downloads & Actions ── */}
          <div className="space-y-6">
            {/* Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-bold text-[#155EEF] uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Wallet</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#071A4A] tracking-tight leading-[1.08] uppercase">
                Download <span className="text-[#155EEF]">TrobSAFE</span>
              </h2>
              <p className="text-sm sm:text-base text-[#475467] leading-relaxed max-w-xl">
                The official Trobium wallet for Android and iOS. Store, send, and receive TROB from one trusted place — or install the Android APK directly to access the EQUORA Genesis DAO.
              </p>
            </div>

            {/* Store & APK Cards Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {/* Android APK */}
              <a
                href="/downloads/trobsafe.apk"
                download="trobsafe.apk"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A4A] text-white p-2 shadow-xs group-hover:bg-[#155EEF] transition-colors">
                  <img src="/icons/android.svg" alt="Android" className="w-6 h-6 object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B]">
                    Download for
                  </span>
                  <span className="block text-sm font-bold text-[#071A4A] group-hover:text-[#155EEF] transition-colors">
                    Android APK
                  </span>
                </span>
              </a>

              {/* App Store */}
              <a
                href="https://apps.apple.com/app/trobsafe/id0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A4A] text-white p-2.5 shadow-xs">
                  <img src="/icons/apple.svg" alt="App Store" className="w-5 h-5 object-contain fill-white" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B]">
                    Download on the
                  </span>
                  <span className="block text-sm font-bold text-[#071A4A]">
                    App Store
                  </span>
                </span>
              </a>

              {/* Google Play */}
              <a
                href="https://trobium.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 p-2 border border-slate-200 shadow-xs">
                  <img src="/icons/google-play.svg" alt="Google Play" className="w-5 h-5 object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B]">
                    Get it on
                  </span>
                  <span className="block text-sm font-bold text-[#071A4A]">
                    Google Play
                  </span>
                </span>
              </a>

              {/* Extension */}
              <Link
                href="/trobsafe/install"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#EFF6FF]/60 hover:bg-[#EFF6FF] border border-[#BFDBFE] shadow-xs hover:shadow-md transition-all group cursor-pointer"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#155EEF] text-white p-2 shadow-xs">
                  <Download className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-[#155EEF]">
                    Web Browser
                  </span>
                  <span className="block text-sm font-bold text-[#071A4A]">
                    Chrome Extension
                  </span>
                </span>
              </Link>
            </div>

            {/* Big Primary APK Download Button */}
            <div className="pt-2 space-y-2">
              <a
                href="/downloads/trobsafe.apk"
                download="trobsafe.apk"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_24px_rgba(21,94,239,0.35)] hover:shadow-[0_12px_28px_rgba(21,94,239,0.45)] transition-all duration-200 cursor-pointer w-full sm:w-auto text-center"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD APK</span>
                <span className="font-semibold opacity-90 text-xs">· v1.0.22</span>
              </a>
              <p className="text-[11px] text-[#64748B]">
                Direct Android install (Android package · ~81MB). Enable &ldquo;Install unknown apps&rdquo; if your device asks.
              </p>
            </div>
          </div>

          {/* ── Right Column: TrobSafe Feature Card (Matches user screenshot) ── */}
          <div className="relative rounded-3xl bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2ECF9] shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-6 sm:p-8 lg:p-10 overflow-hidden">
            {/* Subtle glow circle */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-blue-400/15 to-transparent blur-2xl pointer-events-none" />

            <div className="relative flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center drop-shadow-md">
                <img
                  src="/trobsafe/trobsafe-logo.png"
                  alt="TrobSAFE"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to svg
                    (e.currentTarget as HTMLImageElement).src = '/icons/trobsafe.svg';
                  }}
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#071A4A] tracking-tight uppercase">
                TrobSAFE
              </h3>

              <p className="text-xs sm:text-sm text-[#475467] leading-relaxed max-w-sm">
                Secure wallet for the Trobium network — built for everyday users and institutional workflows.
              </p>

              {/* Security Badge */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Keys stay on your device</span>
              </div>
            </div>

            {/* Steps List */}
            <ol className="relative mt-8 space-y-4 border-t border-slate-200/80 pt-6 text-left">
              <li className="flex items-start gap-3.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#071A4A]/10 text-xs font-black text-[#071A4A] font-mono">
                  1
                </span>
                <div>
                  <span className="block text-xs font-bold text-[#071A4A]">Install</span>
                  <span className="block text-[11px] leading-relaxed text-[#64748B] mt-0.5">
                    Download the Android APK or get TrobSAFE from the App Store when available.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#071A4A]/10 text-xs font-black text-[#071A4A] font-mono">
                  2
                </span>
                <div>
                  <span className="block text-xs font-bold text-[#071A4A]">Secure your keys</span>
                  <span className="block text-[11px] leading-relaxed text-[#64748B] mt-0.5">
                    Create or restore a wallet. Your private keys never leave your device.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#071A4A]/10 text-xs font-black text-[#071A4A] font-mono">
                  3
                </span>
                <div>
                  <span className="block text-xs font-bold text-[#071A4A]">Manage TROB</span>
                  <span className="block text-[11px] leading-relaxed text-[#64748B] mt-0.5">
                    Send, receive, and track balances with transparent network state.
                  </span>
                </div>
              </li>
            </ol>
          </div>

        </div>
      </div>
    </section>
  );
};
