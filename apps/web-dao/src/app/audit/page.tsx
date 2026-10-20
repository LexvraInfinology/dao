'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, ExternalLink, Code2, Cpu } from 'lucide-react';
import { EquoraLogo } from '@/components/ui/EquoraLogo';
import { EXPLORER_BASE_URL } from '@/config/env';

export default function AuditPage() {
  const contracts = [
    {
      name: 'EquoraDAO (Core)',
      role: 'Genesis Council Queue, 100 Seats, 300/N Dividend Engine',
      address: '0x32349aB8413bB72F411C6B4a544b6E8371fe95f9',
    },
    {
      name: 'EquoraMatrix (P1-P14)',
      role: '14-Tier Referral & Passive Protocol Allocation Engine',
      address: '0x99538318d184cf43ebfd769e6584283597c41490',
    },
    {
      name: 'EquoraVault',
      role: 'Decentralized Protocol Multi-Pool Treasury',
      address: '0x17d23d8c11e741753768c7e92fc23555546fe226',
    },
  ];

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#027A48] text-xs font-bold uppercase tracking-wider border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#027A48]" />
              <span>Smart Contract Security Verification</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
              Security & Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              TrobChain Mainnet • Automated Verification & Invariant Proofs
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[#0F172A] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#027A48] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-[#0B132B] mb-1">
                  100% On-Chain Non-Custodial Architecture
                </strong>
                All smart contract funds flow strictly through hardcoded algorithmic mathematical rules. No admin key can alter distribution splits, seize deposits, or lock user balances.
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#155EEF]" />
                Verified Contract Deployments
              </h2>
              <div className="space-y-2.5">
                {contracts.map((c) => (
                  <div
                    key={c.name}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-[#0B132B] text-xs sm:text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.role}</div>
                      <div className="font-mono text-[10px] sm:text-xs text-[#155EEF] mt-1 break-all">
                        {c.address}
                      </div>
                    </div>
                    <a
                      href={`${EXPLORER_BASE_URL}/address/${c.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#155EEF] text-xs font-semibold text-[#0B132B] transition-colors shrink-0 self-start sm:self-auto"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#155EEF]" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B132B] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#155EEF]" />
                Core Security Invariants
              </h2>
              <ul className="space-y-2 list-disc list-inside text-slate-600">
                <li><strong className="text-[#0B132B]">Zero Admin Seizure:</strong> Funds deposited into the Genesis Queue are directly distributed via the 300 / N formula upon each block.</li>
                <li><strong className="text-[#0B132B]">Strict 5X Mathematical Cap:</strong> Once a seat claims $1,500 USD, dividends pause until the mandatory 48-hour retopup occurs.</li>
                <li><strong className="text-[#0B132B]">Pool Conservation:</strong> Protocol splits (35% DAO Treasury, 40% Royalty, 15% Rewards, 10% Box Pool) sum to precisely 100% with zero fund leakage.</li>
              </ul>
            </section>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <Link href="/terms" className="text-[#155EEF] font-semibold hover:underline">
                ← Terms of Service
              </Link>
              <Link href="/dao" className="text-[#155EEF] font-semibold hover:underline">
                Launch Dashboard →
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
