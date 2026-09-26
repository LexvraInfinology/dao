import React from 'react';
import Link from 'next/link';
import { Shield, Download, CheckCircle2, Chrome, Puzzle, ArrowRight, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Install TrobSafe Wallet — EQUORA Genesis DAO',
  description:
    'TrobSafe is the official Trobium browser wallet extension required to access the EQUORA Genesis DAO dashboard.',
};

const STEPS = [
  {
    num: '01',
    title: 'Download the extension',
    desc: 'Click "Download TrobSafe" below to get the browser extension package (.zip).',
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
    desc: 'Come back to EQUORA DAO, click "Launch App", and connect your TrobSafe wallet.',
  },
];

const FEATURES = [
  'Native Trobium L1 support',
  'EIP-4361 Sign-In With Ethereum (SIWE)',
  'Smart contract interaction (seat minting, withdrawals)',
  'Soulbound NFT verification',
  'Non-custodial — your keys stay on your device',
];

export default function TrobSafeInstallPage() {
  return (
    <div className="min-h-screen bg-[#F6F9FF] text-[#071A4A] font-jakarta">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E2ECF9] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#155EEF]">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-black text-[#071A4A] text-sm">
            TrobSafe <span className="text-[#155EEF]">Wallet</span>
          </span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-[#60739A] hover:text-[#071A4A] transition-colors flex items-center gap-1">
          ← Back to EQUORA.FI
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
            <Shield className="w-4 h-4 text-[#155EEF]" />
            <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider">Official Wallet Extension</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#071A4A] tracking-tight leading-tight">
            Install TrobSafe Wallet<br />
            <span className="text-[#155EEF]">to Access Genesis DAO</span>
          </h1>
          <p className="text-sm sm:text-base text-[#60739A] max-w-xl mx-auto leading-relaxed">
            TrobSafe is the secure, non-custodial Trobium wallet browser extension required for all on-chain interactions with the EQUORA Genesis DAO — including seat minting, dividend withdrawals, and governance voting.
          </p>

          {/* Download button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/api/trobsafe/download"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#155EEF] hover:bg-[#004EEB] shadow-[0_8px_20px_rgba(21,94,239,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              Download TrobSafe Extension
            </a>
            <a
              href="https://trobsafe.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#155EEF] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Official website
            </a>
          </div>

          <p className="text-[11px] text-[#94A3B8]">
            Manifest V3 · Chrome 88+ · Edge 88+ · Brave
          </p>
        </div>

        {/* Install steps */}
        <div className="bg-white rounded-3xl border border-[#E2ECF9] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <Puzzle className="w-5 h-5 text-[#155EEF]" />
            <h2 className="text-lg font-bold text-[#071A4A]">Installation Steps</h2>
          </div>

          <div className="space-y-5">
            {STEPS.map((step) => (
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

        {/* Back to DAO CTA */}
        <div className="text-center space-y-3">
          <p className="text-sm text-[#60739A]">
            Already installed? Go back and connect your wallet.
          </p>
          <Link
            href="/dao"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-[#0B132B] hover:bg-[#1E293B] transition-all shadow-sm"
          >
            <span>Go to Genesis DAO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
