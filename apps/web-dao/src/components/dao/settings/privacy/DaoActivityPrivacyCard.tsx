'use client';

import React, { useState } from 'react';
import { Award, Vote, Banknote, EyeOff } from 'lucide-react';

export default function DaoActivityPrivacyCard() {
  const [seatActivityVisible, setSeatActivityVisible] = useState(true);
  const [governanceActivityVisible, setGovernanceActivityVisible] = useState(true);
  const [earningsVisible, setEarningsVisible] = useState(false);

  return (
    <>
      {/* ================= DESKTOP VIEW (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold text-[#071A4A]">
            DAO Activity
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Control how your activity appears within the Genesis DAO.
          </p>
        </div>

        {/* Rows Container */}
        <div className="space-y-3 pt-1">
          {/* Row 1: Seat Activity */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#071A4A]">
                  Seat Activity
                </h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Show your Council Seat activity to other DAO members.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSeatActivityVisible(!seatActivityVisible)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                seatActivityVisible ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Toggle Seat Activity Visibility"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                  seatActivityVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 2: Governance Activity */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Vote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#071A4A]">
                  Governance Activity
                </h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Show your voting activity on DAO proposals.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setGovernanceActivityVisible(!governanceActivityVisible)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                governanceActivityVisible ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Toggle Governance Activity Visibility"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                  governanceActivityVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 3: Earnings Visibility */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#071A4A]">
                  Earnings Visibility
                </h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Show your earnings information on your DAO profile.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEarningsVisible(!earningsVisible)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                earningsVisible ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Toggle Earnings Visibility"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                  earningsVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-3.5">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-[#071A4A]">
            DAO Activity
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Control how your activity appears in the DAO.
          </p>
        </div>

        {/* Rows Container */}
        <div className="space-y-2.5 pt-1">
          {/* Row 1: Seat Activity */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#071A4A]">
                  Seat Activity
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  Show Council Seat activity
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSeatActivityVisible(!seatActivityVisible)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                seatActivityVisible ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Toggle Seat Activity Visibility"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                  seatActivityVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 2: Governance Activity */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <Vote className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#071A4A]">
                  Governance Activity
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  Show voting activity
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setGovernanceActivityVisible(!governanceActivityVisible)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                governanceActivityVisible ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Toggle Governance Activity Visibility"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                  governanceActivityVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 3: Earnings Visibility */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#155EEF] shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#071A4A]">
                  Earnings Visibility
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                  Show earnings on profile
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEarningsVisible(!earningsVisible)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer ${
                earningsVisible ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
              }`}
              aria-label="Toggle Earnings Visibility"
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
                  earningsVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
