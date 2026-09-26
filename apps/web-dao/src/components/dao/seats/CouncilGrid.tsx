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

  const mySeat = seats.find((s) => s.status === 'mine');
  const nextSeat = seats.find((s) => s.status === 'next');

  const filterLabels: Record<string, string> = {
    all: 'All Seats',
    claimed: 'Claimed Seats',
    mine: mySeat ? `Your Seat (#${mySeat.seatNumber})` : 'Your Seat',
    next: nextSeat ? `Next Available (#${nextSeat.seatNumber})` : 'Next Available',
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

          let tileClasses = 'bg-[#0B1528] text-slate-100 border border-[#1E293B] hover:bg-[#132238] shadow-2xs';
          let topElement: React.ReactNode = (
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-400" />
          );

          if (seat.status === 'mine') {
            tileClasses = 'border-2 border-emerald-300 bg-emerald-600 text-white shadow-md z-20';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-200 ring-1 ring-white animate-pulse" />
            );
          } else if (seat.status === 'defaulted') {
            tileClasses = 'border-2 border-dashed border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100';
            topElement = (
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-500 animate-pulse" />
            );
          } else if (seat.status === 'next') {
            tileClasses = 'border-2 border-blue-300 bg-[#155EEF] text-white font-bold ring-2 ring-blue-400/50 shadow-md animate-pulse z-10';
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
              className={`aspect-square rounded-lg sm:rounded-xl p-0.5 sm:p-1 flex flex-col items-center justify-between transition-all select-none relative ${tileClasses} ${
                isSelected
                  ? 'ring-2 ring-[#155EEF] ring-offset-2 scale-105 z-30 shadow-md'
                  : ''
              } ${isFaded ? 'opacity-25' : 'opacity-100'}`}
              title={`Seat #${seat.seatNumber} (${seat.status})`}
            >
              {/* Top dot or lock icon */}
              <div className="h-1.5 sm:h-2 flex items-center justify-center mt-0.5">
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

      {/* Legend Footer */}
      <div className="pt-3 border-t border-slate-200/80">
        {/* Desktop Legend */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-3 text-xs font-semibold font-jakarta">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-3 h-3 rounded-md bg-[#0B1528] border border-[#1E293B]" />
            <span className="text-slate-700">Claimed Seat</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="w-3 h-3 rounded-md bg-emerald-600 border border-emerald-400" />
            <span className="text-emerald-800 font-bold">Your Seat</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
            <span className="w-3 h-3 rounded-md bg-[#155EEF] border border-blue-300 animate-pulse" />
            <span className="text-[#155EEF] font-bold">Next Available</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-dashed border-rose-500" />
            <span className="text-rose-700">Defaulted Vacancy</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            <Lock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-600">Locked Future</span>
          </div>
        </div>

        {/* Mobile Legend */}
        <div className="md:hidden flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-semibold font-jakarta">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded bg-[#0B1528]" />
            <span className="text-slate-700">Claimed</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded bg-emerald-600" />
            <span className="text-emerald-800 font-bold">You</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
            <span className="w-2 h-2 rounded bg-[#155EEF]" />
            <span className="text-[#155EEF] font-bold">Next</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
            <span className="w-2 h-2 rounded bg-rose-400" />
            <span className="text-rose-700">Vacant</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            <Lock className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-slate-600">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
