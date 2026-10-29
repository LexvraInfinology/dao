"use client";

import React from "react";

export interface MatrixViewSwitcherProps {
  activeTab: "matrix" | "list" | "level";
  setActiveTab: (tab: "matrix" | "list" | "level") => void;
}

export function MatrixViewSwitcher({ activeTab, setActiveTab }: MatrixViewSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-all ${
                activeTab === "matrix"
                  ? "bg-white border border-[#bfdbfe] text-[#2563eb] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a] hover:bg-white/60"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Matrix View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-all ${
                activeTab === "list"
                  ? "bg-white border border-[#bfdbfe] text-[#2563eb] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a] hover:bg-white/60"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("level")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-all ${
                activeTab === "level"
                  ? "bg-white border border-[#bfdbfe] text-[#2563eb] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a] hover:bg-white/60"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Level View</span>
            </button>
    </div>
  );
}
