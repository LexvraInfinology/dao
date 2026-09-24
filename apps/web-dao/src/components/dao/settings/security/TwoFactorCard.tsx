'use client';

import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export default function TwoFactorCard() {
  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-6 lg:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Add an extra layer of security to your account.
          </p>
        </div>

        {/* Row Container */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
          {/* Left Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                2FA Status
              </h4>
              <div className="text-xs text-[#64748B] mt-0.5">
                Not enabled
              </div>
            </div>
          </div>

          {/* Right Action & Status */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626] text-xs font-semibold">
              Not Enabled
            </span>

            <button
              onClick={() => alert('Enable Two-Factor Authentication')}
              className="px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#155EEF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Enable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Add an extra layer of security to your account.
          </p>
        </div>

        {/* Row Box */}
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#071A4A]">
                2FA Status
              </h4>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Not enabled
              </div>
            </div>
          </div>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA]/60 text-[#DC2626] text-[11px] font-semibold">
            Not Enabled
          </span>
        </div>

        {/* Bottom Link */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => alert('Enable Two-Factor Authentication')}
            className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Enable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
