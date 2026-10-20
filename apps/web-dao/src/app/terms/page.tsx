'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EquoraLogo } from '@/components/ui/EquoraLogo';

export default function TermsPage() {
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
              <Scale className="w-3.5 h-3.5" />
              <span>Decentralized Autonomous Terms</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Effective: October 2026 • Autonomous Protocol Agreement
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[#0F172A] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-[#0B132B] mb-1">
                  Autonomous Code As Law
                </strong>
                Equora DAO is an immutable, on-chain protocol governed by smart contracts on TrobChain. By initiating a transaction or connecting a wallet, you acknowledge that all executions are governed solely by smart contract logic without human custodianship.
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
                1. Genesis Council Membership & Rules
              </h2>
              <p>
                The Genesis Council consists of strictly 100 immutable seats allocated on a first-come, first-served basis for $300 USD equivalent in TROB. The 300 / N distribution formula, 5X dividend cap ($1,500 USD), and 48-hour retopup window operate strictly per the smart contract bytecode.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
                2. User Responsibility & Self-Custody
              </h2>
              <p>
                Users are solely responsible for safeguarding their private keys, mnemonic seed phrases, and wallet credentials. Equora DAO and its contributors never possess the authority or ability to reverse, alter, or recover transactions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B]">
                3. Protocol Fees & Slippage
              </h2>
              <p>
                All on-chain seat deposits, retopup operations, and Matrix bridge swaps are subject to TrobChain network gas fees and verified protocol distribution pool splits (35% DAO Treasury, 40% Royalty, 15% Rewards, 10% Box Pool).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B]">
                4. Decentralized Interface
              </h2>
              <p>
                This open-source web application serves as a decentralized visual gateway to the underlying smart contracts. Access is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <Link href="/privacy" className="text-[#155EEF] font-semibold hover:underline">
                ← Privacy Policy
              </Link>
              <Link href="/audit" className="text-[#155EEF] font-semibold hover:underline">
                Security Audit →
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
