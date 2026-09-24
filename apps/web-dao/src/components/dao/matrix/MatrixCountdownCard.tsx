'use client';

import React, { useState, useEffect } from 'react';

export default function MatrixCountdownCard() {
  // Initial state based on Figma mockups: 21 Days, 14 Hours, 22 Mins, 10 Secs
  const [timeLeft, setTimeLeft] = useState({
    days: 21,
    hours: 14,
    minutes: 22,
    seconds: 10,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
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
    </div>
  );
}
