import React, { useState, useEffect } from "react";
import { MatrixSlotDetails, MatrixSlotSummary } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { getOnChainQualification } from "@/lib/contracts";
import { toast } from "@/lib/toast";
import { formatAddress as formatB58Address, toTrobBase58 } from "@/lib/format";
import { ShieldCheck, AlertCircle, CheckCircle2, Check } from "lucide-react";

export interface MatrixTreeViewProps {
  slotDetails?: MatrixSlotDetails | null;
  selectedSlotNumber?: number;
  slots?: MatrixSlotSummary[];
}

export function MatrixTreeView(props: MatrixTreeViewProps = {}) {
  const storeSlotDetails = useMatrixStore((s) => s.slotDetails);
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const storeSlots = useMatrixStore((s) => s.slots);
  const address = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);

  const sponsor = profile?.sponsorAddress;
  const isVaultSponsor =
    !sponsor ||
    sponsor.toLowerCase() === "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9" ||
    sponsor.toLowerCase() === "415181d06090f16c9bffef71e2ccd7ed17f676aad9";
  const upline2 = profile?.upline2Address;

  const slotDetails = props.slotDetails !== undefined ? props.slotDetails : storeSlotDetails;
  const selectedSlotNumber = props.selectedSlotNumber ?? storeSelectedSlot;
  const slots = props.slots ?? storeSlots;
  const currentCycle = slotDetails?.currentCycle ?? 1;
  const nodes = slotDetails?.nodes ?? [];

  // Live on-chain qualification state
  const [qualification, setQualification] = useState<{ isQualified: boolean; activeDirectsCount: number }>({
    isQualified: false,
    activeDirectsCount: 0,
  });

  useEffect(() => {
    if (address && address.startsWith("0x")) {
      getOnChainQualification(address).then(setQualification).catch(() => {});
    }
  }, [address, slotDetails]);

  const getNode = (pos: number) => {
    return nodes.find((n) => n.position === pos);
  };

  const formatNodeAddress = (addr?: string | null, userId?: number | null) => {
    if (addr) return formatB58Address(addr);
    if (userId) return `ID #${userId}`;
    return "-";
  };

  // Node role helper based on smart contract rules
  const getNodeRole = (pos: number) => {
    if (pos <= 2) return { role: "DIRECT", label: `Direct Ref #${pos}` };
    if (pos === 3 || pos === 6 || pos === 8 || pos === 9 || pos === 11 || pos === 12) {
      return { role: "OWNER", label: "YOU (100% P2P)" };
    }
    if (pos === 4 || pos === 5 || pos === 14) {
      return {
        role: "POOL",
        label: pos === 5 ? "Stage 1 Reserve" : pos === 14 ? "Stage 2 Complete" : "4 Protocol Pools",
      };
    }
    return { role: "SPILLOVER", label: "Downline Waterfall" };
  };

  const renderDesktopNode = (pos: number, widthClass = "w-[130px]") => {
    const node = getNode(pos);
    const isFilled = !!node?.filled;
    const isDirectNode = pos <= 2;
    const isDepositedDirect = isDirectNode && Boolean(node?.isDirectDeposited || isFilled);
    const roleInfo = getNodeRole(pos);

    if (isFilled) {
      // Style based on contract node payout / qualification role
      let bgClasses = "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm shadow-blue-500/20";
      let statusLabel = "Filled";
      let badgeColor = "bg-white";

      if (isDirectNode) {
        if (isDepositedDirect) {
          bgClasses = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400";
          statusLabel = "Active ($30)";
          badgeColor = "bg-emerald-200";
        } else {
          bgClasses = "bg-amber-50 border-2 border-dashed border-amber-400 hover:bg-amber-100 text-amber-900";
          statusLabel = "Awaiting $30";
          badgeColor = "bg-amber-500";
        }
      } else if (roleInfo.role === "POOL") {
        bgClasses = "bg-purple-700 hover:bg-purple-800 text-white shadow-sm shadow-purple-600/20";
        statusLabel = pos === 5 ? "Reserved" : pos === 14 ? "Recycled" : "Pools";
      } else if (roleInfo.role === "SPILLOVER") {
        bgClasses = "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20";
        statusLabel = "Spillover";
      }

      return (
        <div
          onClick={() => {
            if (node?.placedUser) {
              toast.copy(toTrobBase58(node.placedUser), `Position #${pos} Address`);
            } else {
              toast.info(`Position #${pos}`, `Filled by operative #${node?.userId || "N/A"}`);
            }
          }}
          className={`${widthClass} ${bgClasses} rounded-xl p-2.5 sm:p-3 text-center transition-all cursor-pointer select-none`}
          title={node?.placedUser ? `Click to copy: ${toTrobBase58(node.placedUser)}` : `Position #${pos} Filled`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] sm:text-[14px] font-extrabold">{pos}</span>
            <span className="text-[9px] font-mono px-1 rounded bg-black/15 font-semibold">
              {roleInfo.label.split(" ")[0]}
            </span>
          </div>

          <div className="text-[10px] flex items-center justify-center gap-1 mt-1 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${badgeColor} ${isDepositedDirect ? "animate-pulse" : ""}`} />
            {statusLabel}
          </div>

          <div className="text-[9.5px] font-mono mt-0.5 truncate opacity-90">
            {formatNodeAddress(node?.placedUser, node?.userId)}
          </div>
        </div>
      );
    }

    // Open Node Styling
    let openBorder = "border-[#e2e8f0] hover:border-[#2563eb]/60 bg-white hover:bg-[#f8fafc]";
    let openLabel = "Open";

    if (isDirectNode) {
      openBorder = "border-dashed border-blue-300 hover:border-emerald-500 bg-blue-50/30 hover:bg-blue-50/60";
      openLabel = "Direct (Open)";
    } else if (roleInfo.role === "POOL") {
      openBorder = "border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/60";
      openLabel = pos === 5 ? "Reserve Next" : pos === 14 ? "Recycle Board" : "Protocol Pool";
    } else if (roleInfo.role === "SPILLOVER") {
      openBorder = "border-amber-200 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-50/60";
      openLabel = "Spillover";
    }

    return (
      <div
        onClick={() => toast.info(`Position #${pos}`, `Open node in cycle ${currentCycle}. Automatically filled through direct referrals and team spillovers.`)}
        className={`${widthClass} ${openBorder} border rounded-xl p-2.5 sm:p-3 text-center shadow-xs transition-all cursor-pointer select-none`}
        title={`Position #${pos} Open (${roleInfo.label})`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-extrabold text-[#0f172a]">{pos}</span>
          <span className="text-[9px] font-mono text-slate-400 font-semibold">
            {roleInfo.label.split(" ")[0]}
          </span>
        </div>
        <div className="text-[10px] text-[#2563eb] font-semibold flex items-center justify-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full border border-[#2563eb]" />
          {openLabel}
        </div>
        <div className="text-[10px] text-[#94a3b8] mt-0.5">-</div>
      </div>
    );
  };

  const renderLevel3Node = (pos: number) => {
    const node = getNode(pos);
    const isFilled = !!node?.filled;
    const roleInfo = getNodeRole(pos);

    if (isFilled) {
      let bg = "bg-[#2563eb] hover:bg-[#1d4ed8]";
      if (roleInfo.role === "POOL") bg = "bg-purple-700 hover:bg-purple-800";
      if (roleInfo.role === "SPILLOVER") bg = "bg-amber-600 hover:bg-amber-700";

      return (
        <div
          key={pos}
          onClick={() => {
            if (node?.placedUser) {
              toast.copy(toTrobBase58(node.placedUser), `Position #${pos} Address`);
            } else {
              toast.info(`Position #${pos}`, `Filled node in cycle ${currentCycle} (${roleInfo.label})`);
            }
          }}
          className={`${bg} text-white rounded-lg py-1.5 px-1 text-center shadow-xs transition-all cursor-pointer select-none`}
          title={node?.placedUser ? `Click to copy: ${toTrobBase58(node.placedUser)}` : `Position ${pos} Filled`}
        >
          <div className="text-[12px] font-bold text-white">{pos}</div>
          <div className="text-[8.5px] text-white/90 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {roleInfo.role === "POOL" ? "Pool" : roleInfo.role === "SPILLOVER" ? "Spill" : "YOU"}
          </div>
          <div className="text-[9px] text-white/80 font-mono leading-none mt-0.5 truncate flex items-center justify-center">
            {node?.placedUser ? (
              `${toTrobBase58(node.placedUser).slice(0, 4)}`
            ) : (
              <Check className="w-2.5 h-2.5 text-white/90" />
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={pos}
        onClick={() => toast.info(`Position #${pos}`, `Open node in cycle ${currentCycle} (${roleInfo.label})`)}
        className="bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#2563eb]/60 rounded-lg py-1.5 px-1 text-center shadow-xs transition-all cursor-pointer select-none"
        title={`Position #${pos} Open (${roleInfo.label})`}
      >
        <div className="text-[12px] font-bold text-[#0f172a]">{pos}</div>
        <div className="text-[8.5px] text-[#2563eb] font-semibold flex items-center justify-center gap-0.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full border border-[#2563eb]" />
          {roleInfo.role === "POOL" ? "Pool" : roleInfo.role === "SPILLOVER" ? "Spill" : "YOU"}
        </div>
        <div className="text-[9px] text-[#94a3b8] leading-none mt-0.5">-</div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs min-w-0 max-w-full overflow-hidden">
      {/* Matrix Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-[#f1f5f9]">
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
            Single-leg binary matrix engine governed by Solidity smart contracts. Instant on-chain payouts.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Active Direct ($30)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
            <span>Owner (YOU)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
            <span>Protocol Pools</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Downline Spill</span>
          </div>
        </div>
      </div>

      {/* ── ON-CHAIN QUALIFICATION STATUS BANNER ── */}
      <div className="mt-3.5">
        {qualification.isQualified ? (
          <div className="p-3 sm:p-3.5 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-emerald-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[12.5px] font-extrabold text-emerald-900 tracking-wide uppercase flex items-center gap-1.5">
                  Matrix Qualified (2/2 Active Directs Deposited)
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11.5px] text-emerald-700/90 font-medium">
                  Your personal earnings are live: Positions P3, P6, P8, P9, P11, P12 route directly to your TrobSafe wallet.
                </div>
              </div>
            </div>
            <div className="hidden sm:block px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
              Earning Active
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3 text-amber-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[12.5px] font-extrabold text-amber-900 tracking-wide uppercase flex items-center gap-1.5">
                  Awaiting Direct Qualification ({qualification.activeDirectsCount}/2 Active Directs Deposited)
                </div>
                <div className="text-[11.5px] text-amber-800/90 font-medium">
                  Personal matrix earnings start when 2 direct referrals complete their $30 Slot 1 deposit. Until qualified, payouts route to the 4 Protocol Pools (EquoraVault) with zero fund loss.
                </div>
              </div>
            </div>
            <div className="hidden sm:block px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-800 border border-amber-500/30 text-[11px] font-bold">
              {2 - Math.min(2, qualification.activeDirectsCount)} More Needed
            </div>
          </div>
        )}
      </div>

      {/* Detailed Matrix Tree (Tablet md 768px and up) */}
      <div className="hidden md:flex flex-col items-center pt-6 pb-4 overflow-x-auto w-full max-w-full">
        <div className="relative w-[620px] flex flex-col items-center">
          {/* UPLINE / SPONSOR */}
          <div className="z-10 flex flex-col items-center mb-1">
            {isVaultSponsor ? (
              <div className="flex flex-col items-center text-center">
                <div className="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-700 uppercase text-[9.5px] font-bold tracking-wider">Upline:</span>
                  <span className="text-amber-950 font-mono text-[11px] font-bold">
                    Protocol Gateway / 4 Protocol Pools (Root Vault)
                  </span>
                </div>
                <span className="text-[9.5px] text-amber-700 font-medium mt-0.5">
                  100% Inflow routes directly to 4 Protocol Pools
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <div className="px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Upline 1 (Sponsor):</span>
                    <span className="text-slate-800 font-mono text-[11px] font-bold">
                      {formatB58Address(toTrobBase58(sponsor))}
                    </span>
                  </div>
                  {upline2 && (
                    <div className="px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Upline 2:</span>
                      <span className="text-slate-800 font-mono text-[11px] font-bold">
                        {upline2.toLowerCase() === "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9"
                          ? "Protocol Pools (Vault)"
                          : formatB58Address(toTrobBase58(upline2))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="w-px h-4 bg-[#93c5fd]" />
          </div>

          <div className="z-10 flex flex-col items-center">
            <div className="px-6 py-2 rounded-xl bg-[#2563eb] text-white text-[12px] font-extrabold flex items-center gap-2 shadow-md shadow-blue-500/20">
              <span>YOU (ROOT OWNER)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          <div className="w-px h-5 bg-[#93c5fd]" />
          <div className="relative w-[360px] h-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-[#93c5fd]" />
            <div className="absolute top-0 left-0 w-px h-5 bg-[#93c5fd]" />
            <div className="absolute top-0 right-0 w-px h-5 bg-[#93c5fd]" />
          </div>

          {/* Level 1: Node 1 & Node 2 (Direct Referrals) */}
          <div className="z-10 flex justify-between w-[500px]">
            {renderDesktopNode(1, "w-[160px]")}
            {renderDesktopNode(2, "w-[160px]")}
          </div>

          <div className="relative w-[500px] h-5">
            <div className="absolute top-0 left-[80px] w-px h-2.5 bg-[#93c5fd]" />
            <div className="absolute top-2.5 left-[10px] w-[140px] h-px bg-[#93c5fd]" />
            <div className="absolute top-2.5 left-[10px] w-px h-2.5 bg-[#93c5fd]" />
            <div className="absolute top-2.5 left-[150px] w-px h-2.5 bg-[#93c5fd]" />

            <div className="absolute top-0 right-[80px] w-px h-2.5 bg-[#93c5fd]" />
            <div className="absolute top-2.5 right-[10px] w-[140px] h-px bg-[#93c5fd]" />
            <div className="absolute top-2.5 right-[10px] w-px h-2.5 bg-[#93c5fd]" />
            <div className="absolute top-2.5 right-[150px] w-px h-2.5 bg-[#93c5fd]" />
          </div>

          {/* Level 2: Pos 3, 4, 5, 6 */}
          <div className="z-10 flex justify-between w-[530px]">
            {renderDesktopNode(3, "w-[120px]")}
            {renderDesktopNode(4, "w-[120px]")}
            {renderDesktopNode(5, "w-[120px]")}
            {renderDesktopNode(6, "w-[120px]")}
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

          {/* Level 3: Pos 7-14 */}
          <div className="grid grid-cols-8 gap-2 w-[600px]">
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

          <div className="z-10 mt-1 flex flex-col items-center">
            {isVaultSponsor ? (
              <div className="px-3 py-1 mb-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[9px] font-bold flex items-center gap-1 shadow-xs text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-700 uppercase text-[8px]">Upline:</span>
                <span className="text-amber-950 font-mono text-[9px]">Protocol Pools (Root Vault)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5 mb-1">
                <div className="px-3 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[9px] font-bold flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-400 uppercase text-[8px]">Upline 1:</span>
                  <span className="text-slate-800 font-mono text-[9px]">{formatB58Address(toTrobBase58(sponsor))}</span>
                </div>
                {upline2 && (
                  <div className="px-3 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[9px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-slate-400 uppercase text-[8px]">Upline 2:</span>
                    <span className="text-slate-800 font-mono text-[9px]">
                      {upline2.toLowerCase() === "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9"
                        ? "Protocol Pools"
                        : formatB58Address(toTrobBase58(upline2))}
                    </span>
                  </div>
                )}
              </div>
            )}
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
              const isDeposited = node?.isDirectDeposited || node?.filled;
              return node?.filled ? (
                <div
                  key={pos}
                  onClick={() => {
                    if (node?.placedUser) {
                      toast.copy(toTrobBase58(node.placedUser), `Position #${pos} Address`);
                    } else {
                      toast.info(`Position #${pos}`, "Filled direct position");
                    }
                  }}
                  className={`w-9 h-9 rounded-full ${
                    isDeposited ? "bg-emerald-600 ring-2 ring-emerald-300" : "bg-amber-500"
                  } text-white font-bold text-[12px] flex items-center justify-center shadow-xs cursor-pointer`}
                >
                  {pos}
                </div>
              ) : (
                <div
                  key={pos}
                  onClick={() => toast.info(`Position #${pos}`, `Open direct position in cycle #${currentCycle}`)}
                  className="w-9 h-9 rounded-full bg-[#eff6ff] border-2 border-dashed border-[#93c5fd] flex items-center justify-center cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-[#2563eb]">P{pos}</span>
                </div>
              );
            })}
          </div>

          {/* Mobile Level 2: Pos 3, 4, 5, 6 */}
          <div className="z-10 flex justify-between w-[240px] mt-4">
            {[3, 4, 5, 6].map((pos) => {
              const node = getNode(pos);
              const role = getNodeRole(pos);
              let bg = "bg-[#2563eb]";
              if (role.role === "POOL") bg = "bg-purple-700";

              return node?.filled ? (
                <div
                  key={pos}
                  onClick={() => {
                    if (node?.placedUser) {
                      toast.copy(toTrobBase58(node.placedUser), `Position #${pos} Address`);
                    } else {
                      toast.info(`Position #${pos}`, `Filled position (${role.label})`);
                    }
                  }}
                  className={`w-7 h-7 rounded-full ${bg} text-white font-bold text-[11px] flex items-center justify-center shadow-xs cursor-pointer`}
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
              const role = getNodeRole(pos);
              let filledColor = "bg-[#2563eb]";
              if (role.role === "POOL") filledColor = "bg-purple-700";
              if (role.role === "SPILLOVER") filledColor = "bg-amber-600";

              return (
                <div
                  key={pos}
                  onClick={() => {
                    if (node?.filled && node?.placedUser) {
                      toast.copy(toTrobBase58(node.placedUser), `Position #${pos} Address`);
                    } else {
                      toast.info(`Position #${pos}`, node?.filled ? "Filled position" : `Open position in cycle #${currentCycle}`);
                    }
                  }}
                  className={`w-3.5 h-3.5 rounded-full transition-colors cursor-pointer ${
                    node?.filled ? filledColor : "bg-[#bfdbfe]"
                  }`}
                  title={`Position ${pos}: ${node?.filled ? "Filled" : "Open"}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SOLIDITY PAYOUT ROUTING EXPLANATION BAR ── */}
      <div className="mt-4 pt-3 border-t border-[#f1f5f9] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
        <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col">
          <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Active ($30 Paid)
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">
            Slot 1 unlocked on-chain. Direct qualification satisfied.
          </div>
        </div>

        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col">
          <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Deposit
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">
            Registered operative; awaiting $30 Slot 1 activation.
          </div>
        </div>

        <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col">
          <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            P3, 6, 8, 9, 11, 12
          </div>
          <div className="text-[10px] text-blue-700 mt-0.5">
            100% P2P to Slot Owner (YOU) when qualified.
          </div>
        </div>

        <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100 flex flex-col">
          <div className="font-extrabold text-purple-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            P4, P5, P14
          </div>
          <div className="text-[10px] text-purple-700 mt-0.5">
            4 Protocol Pools. P5 reserves next slot; P14 recycles!
          </div>
        </div>

        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 flex flex-col col-span-2 lg:col-span-1">
          <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            P7, P10, P13
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">
            Downline Spillover waterfall across team downlines.
          </div>
        </div>
      </div>
    </div>
  );
}
