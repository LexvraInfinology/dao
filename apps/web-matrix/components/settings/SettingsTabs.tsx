"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface SettingsTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const SETTINGS_TABS: SettingsTabItem[] = [
  {
    id: "Account",
    label: "Account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="8" r="3.5" />
        <path d="M6.2 18.8a7 7 0 0111.6 0" />
      </svg>
    ),
  },
  {
    id: "Security",
    label: "Security",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "Notifications",
    label: "Notifications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
        <path d="M2.5 8c0-1.5.5-2.5 1-3M21.5 8c0-1.5-.5-2.5-1-3" />
      </svg>
    ),
  },
  {
    id: "Wallet",
    label: "Wallet",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "Privacy",
    label: "Privacy",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 2v20" fill="currentColor" fillOpacity="0.25" />
      </svg>
    ),
  },
];

export interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentIndex = SETTINGS_TABS.findIndex((t) => t.id === activeTab);

  const checkScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  // Update scroll limits on mount, resize, and scroll
  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScrollState]);

  // Center active tab when it changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    // Recheck scroll state after animation
    const timer = setTimeout(checkScrollState, 350);
    return () => clearTimeout(timer);
  }, [activeTab, checkScrollState]);

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      setActiveTab(SETTINGS_TABS[currentIndex - 1].id);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  };

  const handleNextTab = () => {
    if (currentIndex < SETTINGS_TABS.length - 1) {
      setActiveTab(SETTINGS_TABS[currentIndex + 1].id);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  return (
    <div className="border-b border-[#e2e8f0] pt-1">
      {/* ── DESKTOP TABS (>= lg) ── */}
      <div className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 transition-colors relative cursor-pointer ${
                isActive
                  ? "text-[#2563eb] font-semibold"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2563eb] rounded-t-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── MOBILE / TABLET SLIDER TABS (< lg) ── */}
      <div className="lg:hidden relative flex items-center">
        {/* Left Slide Arrow */}
        <button
          type="button"
          onClick={handlePrevTab}
          disabled={currentIndex === 0}
          aria-label="Previous section"
          className={`p-1.5 -ml-1 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer ${
            currentIndex === 0 ? "opacity-25 cursor-not-allowed pointer-events-none" : "opacity-90 active:scale-95"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Left subtle fade gradient if scrolled */}
        {canScrollLeft && (
          <div className="absolute left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-[#f8fafc] to-transparent pointer-events-none z-10" />
        )}

        {/* Scrollable / Sliding Tabs Track */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollState}
          className="flex-1 flex items-center gap-5 sm:gap-6 overflow-x-auto scroll-smooth py-1 px-1.5 select-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : null}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-2.5 pt-0.5 whitespace-nowrap relative flex-shrink-0 transition-all cursor-pointer text-[13.5px] ${
                  isActive
                    ? "text-[#2563eb] font-bold"
                    : "text-[#64748b] hover:text-[#0f172a] font-medium"
                }`}
              >
                <span className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${isActive ? "text-[#2563eb]" : "text-[#94a3b8]"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2563eb] rounded-t-full shadow-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right subtle fade gradient if can scroll right */}
        {canScrollRight && (
          <div className="absolute right-6 top-0 bottom-0 w-6 bg-gradient-to-l from-[#f8fafc] to-transparent pointer-events-none z-10" />
        )}

        {/* Right Slide Arrow */}
        <button
          type="button"
          onClick={handleNextTab}
          disabled={currentIndex === SETTINGS_TABS.length - 1}
          aria-label="Next section"
          className={`p-1.5 -mr-1 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer ${
            currentIndex === SETTINGS_TABS.length - 1 ? "opacity-25 cursor-not-allowed pointer-events-none" : "opacity-90 active:scale-95"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
