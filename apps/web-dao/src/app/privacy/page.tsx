'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, EyeOff, FileText } from 'lucide-react';
import { EquoraLogo } from '@/components/ui/EquoraLogo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0B132B]">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <EquoraLogo className="w-7 h-7 drop-shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-base font-black tracking-wide uppercase text-[#0F172A]">
              EQUORA<span className="text-[#155EEF]">.FI</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#155EEF] border border-blue-200 uppercase">
              DAO
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#155EEF] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.04)] p-6 sm:p-10 lg:p-12 space-y-8">
          
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#155EEF] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Decentralized Privacy Standard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Last updated: October 2026 • Sovereign Protocol Standard
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-[#0F172A] flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#155EEF] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-[#0B132B] mb-1">
                  Non-Custodial & Sovereign Architecture
                </strong>
                Equora DAO is a decentralized protocol operating autonomously on TrobChain. We do not operate centralized user databases, collect personal identity records, or store private keys.
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-[#155EEF]" />
                1. Information We Do Not Collect
              </h2>
              <p>
                Equora DAO does not collect names, phone numbers, email addresses, credit cards, government identification, or IP tracking profiles. Interacting with the protocol requires only a public TrobChain wallet address.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#155EEF]" />
                2. Public Blockchain Data
              </h2>
              <p>
                Transactions submitted to the Genesis Queue, Matrix distributions, or dividend claims are permanently recorded on TrobChain. Public blockchain records (such as wallet addresses, transaction hashes, and block numbers) are public by design and accessible to any block explorer.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#155EEF]" />
                3. Local Storage & Wallet Sessions
              </h2>
              <p>
                Our web interface stores temporary session preferences (such as connected wallet address and theme state) strictly on your local device via browser LocalStorage. This data never leaves your device and can be cleared at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B]">
                4. Third-Party RPC Providers
              </h2>
              <p>
                When connecting to TrobChain, RPC nodes process cryptographic broadcast calls. We recommend using sovereign nodes or trusted decentralized network providers for maximal privacy.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Equora DAO Protocol</span>
              <Link href="/terms" className="text-[#155EEF] font-semibold hover:underline">
                Terms of Service →
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
