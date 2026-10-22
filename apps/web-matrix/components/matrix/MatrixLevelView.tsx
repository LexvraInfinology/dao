import React from "react";
import { MatrixSlotSummary } from "@/lib/api";
import { useMatrixStore } from "@/lib/stores";

export interface MatrixLevelViewProps {
  slots?: MatrixSlotSummary[];
  onSelectSlot?: (slotNum: number) => void;
  selectedSlotNumber?: number;
  onBuySlot?: (slotNum: number) => void;
}

export function MatrixLevelView(props: MatrixLevelViewProps = {}) {
  const storeSlots = useMatrixStore((s) => s.slots);
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const storeSelectSlot = useMatrixStore((s) => s.selectSlot);
  const storeBuySlot = useMatrixStore((s) => s.buySlot);

  const slots = props.slots ?? storeSlots;
  const onSelectSlot = props.onSelectSlot ?? storeSelectSlot;
  const onBuySlot = props.onBuySlot;
  const selectedSlotNumber = props.selectedSlotNumber ?? storeSelectedSlot;
  const defaultProgressionLevels = Array.from({ length: 12 }, (_, i) => {
    const lvl = i + 1;
    return {
      level: lvl,
      num: String(lvl).padStart(2, "0"),
      status: lvl === 1 ? "Active" : "Locked",
      statusType: lvl === 1 ? "active" : "locked",
      nodesFilled: 0,
      totalNodes: 14,
      progress: 0,
      earned: "0.00 TROB",
      isActive: lvl === 1,
      cost: 30,
    };
  });

  const progressionLevels =
    slots && slots.length > 0
      ? slots.map((s) => ({
          level: s.slotNumber,
          num: String(s.slotNumber).padStart(2, "0"),
          status: s.isUnlocked ? "Active" : "Locked",
          statusType: s.isUnlocked ? "active" : "locked",
          nodesFilled: s.filledNodes,
          totalNodes: 14,
          progress: Math.min(100, Math.round((s.filledNodes / 14) * 100)),
          earned: `${s.totalEarned.toFixed(2)} TROB`,
          isActive: s.isUnlocked,
          cost: s.cost,
        }))
      : defaultProgressionLevels;

  const unlockedCount = slots && slots.length > 0 ? slots.filter((s) => s.isUnlocked).length : 0;

  return (
              /* ═══════════════════════════════════════════════════════════ */
              /* LEVEL VIEW SECTION (Pixel-Perfect from Figma Reference)   */
              /* ═══════════════════════════════════════════════════════════ */
              <div className="bg-white border border-[#e8ecf1] rounded-[24px] sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-xs relative">
                {/* Header without dividing line */}
                <div className="mb-4">
                  <h2 className="text-[13px] sm:text-[14px] font-extrabold text-[#0f172a] uppercase tracking-wide">
                    YOUR 12-LEVEL PROGRESSION
                  </h2>
                  <span className="text-[12px] font-bold text-[#2563eb] block mt-1">
                    {unlockedCount} / 12 Levels Unlocked
                  </span>
                </div>

                {/* Vertical Timeline Progression Container with Slim Blue Scrollbar */}
                <div className="relative max-h-[485px] lg:max-h-[560px] overflow-y-auto pr-1.5 [scrollbar-width:thin] [scrollbar-color:#2563eb_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#2563eb] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                  <div className="relative space-y-3 pb-2">
                    {/* Vertical Timeline Connector Line (Centered on dots: left 5.25px) */}
                    <div className="absolute left-[5.25px] top-6 bottom-6 w-[1.5px] bg-[#bfdbfe]" />

                    {progressionLevels.map((lvl) => (
                      <div key={lvl.level} className="relative flex items-center gap-3 sm:gap-3.5">
                        {/* Step Circle Marker on the Line */}
                        <div className="relative z-10 flex items-center justify-center flex-shrink-0 w-3">
                          {lvl.isActive ? (
                            <div className="w-3 h-3 rounded-full bg-[#2563eb] shadow-xs" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-white border-[1.5px] border-[#2563eb]" />
                          )}
                        </div>

                        {/* Progression Card */}
                        {lvl.isActive ? (
                          /* Level 1 - Active */
                          <div
                            onClick={() => onSelectSlot && onSelectSlot(lvl.level)}
                            className={`w-full bg-white border rounded-[20px] p-3.5 sm:p-4 shadow-xs flex items-center justify-between transition-all cursor-pointer ${
                              selectedSlotNumber === lvl.level
                                ? "border-[#2563eb] ring-2 ring-blue-500/20 bg-[#eff6ff]/30"
                                : "border-[#bfdbfe] hover:border-[#2563eb] hover:bg-[#f8fafc]"
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              {/* Large Blue Badge */}
                              <div className="w-[46px] h-[46px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#2563eb] text-white font-extrabold text-[17px] sm:text-[18px] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                                {lvl.num}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 leading-none">
                                  <h3 className="font-extrabold text-[15px] sm:text-[16px] text-[#0f172a]">
                                    Level {lvl.level}
                                  </h3>
                                  <span className="flex items-center gap-1 text-[11.5px] font-bold text-[#10b981] ml-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                    Active
                                  </span>
                                </div>

                                <div className="text-[11.5px] font-medium text-[#475569] mt-1">
                                  {lvl.nodesFilled} / {lvl.totalNodes} Nodes
                                </div>

                                {/* Progress bar */}
                                <div className="w-36 sm:w-44 h-1.5 bg-[#dbeafe] rounded-full overflow-hidden mt-1.5">
                                  <div
                                    className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                                    style={{ width: `${lvl.progress}%` }}
                                  />
                                </div>

                                <div className="font-black text-[14px] sm:text-[15px] text-[#0f172a] mt-2">
                                  {lvl.earned}
                                </div>
                              </div>
                            </div>

                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[#2563eb] flex-shrink-0 ml-2"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        ) : (
                          /* Locked Levels */
                          <div
                            onClick={() => onSelectSlot && onSelectSlot(lvl.level)}
                            className={`w-full bg-white border rounded-[20px] p-3.5 sm:p-4 shadow-2xs flex items-center justify-between transition-all cursor-pointer ${
                              selectedSlotNumber === lvl.level
                                ? "border-[#2563eb] ring-2 ring-blue-500/20 bg-[#eff6ff]/30"
                                : "border-[#e8ecf1] hover:border-[#2563eb]/60 hover:bg-[#f8fafc]"
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              {/* Light Gray Badge */}
                              <div className="w-[46px] h-[46px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#f1f5f9] text-[#334155] font-extrabold text-[16px] sm:text-[17px] flex items-center justify-center flex-shrink-0">
                                {lvl.num}
                              </div>

                              <div className="min-w-0">
                                <h3 className="font-extrabold text-[15px] sm:text-[16px] text-[#0f172a] leading-none">
                                  Level {lvl.level}
                                </h3>

                                <div className="flex items-center gap-1 text-[11.5px] font-medium text-[#94a3b8] mt-1">
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                  <span>Locked</span>
                                </div>

                                {lvl.level <= 4 && (
                                  <>
                                    <div className="text-[11.5px] font-medium text-[#94a3b8] mt-1">
                                      0 / 14 Nodes
                                    </div>
                                    <div className="w-36 sm:w-44 h-1.5 bg-[#f1f5f9] rounded-full mt-1.5" />
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onBuySlot) onBuySlot(lvl.level);
                                  else if (onSelectSlot) onSelectSlot(lvl.level);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                              >
                                Unlock
                              </button>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-[#cbd5e1]"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            
  );
}
