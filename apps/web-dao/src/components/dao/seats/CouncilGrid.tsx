'use client';

import React, { useState } from 'react';
import { ChevronDown, Lock, Check } from 'lucide-react';
import { CouncilSeatDetail, SeatStatus } from '@/data/councilSeatsData';

interface CouncilGridProps {
  seats: CouncilSeatDetail[];
  selectedSeat: CouncilSeatDetail;
  onSelectSeat: (seat: CouncilSeatDetail) => void;
}

export const CouncilGrid: React.FC<CouncilGridProps> = ({
  seats,
  selectedSeat,
  onSelectSeat,
}) => {
  const [filter, setFilter] = useState<'all' | 'claimed' | 'mine' | 'next' | 'defaulted' | 'locked'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterLabels: Record<string, string> = {
    all: 'All Seats',
    claimed: 'Claimed Seats',
    mine: 'Your Seat (#12)',
    next: 'Next Available (#87)',
    defaulted: 'Defaulted Vacancies',
    locked: 'Locked Future',
  };

  const filteredSeats = seats.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'claimed') return s.status === 'claimed';
    if (filter === 'mine') return s.status === 'mine';
    if (filter === 'next') return s.status === 'next';
    if (filter === 'defaulted') return s.status === 'defaulted';
    if (filter === 'locked') return s.status === 'locked';
    return true;
  });

  const filteredSeatNumbers = new Set(filteredSeats.map((s) => s.seatNumber));

  return (
    <div className="rounded-3xl bg-white border border-[#E2ECF9] p-3 xs:p-4 sm:p-6 lg:p-7 shadow-[0_4px_25px_rgba(15,23,42,0.03)] space-y-4 sm:space-y-5">
      {/* Header with Title and Filter Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-jakarta text-[#071A4A]">
            100–Seat Council Grid
          </h2>
          <p className="text-xs text-[#60739A] font-jakarta mt-0.5 hidden md:block">
            Click on a seat to view details, claim, or inspect.
          </p>
          <p className="text-xs text-[#60739A] font-jakarta mt-0.5 md:hidden">
            Tap any seat to inspect or claim
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E2ECF9] text-xs font-semibold text-[#071A4A] shadow-2xs transition-colors"
          >
            <span>{filterLabels[filter]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#60739A]" />
          </button>

          {filterDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFilterDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-[#E2ECF9] shadow-lg py-1 z-50 animate-fadeIn">
                {(Object.keys(filterLabels) as Array<keyof typeof filterLabels>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key as 'all' | 'claimed' | 'mine' | 'next' | 'defaulted' | 'locked');
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                      filter === key
                        ? 'bg-[#EEF5FF] text-[#155EEF] font-bold'
                        : 'text-[#071A4A] hover:bg-slate-50'
                    }`}
                  >
                    <span>{filterLabels[key]}</span>
                    {filter === key && <Check className="w-3.5 h-3.5 text-[#155EEF]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 10x10 Matrix Grid - 10 columns across all screen sizes for authentic layout */}
      <div className="grid grid-cols-10 gap-1 sm:gap-2">
        {seats.map((seat) => {
          const isSelected = selectedSeat.seatNumber === seat.seatNumber;
          const isFaded = !filteredSeatNumbers.has(seat.seatNumber);

          let tileClasses = 'border border-[#D0E2FF] bg-[#F0F6FF] text-[#155EEF] hover:bg-[#E5EFFF]';
          let dotColor = 'bg-[#155EEF]';

          if (seat.status === 'mine') {
            tileClasses = 'border-2 border-[#12B76A] bg-[#ECFDF3] text-[#027A48] hover:bg-[#D1FADF]';
            dotColor = 'bg-[#12B76A]';
          } else if (seat.status === 'defaulted') {
            tileClasses = 'border-2 border-dashed border-[#F04438] bg-[#FEF3F2] text-[#D92D20] hover:bg-[#FEE4E2]';
            dotColor = 'bg-[#F04438]';
          } else if (seat.status === 'next') {
            tileClasses = 'border-2 border-[#155EEF] bg-[#D1E4FF] text-[#155EEF] font-bold hover:bg-[#BFDBFE]';
            dotColor = 'bg-[#155EEF]';
          } else if (seat.status === 'locked') {
            tileClasses = 'border border-[#EAECF0] bg-[#F8FAFC] text-[#98A2B3] hover:bg-slate-100';
            dotColor = '';
          }

          return (
            <button
              key={seat.seatNumber}
              type="button"
              onClick={() => onSelectSeat(seat)}
              className={`aspect-square rounded-lg sm:rounded-xl p-0.5 sm:p-1 flex flex-col items-center justify-between transition-all select-none relative ${tileClasses} ${
                isSelected
                  ? 'ring-2 ring-[#155EEF] ring-offset-2 scale-105 z-10 shadow-sm'
                  : ''
              } ${isFaded ? 'opacity-25' : 'opacity-100'}`}
              title={`Seat #${seat.seatNumber} (${seat.status})`}
            >
              {/* Top dot or lock icon */}
              <div className="h-1.5 sm:h-2 flex items-center justify-center mt-0.5">
                {seat.status === 'locked' ? (
                  <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#98A2B3]" />
                ) : (
                  <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${dotColor}`} />
                )}
              </div>

              {/* Seat Number */}
              <div className="font-mono text-[9px] xs:text-[10px] sm:text-xs font-bold leading-none mb-0.5 sm:mb-1">
                {seat.seatNumber}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="pt-2 border-t border-slate-100">
        {/* Desktop Legend */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#4F6184] font-jakarta">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#155EEF]" />
            <span>Claimed Seat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A]" />
            <span>Your Seat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#155EEF] ring-2 ring-[#155EEF]/30" />
            <span>Next Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F04438]" />
            <span>Defaulted Vacancy</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#98A2B3]">
            <Lock className="w-3 h-3" />
            <span>Locked Future</span>
          </div>
        </div>

        {/* Mobile Legend */}
        <div className="md:hidden flex flex-wrap items-center justify-between gap-y-1.5 text-[10px] font-semibold text-[#60739A] font-jakarta px-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#155EEF]" />
            <span>Claimed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
            <span>Your Seat</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#155EEF]" />
            <span>Next</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F04438]" />
            <span>Defaulted</span>
          </div>
          <div className="flex items-center gap-1 text-[#98A2B3]">
            <Lock className="w-2.5 h-2.5" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
