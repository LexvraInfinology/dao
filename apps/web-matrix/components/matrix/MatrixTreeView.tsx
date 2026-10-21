import React from "react";
import { MatrixSlotDetails, MatrixSlotSummary } from "@/lib/api";
import { useMatrixStore } from "@/lib/stores";
import { toast } from "@/lib/toast";

export interface MatrixTreeViewProps {
  slotDetails?: MatrixSlotDetails | null;
  selectedSlotNumber?: number;
  slots?: MatrixSlotSummary[];
}

export function MatrixTreeView(props: MatrixTreeViewProps = {}) {
  const storeSlotDetails = useMatrixStore((s) => s.slotDetails);
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const storeSlots = useMatrixStore((s) => s.slots);

  const slotDetails = props.slotDetails !== undefined ? props.slotDetails : storeSlotDetails;
  const selectedSlotNumber = props.selectedSlotNumber ?? storeSelectedSlot;
  const slots = props.slots ?? storeSlots;
  const currentCycle = slotDetails?.currentCycle ?? 1;
  const nodes = slotDetails?.nodes ?? [];

  const getNode = (pos: number) => {
    return nodes.find((n) => n.position === pos);
  };

  const formatAddress = (addr?: string | null, userId?: number | null) => {
    if (addr) return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
    if (userId) return `ID #${userId}`;
    return "-";
  };

  const renderDesktopNode = (pos: number, widthClass = "w-[130px]") => {
    const node = getNode(pos);
    const isFilled = !!node?.filled;
    const isReserve = node?.payoutType === "UPGRADE_RESERVE";

    if (isFilled) {
      return (
        <div
          onClick={() => {
            if (node?.placedUser) {
              toast.copy(node.placedUser, `Position #${pos} Address`);
            } else {
              toast.info(`Position #${pos}`, `Filled by operative #${node?.userId || "N/A"}`);
            }
          }}
          className={`${widthClass} bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl p-2.5 sm:p-3 text-center shadow-xs transition-all cursor-pointer`}
          title={node?.placedUser ? `Click to copy: ${node.placedUser}` : `Position #${pos} Filled`}
        >
          <div className="text-[13px] sm:text-[14px] font-extrabold">{pos}</div>
          <div className="text-[10px] text-white/90 flex items-center justify-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {isReserve ? "Reserve" : "Filled"}
          </div>
          <div className="text-[9.5px] text-white/80 font-mono mt-0.5 truncate">
            {formatAddress(node?.placedUser, node?.userId)}
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => toast.info(`Position #${pos}`, `Open node in cycle ${currentCycle}. Automatically filled through team spillovers.`)}
        className={`${widthClass} bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#2563eb]/60 rounded-xl p-2.5 sm:p-3 text-center shadow-xs transition-all cursor-pointer`}
        title={`Position #${pos} Open`}
      >
        <div className="text-[13px] sm:text-[14px] font-extrabold text-[#0f172a]">{pos}</div>
        <div className="text-[10px] text-[#2563eb] font-semibold flex items-center justify-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full border border-[#2563eb]" />
          Open
        </div>
        <div className="text-[10px] text-[#94a3b8] mt-0.5">-</div>
      </div>
    );
  };

  const renderLevel3Node = (pos: number) => {
    const node = getNode(pos);
    const isFilled = !!node?.filled;

    if (isFilled) {
      return (
        <div
          key={pos}
          onClick={() => {
            if (node?.placedUser) {
              toast.copy(node.placedUser, `Position #${pos} Address`);
            } else {
              toast.info(`Position #${pos}`, `Filled node in cycle ${currentCycle}`);
            }
          }}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-1.5 px-1 text-center shadow-xs transition-all cursor-pointer"
          title={node?.placedUser ? `Click to copy: ${node.placedUser}` : `Position ${pos} Filled`}
        >
          <div className="text-[12px] font-bold text-white">{pos}</div>
          <div className="text-[8.5px] text-white/90 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Fill
          </div>
          <div className="text-[9px] text-white/80 font-mono leading-none mt-0.5 truncate">
            {node?.placedUser ? `${node.placedUser.slice(0, 4)}` : "✓"}
          </div>
        </div>
      );
    }

    return (
      <div
        key={pos}
        onClick={() => toast.info(`Position #${pos}`, `Open node in cycle ${currentCycle}`)}
        className="bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#2563eb]/60 rounded-lg py-1.5 px-1 text-center shadow-xs transition-all cursor-pointer"
        title={`Position #${pos} Open`}
      >
        <div className="text-[12px] font-bold text-[#0f172a]">{pos}</div>
        <div className="text-[8.5px] text-[#2563eb] font-semibold flex items-center justify-center gap-0.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full border border-[#2563eb]" />
          Open
        </div>
        <div className="text-[9px] text-[#94a3b8] leading-none mt-0.5">-</div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs min-w-0 max-w-full overflow-hidden">
                {/* Matrix Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-4 border-b border-[#f1f5f9] lg:border-none">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[13.5px] sm:text-[14px] font-extrabold text-[#0f172a] uppercase tracking-wide">
                        YOUR 14–NODE MATRIX (SLOT #{String(selectedSlotNumber).padStart(2, "0")})
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-[#dbeafe] text-[#1d4ed8] text-[10.5px] font-bold">
                        CYCLE #{String(currentCycle).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#64748b] mt-0.5">
                      As new members join, slots are filled automatically, moving you forward.
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-[11.5px] font-medium text-[#64748b]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                      <span>Filled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-[#2563eb] bg-white" />
                      <span>Open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-[#cbd5e1] bg-white" />
                      <span>Upcoming</span>
                    </div>
                  </div>
                </div>

                {/* Legend: Mobile Capsule Bar */}
                <div className="sm:hidden mt-3 bg-[#f8fafc] border border-[#e2e8f0]/60 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] font-medium text-[#475569]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span>Filled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border-2 border-[#2563eb] bg-white" />
                    <span>Open</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border-2 border-[#cbd5e1] bg-white" />
                    <span>Upcoming</span>
                  </div>
                </div>

                {/* Detailed Matrix Tree (Tablet md 768px and up) */}
                <div className="hidden md:flex flex-col items-center pt-6 pb-4 overflow-x-auto w-full max-w-full">
                  <div className="relative w-[620px] flex flex-col items-center">
                    <div className="z-10 flex flex-col items-center">
                      <div className="px-6 py-2 rounded-xl bg-[#2563eb] text-white text-[12px] font-extrabold flex items-center gap-2 shadow-md shadow-blue-500/20">
                        <span>YOU</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>

                    <div className="w-px h-5 bg-[#93c5fd]" />
                    <div className="relative w-[360px] h-5">
                      <div className="absolute top-0 left-0 right-0 h-px bg-[#93c5fd]" />
                      <div className="absolute top-0 left-0 w-px h-5 bg-[#93c5fd]" />
                      <div className="absolute top-0 right-0 w-px h-5 bg-[#93c5fd]" />
                    </div>

                    <div className="z-10 flex justify-between w-[500px]">
                      {renderDesktopNode(1, "w-[140px]")}
                      {renderDesktopNode(2, "w-[140px]")}
                    </div>

                    <div className="relative w-[500px] h-5">
                      <div className="absolute top-0 left-[70px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[10px] w-[120px] h-px bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[10px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[130px] w-px h-2.5 bg-[#93c5fd]" />

                      <div className="absolute top-0 right-[70px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 right-[10px] w-[120px] h-px bg-[#93c5fd]" />
                      <div className="absolute top-2.5 right-[10px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 right-[130px] w-px h-2.5 bg-[#93c5fd]" />
                    </div>

                    <div className="z-10 flex justify-between w-[520px]">
                      {renderDesktopNode(3, "w-[110px]")}
                      {renderDesktopNode(4, "w-[110px]")}
                      {renderDesktopNode(5, "w-[110px]")}
                      {renderDesktopNode(6, "w-[110px]")}
                    </div>

                    <div className="relative w-[570px] h-5">
                      <div className="absolute top-0 left-[55px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[25px] w-[60px] h-px bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[25px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[85px] w-px h-2.5 bg-[#93c5fd]" />

                      <div className="absolute top-0 left-[195px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[165px] w-[60px] h-px bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[165px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[225px] w-px h-2.5 bg-[#93c5fd]" />

                      <div className="absolute top-0 left-[375px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[345px] w-[60px] h-px bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[345px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[405px] w-px h-2.5 bg-[#93c5fd]" />

                      <div className="absolute top-0 left-[515px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[485px] w-[60px] h-px bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[485px] w-px h-2.5 bg-[#93c5fd]" />
                      <div className="absolute top-2.5 left-[545px] w-px h-2.5 bg-[#93c5fd]" />
                    </div>

                    <div className="grid grid-cols-8 gap-2 w-[590px]">
                      {[7, 8, 9, 10, 11, 12, 13, 14].map((num) => renderLevel3Node(num))}
                    </div>
                  </div>
                </div>

                {/* Mobile Matrix Tree (< md 768px) */}
                <div className="md:hidden flex flex-col items-center pt-5 pb-3">
                  <div className="relative w-full max-w-[320px] h-[260px] flex flex-col items-center justify-between">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 260">
                      <line x1="160" y1="36" x2="95" y2="80" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="160" y1="36" x2="225" y2="80" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />

                      <line x1="95" y1="80" x2="64" y2="150" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="95" y1="80" x2="126" y2="150" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />

                      <line x1="225" y1="80" x2="194" y2="150" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="225" y1="80" x2="256" y2="150" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />

                      <line x1="64" y1="150" x2="46" y2="235" stroke="#93c5fd" strokeWidth="1.2" />
                      <line x1="64" y1="150" x2="74" y2="235" stroke="#93c5fd" strokeWidth="1.2" />

                      <line x1="126" y1="150" x2="104" y2="235" stroke="#93c5fd" strokeWidth="1.2" />
                      <line x1="126" y1="150" x2="132" y2="235" stroke="#93c5fd" strokeWidth="1.2" />

                      <line x1="194" y1="150" x2="188" y2="235" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="2 2" />
                      <line x1="194" y1="150" x2="216" y2="235" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="2 2" />

                      <line x1="256" y1="150" x2="246" y2="235" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="2 2" />
                      <line x1="256" y1="150" x2="274" y2="235" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="2 2" />
                    </svg>

                    <div className="z-10 mt-1">
                      <div
                        onClick={() => toast.info("Your Matrix Root", `Active in Slot #${selectedSlotNumber}, Cycle #${currentCycle}`)}
                        className="px-4 py-1.5 rounded-full bg-[#2563eb] text-white text-[12px] font-extrabold shadow-[0_0_18px_rgba(37,99,235,0.45)] cursor-pointer"
                      >
                        YOU
                      </div>
                    </div>

                    {/* Mobile Level 1: Pos 1, 2 */}
                    <div className="z-10 flex justify-between w-[160px] mt-4">
                      {[1, 2].map((pos) => {
                        const node = getNode(pos);
                        return node?.filled ? (
                          <div
                            key={pos}
                            onClick={() => {
                              if (node?.placedUser) {
                                toast.copy(node.placedUser, `Position #${pos} Address`);
                              } else {
                                toast.info(`Position #${pos}`, "Filled position");
                              }
                            }}
                            className="w-8 h-8 rounded-full bg-[#1d4ed8] text-white font-bold text-[12px] flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            {pos}
                          </div>
                        ) : (
                          <div
                            key={pos}
                            onClick={() => toast.info(`Position #${pos}`, `Open position in cycle #${currentCycle}`)}
                            className="w-8 h-8 rounded-full bg-[#eff6ff] border-2 border-[#93c5fd] flex items-center justify-center cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Level 2: Pos 3, 4, 5, 6 */}
                    <div className="z-10 flex justify-between w-[240px] mt-4">
                      {[3, 4, 5, 6].map((pos) => {
                        const node = getNode(pos);
                        return node?.filled ? (
                          <div
                            key={pos}
                            onClick={() => {
                              if (node?.placedUser) {
                                toast.copy(node.placedUser, `Position #${pos} Address`);
                              } else {
                                toast.info(`Position #${pos}`, "Filled position");
                              }
                            }}
                            className="w-7 h-7 rounded-full bg-[#1d4ed8] text-white font-bold text-[11px] flex items-center justify-center shadow-xs cursor-pointer"
                          >
                            {pos}
                          </div>
                        ) : (
                          <div
                            key={pos}
                            onClick={() => toast.info(`Position #${pos}`, `Open position in cycle #${currentCycle}`)}
                            className="w-7 h-7 rounded-full bg-[#eff6ff] border-2 border-[#93c5fd] flex items-center justify-center cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Level 3: Pos 7-14 */}
                    <div className="z-10 flex justify-between w-[265px] mb-1">
                      {[7, 8, 9, 10, 11, 12, 13, 14].map((pos) => {
                        const node = getNode(pos);
                        return (
                          <div
                            key={pos}
                            onClick={() => {
                              if (node?.filled && node?.placedUser) {
                                toast.copy(node.placedUser, `Position #${pos} Address`);
                              } else {
                                toast.info(`Position #${pos}`, node?.filled ? "Filled position" : `Open position in cycle #${currentCycle}`);
                              }
                            }}
                            className={`w-3.5 h-3.5 rounded-full transition-colors cursor-pointer ${
                              node?.filled ? "bg-[#1d4ed8]" : "bg-[#bfdbfe]"
                            }`}
                            title={`Position ${pos}: ${node?.filled ? "Filled" : "Open"}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-full mt-4 bg-[#f8fafc] border border-[#f1f5f9] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-[11.5px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                      <span className="font-semibold text-[#0f172a]">Automatic Spillover Activated</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info("Matrix Rules", "Each tier consists of 14 nodes across 3 binary levels (2, 4, 8). Automated spillovers and cycling keep your network moving.")}
                      className="font-bold text-[#2563eb] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Matrix Rules →
                    </button>
                  </div>
                </div>
              </div>
  );
}
