'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [filter, setFilter] = useState<'all' | 'claimed' | 'mine' | 'underfunded' | 'next' | 'defaulted' | 'locked'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [filterDropdownOpen]);

  const mySeat = seats.find((s) => s.status === 'mine');
  const nextSeat = seats.find((s) => s.status === 'next');

  const filterLabels: Record<string, string> = {
    all: 'All Seats',
    claimed: 'Claimed Seats',
    mine: mySeat ? `Your Seat (#${mySeat.seatNumber})` : 'Your Seat',
    underfunded: 'Underfunded Seats',
    next: nextSeat ? `Next Available (#${nextSeat.seatNumber})` : 'Next Available',
    defaulted: 'Defaulted Vacancies',
    locked: 'Locked Future',
  };

  const filteredSeats = seats.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'claimed') return s.status === 'claimed' && s.statusBadge !== 'Underfunded';
    if (filter === 'mine') return s.status === 'mine';
    if (filter === 'underfunded') return s.statusBadge === 'Underfunded';
    if (filter === 'next') return s.status === 'next';
    if (filter === 'defaulted') return s.status === 'defaulted';
    if (filter === 'locked') return s.status === 'locked';
    return true;
  });

  const filteredSeatNumbers = new Set(filteredSeats.map((s) => s.seatNumber));

  return (
    <div className="rounded-2xl bg-white border border-[#E2EEF9] p-2.5 xs:p-3 sm:p-4 md:p-5 shadow-[0_2px_12px_rgba(14,98,228,0.06)] space-y-3 sm:space-y-4 font-sans">
      {/* Header with Title and Filter Dropdown */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="min-w-0">
          <h2 className="text-sm xs:text-base sm:text-lg font-bold text-[#14304A] truncate">
            100–Seat Council Grid
          </h2>
          <p className="text-xs text-[#4F6D87] mt-0.5 hidden md:block">
            Click on a seat to view details, claim, or inspect.
          </p>
          <p className="text-[10px] xs:text-xs text-[#4F6D87] mt-0.5 md:hidden truncate">
            Tap any seat to inspect or claim
          </p>
        </div>

        {/* Filter Dropdown */}
        <div ref={filterDropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7FBFF] border border-[#E2EEF9] text-[11px] xs:text-xs font-semibold text-[#14304A] shadow-xs transition-colors cursor-pointer"
          >
            <span>{filterLabels[filter]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#4F6D87]" />
          </button>

          {filterDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setFilterDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-[#E2EEF9] shadow-lg py-1 z-50 animate-fadeIn">
                {(Object.keys(filterLabels) as Array<keyof typeof filterLabels>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key as 'all' | 'claimed' | 'mine' | 'next' | 'defaulted' | 'locked');
                      setFilterDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                      filter === key
                        ? 'bg-[#EFF6FF] text-[#0E62E4] font-bold'
                        : 'text-[#14304A] hover:bg-[#F7FBFF]'
                    }`}
                  >
                    <span>{filterLabels[key]}</span>
                    {filter === key && <Check className="w-3.5 h-3.5 text-[#0E62E4]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 10x10 Matrix Grid - 10 columns across all screen sizes with responsive gap */}
      <div className="grid grid-cols-10 gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2">
        {seats.map((seat) => {
          const isSelected = selectedSeat.seatNumber === seat.seatNumber;
          const isFaded = !filteredSeatNumbers.has(seat.seatNumber);

          let tileClasses = 'bg-[#14304A] text-slate-100 border border-[#234668] hover:bg-[#1E4366] shadow-xs';
          let topElement: React.ReactNode = (
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-400" />
          );

          if (seat.status === 'mine' && seat.statusBadge === 'Underfunded') {
            tileClasses = 'border-2 border-amber-400 bg-amber-500 text-white shadow-md ring-2 ring-amber-300 animate-pulse z-20';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-200 ring-1 ring-white animate-ping" />
            );
          } else if (seat.status === 'mine') {
            tileClasses = 'border-2 border-emerald-300 bg-emerald-600 text-white shadow-md z-20';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-200 ring-1 ring-white animate-pulse" />
            );
          } else if (seat.statusBadge === '5X Capped') {
            tileClasses = 'border-2 border-red-500 bg-gradient-to-b from-red-900 to-red-950 text-white shadow-sm ring-1 ring-red-400 animate-pulse';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-400 ring-1 ring-white animate-ping" />
            );
          } else if (seat.statusBadge === 'Underfunded') {
            tileClasses = 'border-2 border-amber-400 bg-amber-500 text-white shadow-sm';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-200 ring-1 ring-white" />
            );
          } else if (seat.status === 'defaulted') {
            tileClasses = 'border-2 border-dashed border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-500 animate-pulse" />
            );
          } else if (seat.status === 'next') {
            tileClasses = 'border-2 border-sky-300 bg-[#0E62E4] text-white font-bold ring-2 ring-[#0E62E4]/40 shadow-md animate-pulse z-10';
            topElement = (
              <span className="relative flex h-1 sm:h-1.5 w-1 sm:w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75" />
                <span className="relative inline-flex rounded-full h-1 sm:h-1.5 w-1 sm:w-1.5 bg-white" />
              </span>
            );
          } else if (seat.status === 'locked') {
            tileClasses = 'border border-slate-200/90 bg-[#F1F5F9] text-slate-500 hover:bg-slate-200/70';
            topElement = <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-slate-400" />;
          }

          return (
            <button
              key={seat.seatNumber}
              type="button"
              onClick={() => onSelectSeat(seat)}
              className={`aspect-square rounded-md xs:rounded-lg sm:rounded-xl p-0.5 sm:p-1 flex flex-col items-center justify-between transition-all select-none relative cursor-pointer ${tileClasses} ${
                isSelected
                  ? 'ring-2 ring-[#0E62E4] ring-offset-1 sm:ring-offset-2 scale-105 z-30 shadow-md'
                  : ''
              } ${isFaded ? 'opacity-25' : 'opacity-100'}`}
              title={`Seat #${seat.seatNumber} (${seat.status})`}
            >
              {/* Top dot or lock icon */}
              <div className="h-1 xs:h-1.5 sm:h-2 flex items-center justify-center mt-0.5">
                {topElement}
              </div>

              {/* Seat Number */}
              <div className="font-mono text-[9px] xs:text-[10px] sm:text-xs font-bold leading-none mb-0.5 sm:mb-1">
                {seat.seatNumber}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Selected Seat Quick Strip */}
      <div className="md:hidden pt-1">
        <a
          href="#seat-inspector-section"
          className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#EFF6FF] border border-[#E2EEF9] flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              selectedSeat.status === 'mine' ? 'bg-emerald-500' :
              selectedSeat.statusBadge === '5X Capped' ? 'bg-red-500' :
              selectedSeat.statusBadge === 'Underfunded' ? 'bg-amber-500' :
              selectedSeat.status === 'next' ? 'bg-[#0E62E4]' :
              selectedSeat.status === 'defaulted' ? 'bg-purple-500' : 'bg-slate-700'
            }`} />
            <span className="text-xs font-bold text-[#14304A] truncate">
              Selected: Seat #{selectedSeat.seatNumber}
            </span>
            <span className="text-[10px] text-[#4F6D87] truncate hidden xs:inline">
              ({selectedSeat.status === 'mine' ? 'Your Seat' : selectedSeat.statusBadge || selectedSeat.status})
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#0E62E4] flex items-center gap-1 shrink-0">
            <span>Inspect</span>
            <span>↓</span>
          </span>
        </a>
      </div>

      {/* Legend Footer */}
      <div className="pt-2.5 sm:pt-3 border-t border-[#E2EEF9]">
        {/* Desktop Legend */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-2.5 h-2.5 rounded bg-[#14304A] border border-[#234668]" />
            <span className="text-[#14304A]">Claimed Seat</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200">
            <span className="w-2.5 h-2.5 rounded bg-red-600 border border-red-400 animate-pulse" />
            <span className="text-red-700 font-bold">5X Capped</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-300" />
            <span className="text-amber-800 font-bold">Underfunded</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 border border-emerald-400" />
            <span className="text-emerald-800 font-bold">Your Seat</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#0E62E4]/30">
            <span className="w-2.5 h-2.5 rounded bg-[#0E62E4] border border-sky-300 animate-pulse" />
            <span className="text-[#0E62E4] font-bold">Next Available</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200">
            <span className="w-2.5 h-2.5 rounded bg-purple-100 border border-dashed border-purple-500" />
            <span className="text-purple-700 font-bold">Defaulted Vacancy</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            <Lock className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-[#4F6D87]">Locked Future</span>
          </div>
        </div>

        {/* Mobile Legend */}
        <div className="md:hidden flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded bg-[#14304A]" />
            <span className="text-[#14304A]">Claimed</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
            <span className="w-2 h-2 rounded bg-red-600 animate-pulse" />
            <span className="text-red-700 font-bold">5X Cap</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
            <span className="w-2 h-2 rounded bg-amber-500" />
            <span className="text-amber-800 font-bold">Underfunded</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded bg-emerald-600" />
            <span className="text-emerald-800 font-bold">You</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EFF6FF] border border-[#0E62E4]/30">
            <span className="w-2 h-2 rounded bg-[#0E62E4]" />
            <span className="text-[#0E62E4] font-bold">Next</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">
            <span className="w-2 h-2 rounded bg-purple-100 border border-dashed border-purple-500" />
            <span className="text-purple-700 font-bold">Vacant</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
            <Lock className="w-2 h-2 text-slate-500" />
            <span className="text-[#4F6D87]">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
