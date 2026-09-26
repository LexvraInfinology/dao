'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Download, CheckCircle2, Chrome, ArrowRight, ExternalLink, Smartphone, Zap } from 'lucide-react';

const CHROME_STEPS = [
  {
    num: '01',
    title: 'Download the extension',
    desc: 'Click "Download Browser Extension" below to get the browser extension package (.zip).',
  },
  {
    num: '02',
    title: 'Unzip the package',
    desc: 'Extract the downloaded ZIP file to a permanent folder on your computer — do not delete it.',
  },
  {
    num: '03',
    title: 'Open Chrome Extensions',
    desc: 'In Google Chrome navigate to chrome://extensions and enable Developer Mode (toggle in top-right).',
  },
  {
    num: '04',
    title: 'Load Unpacked',
    desc: 'Click "Load unpacked" and select the extracted folder. TrobSafe will appear in your extension bar.',
  },
  {
    num: '05',
    title: 'Create or import wallet',
    desc: 'Open TrobSafe from the extension bar, create a new wallet or import an existing seed phrase.',
  },
  {
    num: '06',
    title: 'Return to the DAO',
    desc: 'Come back to EQUORA DAO, click "Connect Wallet", and connect your TrobSafe wallet.',
  },
];

const ANDROID_STEPS = [
  {
    num: '01',
    title: 'Download the APK',
    desc: 'Tap "Download Android APK" to save the official trobsafe.apk file to your Android device.',
  },
  {
    num: '02',
    title: 'Allow Installation',
    desc: 'If prompted with "File might be harmful", tap "Download anyway". Enable "Install unknown apps" in Android settings if needed.',
  },
  {
    num: '03',
    title: 'Install TrobSafe',
    desc: 'Open your device downloads, tap trobsafe.apk, and select Install.',
  },
  {
    num: '04',
    title: 'Setup or Import Wallet',
    desc: 'Launch TrobSafe, create a new wallet and save your seed phrase, or import your existing Trobium wallet.',
  },
  {
    num: '05',
    title: 'Access EQUORA via dApp Browser',
    desc: 'Use the in-app Web3 dApp browser inside TrobSafe to navigate to EQUORA DAO and connect instantly.',
  },
];

const FEATURES = [
  'Native Trobium L1 support & EVM compatible',
  'EIP-4361 Sign-In With Ethereum / Trobium (SIWE)',
  'Smart contract interaction (seat minting, matrix rewards)',
  'Soulbound NFT verification & transparent custody',
  'Non-custodial — your private keys stay on your device',
];

export default function TrobSafeInstallPage() {
  const handleDevBypass = () => {
    try {
      sessionStorage.setItem('equora_dao_preview', 'true');
      localStorage.setItem('equora_dev_mode', 'true');
      document.cookie = 'equora_dev_mode=true; path=/; max-age=86400';
    } catch { /* ignore */ }
    window.location.href = '/dao?dev=1';
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A4A] font-jakarta">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E2ECF9] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-[#071A4A] p-1.5 flex items-center justify-center shadow-xs">
            <img src="/icons/trobsafe.svg" alt="TrobSafe" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-[#071A4A] text-sm tracking-tight">
            TrobSafe <span className="text-[#155EEF]">Wallet Hub</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDevBypass}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            <span>Dev Mode: Enter DAO</span>
          </button>
          <Link href="/" className="text-xs font-semibold text-[#60739A] hover:text-[#071A4A] transition-colors flex items-center gap-1">
            ← Back to EQUORA.FI
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
            <img src="/icons/trobsafe.svg" alt="TrobSafe" className="w-4 h-4 object-contain" />
            <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider">Official Trobium Wallet</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#071A4A] tracking-tight leading-tight uppercase">
            Download <span className="text-[#155EEF]">TrobSAFE</span>
          </h1>

          <p className="text-sm sm:text-base text-[#60739A] max-w-xl mx-auto leading-relaxed">
            The official Trobium wallet for Android and iOS. Store, send, and receive TROB from one trusted place — or install the Android APK directly to access the EQUORA Genesis DAO.
          </p>

          {/* Grid of Real Download Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-left">
            {/* Android APK */}
            <a
              href="/downloads/trobsafe.apk"
              download="trobsafe.apk"
              className="p-4 rounded-2xl bg-white border border-[#BFDBFE] hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-[#071A4A] group-hover:bg-[#155EEF] p-2.5 flex items-center justify-center shrink-0 transition-colors">
                <img src="/icons/android.svg" alt="Android" className="w-6 h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Download for</span>
                <span className="block text-sm font-bold text-[#071A4A] group-hover:text-[#155EEF]">Android APK</span>
                <span className="block text-[11px] text-[#64748B]">~81 MB · v1.0.22</span>
              </div>
            </a>

            {/* Apple App Store */}
            <a
              href="https://apps.apple.com/app/trobsafe/id0000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-[#071A4A] p-2.5 flex items-center justify-center shrink-0">
                <img src="/icons/apple.svg" alt="App Store" className="w-5 h-5 object-contain fill-white" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Download on the</span>
                <span className="block text-sm font-bold text-[#071A4A]">App Store</span>
                <span className="block text-[11px] text-[#64748B]">iOS & iPadOS</span>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="https://trobium.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 p-2.5 flex items-center justify-center shrink-0 border border-slate-200">
                <img src="/icons/google-play.svg" alt="Google Play" className="w-5 h-5 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Get it on</span>
                <span className="block text-sm font-bold text-[#071A4A]">Google Play</span>
                <span className="block text-[11px] text-[#64748B]">Android Store</span>
              </div>
            </a>
          </div>

          {/* Primary APK Download Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/downloads/trobsafe.apk"
              download="trobsafe.apk"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download APK · v1.0.22</span>
            </a>
            <a
              href="/api/trobsafe/download"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm text-[#155EEF] bg-white hover:bg-blue-50/80 border border-[#BFDBFE] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Chrome className="w-4 h-4" />
              <span>Download Extension (.ZIP)</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-[#60739A] pt-1">
            <span className="flex items-center gap-1.5">
              <Chrome className="w-3.5 h-3.5 text-[#155EEF]" /> Chrome / Brave / Edge
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#155EEF]" /> Android 8.0+
            </span>
            <span>·</span>
            <a
              href="https://trobium.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#155EEF] hover:underline flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              trobium.com/download
            </a>
          </div>
        </div>

        {/* Android APK Install steps */}
        <div className="bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3DDC84]/20 flex items-center justify-center p-1.5">
              <img src="/icons/android.svg" alt="Android" className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#071A4A]">Android (.APK) Installation Guide</h2>
          </div>

          <div className="space-y-5">
            {ANDROID_STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#155EEF] font-black text-xs flex items-center justify-center shrink-0 font-mono">
                  {step.num}
                </div>
                <div className="space-y-0.5 min-w-0 pt-1">
                  <p className="text-sm font-bold text-[#071A4A]">{step.title}</p>
                  <p className="text-xs text-[#60739A] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Extension Install steps */}
        <div className="bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <Chrome className="w-5 h-5 text-[#155EEF]" />
            <h2 className="text-lg font-bold text-[#071A4A]">Desktop Extension Installation Guide</h2>
          </div>

          <div className="space-y-5">
            {CHROME_STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#155EEF] font-black text-xs flex items-center justify-center shrink-0 font-mono">
                  {step.num}
                </div>
                <div className="space-y-0.5 min-w-0 pt-1">
                  <p className="text-sm font-bold text-[#071A4A]">{step.title}</p>
                  <p className="text-xs text-[#60739A] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chrome extensions link */}
          <div className="pt-2 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF9] flex items-center gap-3">
            <Chrome className="w-5 h-5 text-[#60739A] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#071A4A]">Open Chrome Extensions</p>
              <a href="chrome://extensions" className="text-xs font-mono text-[#155EEF] hover:underline">
                chrome://extensions
              </a>
              <span className="text-xs text-[#94A3B8] ml-2">(paste into address bar)</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#071A4A]">What TrobSafe Enables</h2>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-[#344054]">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Enter DAO or Dev Mode */}
        <div className="text-center space-y-4 pt-4 border-t border-[#E2ECF9]">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dao"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-[#0B132B] hover:bg-[#1E293B] transition-all shadow-sm"
            >
              <span>Go to Genesis DAO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleDevBypass}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs"
            >
              <Zap className="w-4 h-4 fill-amber-600 text-amber-600" />
              <span>⚡ Dev Mode: Enter DAO (No Wallet Needed)</span>
            </button>
          </div>
          <p className="text-xs text-[#60739A]">
            Use Dev Mode to inspect all council seats, treasury stats, and member lounge dashboards without connecting a wallet.
          </p>
        </div>
      </main>
    </div>
  );
}
