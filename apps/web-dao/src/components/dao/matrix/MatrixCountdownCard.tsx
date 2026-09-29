'use client';

import React, { useState, useEffect } from 'react';

export default function MatrixCountdownCard() {
  // Target: 21 Days founding window countdown (synchronized with smart contract SEAT_WINDOW)
  const INITIAL_TOTAL_SECONDS = 21 * 86400 + 14 * 3600 + 22 * 60 + 10;

  const [timeLeft, setTimeLeft] = useState({
    days: 21,
    hours: 14,
    minutes: 22,
    seconds: 10,
  });

  useEffect(() => {
    const STORAGE_KEY = 'equora_matrix_target_timestamp';
    let target = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        target = parseInt(stored, 10);
      }
    } catch {}

    if (!target || isNaN(target) || target <= Date.now()) {
      target = Date.now() + INITIAL_TOTAL_SECONDS * 1000;
      try {
        localStorage.setItem(STORAGE_KEY, String(target));
      } catch {}
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((target - now) / 1000));
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-[#E2ECF9] shadow-[0_4px_25px_rgba(21,94,239,0.04)] overflow-hidden font-jakarta">
      {/* Top Blue Accent Highlight Bar */}
      <div className="h-1.5 w-full bg-[#155EEF]" />

      {/* Timer Units Container */}
      <div className="px-5 sm:px-8 py-6 sm:py-8 flex items-center justify-between">
        {/* Unit 1: DAYS */}
        <div className="flex-1 text-center">
          <div className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#071A4A] tracking-tight leading-none font-jakarta">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-jakarta mt-2.5">
            DAYS
          </div>
        </div>

        {/* Colon Separator */}
        <div className="text-base sm:text-xl font-bold text-[#CBD5E1] -mt-5 px-1 select-none">
          :
        </div>

        {/* Unit 2: HOURS */}
        <div className="flex-1 text-center">
          <div className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#071A4A] tracking-tight leading-none font-jakarta">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-jakarta mt-2.5">
            HOURS
          </div>
        </div>

        {/* Colon Separator */}
        <div className="text-base sm:text-xl font-bold text-[#CBD5E1] -mt-5 px-1 select-none">
          :
        </div>

        {/* Unit 3: MINS */}
        <div className="flex-1 text-center">
          <div className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#071A4A] tracking-tight leading-none font-jakarta">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-jakarta mt-2.5">
            MINS
          </div>
        </div>

        {/* Colon Separator */}
        <div className="text-base sm:text-xl font-bold text-[#CBD5E1] -mt-5 px-1 select-none">
          :
        </div>

        {/* Unit 4: SECS */}
        <div className="flex-1 text-center">
          <div className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#071A4A] tracking-tight leading-none font-jakarta">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-jakarta mt-2.5">
            SECS
          </div>
        </div>
      </div>

      {/* Separate Domain Link & Bridge Callout */}
      <div className="bg-[#F8FAFC] border-t border-[#E2ECF9] px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#475569]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Dedicated Matrix Domain: <strong className="text-[#071A4A] font-bold font-mono">equorafi.com</strong>
          </span>
        </div>

        <a
          href={process.env.NEXT_PUBLIC_MATRIX_URL || 'https://equorafi.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#155EEF] hover:bg-[#124bbf] text-white font-bold text-xs shadow-xs transition-colors"
        >
          <span>Matrix Domain</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
