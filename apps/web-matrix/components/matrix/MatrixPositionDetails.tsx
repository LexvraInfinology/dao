import { Lock } from "lucide-react";
import { MatrixSlotDetails } from "@/lib/api";
import { useMatrixStore, useUserStore } from "@/lib/stores";
import { formatAddress, formatDateSafe, toTrobBase58 } from "@/lib/format";

export interface MatrixPositionDetailsProps {
  handleCopy?: (text: string) => void;
  copied?: boolean;
  slotDetails?: MatrixSlotDetails | null;
  selectedSlotNumber?: number;
  address?: string;
  onBuySlot?: (slotNum: number) => void;
}

export function MatrixPositionDetails(props: MatrixPositionDetailsProps = {}) {
  const storeSlotDetails = useMatrixStore((s) => s.slotDetails);
  const storeSelectedSlot = useMatrixStore((s) => s.selectedSlotNumber);
  const storeAddress = useUserStore((s) => s.address);
  const profile = useUserStore((s) => s.profile);
  const storeBuySlot = useMatrixStore((s) => s.buySlot);

  const slotDetails = props.slotDetails !== undefined ? props.slotDetails : storeSlotDetails;
  const selectedSlotNumber = props.selectedSlotNumber ?? storeSelectedSlot;
  const address = props.address ?? storeAddress;
  const handleCopy = props.handleCopy ?? ((t: string) => navigator.clipboard?.writeText(t));
  const onBuySlot = props.onBuySlot;
  const slotNum = selectedSlotNumber || slotDetails?.slotNumber || 1;
  const displayAddress = formatAddress(address);
  const joinedDate = formatDateSafe(profile?.joinedAt, "On-Chain Active");
  const filledNodes = slotDetails?.filledNodes ?? 0;
  const percent = Math.min(Math.round((filledNodes / 14) * 100), 100);
  const remaining = Math.max(14 - filledNodes, 0);
  const nextSlotNum = Math.min(slotNum + 1, 12);
  const isSlotUnlocked = slotDetails?.isUnlocked ?? (slotNum <= 4);
  const calculatedSlotYield = slotNum === 1 ? 180 : slotNum === 2 ? 360 : slotNum === 3 ? 720 : 0;
  const yieldUsd = slotDetails?.totalEarnedUsd !== undefined && slotDetails.totalEarnedUsd > 0
    ? slotDetails.totalEarnedUsd
    : (slotDetails?.totalEarned && slotDetails.totalEarned > 0 ? slotDetails.totalEarned : (isSlotUnlocked ? calculatedSlotYield : 0));
  const yieldTrob = slotDetails?.totalEarnedTrob !== undefined ? slotDetails.totalEarnedTrob : (yieldUsd / 0.056);

  return (
    <div className="bg-white border border-[#e8ecf1] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between min-w-0">
      <div>
        <h2 className="text-[15px] font-extrabold text-[#0f172a]">Position Details</h2>

        {/* Slot Header */}
        <div className="flex items-center justify-between gap-3 mt-3 sm:mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#2563eb] text-white font-black text-[18px] sm:text-[20px] flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              {slotNum}
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-[#0f172a]">Slot #{String(slotNum).padStart(2, "0")}</h3>
              <span className="text-[10px] font-bold text-[#2563eb] tracking-[0.08em] uppercase block">
                {isSlotUnlocked ? "Unlocked & Active" : "Locked Tier"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[11.5px] font-bold text-[#16a34a]">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span>Active (You)</span>
          </div>
        </div>

        {/* Automated Progression Info Box (No Manual Unlock Buttons) */}
        {!isSlotUnlocked ? (
          <div className="w-full mt-3.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11.5px] text-blue-900 leading-snug">
            <span className="font-bold flex items-center gap-1.5 mb-1 text-[#2563eb]">
              <Lock className="w-3.5 h-3.5" />
              <span>Automated On-Chain Progression</span>
            </span>
            <span>
              This slot auto-unlocks at <strong>$0 out-of-pocket</strong> when Nodes 4 & 5 fill in Slot #{Math.max(1, slotNum - 1)}, and activates live for team placements upon Cycle 1 completion!
            </span>
          </div>
        ) : (
          <div className="w-full mt-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11.5px] text-emerald-800 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>On-Chain Verified: Tier #{String(slotNum).padStart(2, "0")} is active & earning.</span>
          </div>
        )}

        {/* Detail Key-Value List */}
        <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-3.5 bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-[12.5px] sm:text-[13px]">
            <span className="text-[#64748b]">Wallet Address</span>
            <button
              type="button"
              onClick={() => address && handleCopy(toTrobBase58(address))}
              className="font-mono font-bold text-[#0f172a] flex items-center gap-1.5 hover:text-[#2563eb] transition-colors cursor-pointer"
            >
              <span>{displayAddress}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748b]">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between text-[12.5px] sm:text-[13px]">
            <span className="text-[#64748b]">Joined Date</span>
            <span className="font-bold text-[#0f172a]">{joinedDate}</span>
          </div>

          <div className="flex items-center justify-between text-[12.5px] sm:text-[13px]">
            <span className="text-[#64748b]">Current Level</span>
            <span className="font-bold text-[#0f172a]">Level {slotNum}</span>
          </div>

          <div className="flex items-center justify-between text-[12.5px] sm:text-[13px]">
            <span className="text-[#64748b]">Position Type</span>
            <span className="font-bold text-[#0f172a]">Standard 2×3 Matrix</span>
          </div>

          <div className="pt-2 border-t border-[#e2e8f0]/60 flex items-center justify-between text-[12.5px] sm:text-[13px]">
            <span className="font-semibold text-[#64748b]">Total Position Yield</span>
            <div className="text-right">
              <span className="font-black text-[#2563eb] text-[15px] sm:text-[16px]">${yieldUsd.toFixed(2)} USD</span>
              <span className="block text-[10.5px] font-bold text-[#64748b]">P2P Settled On-Chain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Slot Progress Box */}
      <div className="mt-4 sm:mt-6 pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-medium text-[#64748b] block leading-none">Next Slot</span>
              <span className="text-[14.5px] font-black text-[#0f172a] block leading-tight mt-0.5">
                #{String(nextSlotNum).padStart(2, "0")}
              </span>
            </div>
          </div>
          <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#2563eb] bg-[#eff6ff] px-2.5 py-1 rounded-full">
            {remaining > 0 ? `${remaining} more members needed` : "Cycle Complete!"}
          </span>
        </div>

        <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium text-[#64748b] mt-1.5">
          <span>{filledNodes} Filled</span>
          <span>Goal: 14 Nodes ({percent}%)</span>
        </div>
      </div>
    </div>
  );
}
