"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  buildMatrixTree,
  formatBTT,
  getNodeLabel,
  isMagicBoxSlot,
  MatrixTreeNode,
} from "../../utils/equora/matrixHelpers";
import { formatAddress } from "../../utils/equora/formatters";
import { SLOT_COSTS } from "../../types/equora";
import { useMatrixData, useSlotNodes } from "../../hooks/equora/useMatrixData";
import { useJoinMatrix } from "../../hooks/equora/useJoinMatrix";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function MatrixPage() {
  return (
    <AuthGuard>
      <MatrixContent />
    </AuthGuard>
  );
}

function MatrixContent() {
  const { address } = useAccount();
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MatrixTreeNode | null>(null);

  const { slots, isLoading: loadingMatrix, refetch: refetchMatrix } = useMatrixData(address);
  const {
    nodes,
    filledNodes,
    currentCycle,
    slotEarned,
    cycleSnapshotsCount,
    isLoading: loadingNodes,
    refetch: refetchNodes,
  } = useSlotNodes(address as `0x${string}`, selectedSlot);

  const { isApproving, isJoining, handleJoinSlot } = useJoinMatrix(selectedSlot, undefined, () => {
    refetchMatrix();
    refetchNodes();
  });

  const currentSlotData = slots.find((s) => s.slotNumber === selectedSlot);
  const isUnlocked = currentSlotData ? currentSlotData.isUnlocked : selectedSlot === 1;
  const tree = buildMatrixTree(nodes);
  const slotCost = SLOT_COSTS[selectedSlot] || 30n;

  return (
    <div className="flex flex-col w-full relative min-h-full font-body-md text-on-surface">
      {/* ─── Network Particles Background ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <g className="text-primary">
            <circle cx="10%" cy="20%" r="2" className="animate-pulse" />
            <circle cx="30%" cy="10%" r="3" className="animate-pulse" />
            <circle cx="80%" cy="40%" r="2" className="animate-pulse" />
            <circle cx="60%" cy="80%" r="4" className="animate-pulse" />
            <circle cx="90%" cy="90%" r="2" className="animate-pulse" />
            <circle cx="20%" cy="70%" r="3" className="animate-pulse" />
            <path
              d="M 10% 20% L 30% 10% L 80% 40% L 90% 90% L 60% 80% L 20% 70% Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className="opacity-20"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col gap-stack-lg w-full max-w-container-max mx-auto">
        {/* ─── Hero Banner with 3D Matrix Slots Artwork ─────────────────────────── */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-outline-variant/25 shadow-2xl bg-surface-container/60 backdrop-blur-xl p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-label-md uppercase tracking-wider font-bold">
                12-Slot Binary Matrix
              </span>
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-code font-bold bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Slot #{selectedSlot} Active (Cycle #{currentCycle})
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-headline-xl font-black text-on-surface leading-tight">
              14-Node <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">Autonomous Matrix</span>
            </h1>
            <p className="text-xs sm:text-body-md text-on-surface-variant max-w-xl leading-relaxed">
              Experience zero out-of-pocket progression. Single-time $30 entry automatically unlocks all 12 slots via P4 & P5 reserves while generating 700% cycle returns with endless automated recycles.
            </p>
          </div>

          <div className="relative w-full md:w-64 h-36 sm:h-44 rounded-2xl overflow-hidden shrink-0 border border-outline-variant/30 shadow-lg group">
            <img
              src="/assets/branding/matrix_slots.jpg"
              alt="12 Matrix Slots 3D Visualization"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
              <span className="text-[11px] font-bold font-code text-white/90">
                Slot {selectedSlot} Cost: {formatBTT(slotCost)} TROB
              </span>
            </div>
          </div>
        </div>

        {/* ─── Horizontal Slot Selector (Touch-friendly) ─────────────────── */}
        <div className="flex flex-col gap-2.5 w-full bg-surface-container/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-label-md uppercase tracking-wider font-bold">
              Select Matrix Slot (1 to 12)
            </span>
            <span className="text-[11px] text-tertiary font-code font-bold">
              ★ Stars = Magic Blind Box Milestone Slots
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide max-w-full">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((slotNum) => {
              const isSelected = selectedSlot === slotNum;
              const slotInfo = slots.find((s) => s.slotNumber === slotNum);
              const unlocked = slotInfo ? slotInfo.isUnlocked : slotNum === 1;
              const isMilestone = isMagicBoxSlot(slotNum);

              return (
                <button
                  key={slotNum}
                  onClick={() => setSelectedSlot(slotNum)}
                  className={`relative min-w-[48px] h-12 sm:min-w-[54px] sm:h-13 shrink-0 rounded-xl font-headline-md text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(185,199,228,0.4)] scale-105 ring-2 ring-primary"
                      : unlocked
                      ? "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant hover:text-primary border border-outline-variant/20"
                      : "bg-surface-container-low text-outline opacity-40 border border-outline-variant/10"
                  }`}
                >
                  <span className="leading-none">S{slotNum}</span>
                  <span className="text-[9px] font-code opacity-80 mt-0.5">
                    ${Number(SLOT_COSTS[slotNum] || 30n)}
                  </span>
                  {isMilestone && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-tertiary rounded-full shadow-[0_0_6px_rgba(233,193,118,0.6)] flex items-center justify-center text-[9px] text-on-tertiary font-bold">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Main Content Split Layout (2 cols left, 1 col right) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Left Panel: Matrix Visualization (2 cols) */}
          <div className="col-span-1 lg:col-span-2 relative bg-surface-container/50 backdrop-blur-xl rounded-2xl p-4 sm:p-8 min-h-[560px] flex flex-col items-center justify-center shadow-lg overflow-hidden group border border-outline-variant/15">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {loadingNodes ? (
              <LoadingSpinner label="Loading matrix structure on-chain..." />
            ) : (
              <div className="relative w-full max-w-[800px] flex flex-col items-center justify-between z-10 py-6">
                {/* Level 1: Root Node (YOU) */}
                <div className="relative flex justify-center w-full z-20">
                  <div
                    onClick={() => setSelectedNode(tree[0]?.nodes[0] || null)}
                    className={`flex flex-col items-center group/node cursor-pointer transition-transform ${
                      selectedNode?.position === 0 ? "scale-110" : ""
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-b from-primary to-primary-container p-[2px] transition-all duration-300 hover:scale-110 ${
                        selectedNode?.position === 0
                          ? "ring-4 ring-primary shadow-[0_0_25px_rgba(185,199,228,0.5)]"
                          : "shadow-[0_0_20px_rgba(185,199,228,0.2)]"
                      }`}
                    >
                      <div className="w-full h-full rounded-full bg-surface-dim flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          person
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 text-xs text-primary font-code bg-surface-container-high px-2 py-0.5 rounded shadow-sm font-bold">
                      YOU (ROOT)
                    </span>
                  </div>
                </div>

                {/* Level 2: 2 Nodes (P1, P2 - Direct Referrals / Qualification) */}
                <div className="relative flex justify-between w-full max-w-xs sm:max-w-md z-20 mt-8">
                  {tree[1]?.nodes.map((node) => {
                    const isFilled = node.isFilled;
                    const isSelected = selectedNode?.position === node.position;

                    return (
                      <div
                        key={node.position}
                        onClick={() => setSelectedNode(node)}
                        className={`flex flex-col items-center relative group/node cursor-pointer transition-transform ${
                          isSelected ? "scale-110" : ""
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-full p-[2px] shadow-sm transition-transform duration-300 hover:scale-110 ${
                            isSelected
                              ? "ring-4 ring-primary shadow-[0_0_20px_rgba(185,199,228,0.5)]"
                              : ""
                          } ${
                            isFilled
                              ? "bg-gradient-to-b from-secondary-container to-surface"
                              : "bg-surface-container-high border-2 border-dashed border-outline-variant/30"
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center">
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                isFilled ? "text-secondary" : "text-outline"
                              }`}
                              style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {isFilled ? "account_circle" : "person_add"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`mt-2 text-[10px] font-code tracking-wider px-1.5 py-0.5 rounded shadow-sm font-bold ${
                            isFilled ? "text-secondary bg-surface-container" : "text-outline"
                          }`}
                        >
                          {isFilled ? `REF ${node.position}` : `P${node.position}`}
                        </span>
                        {isFilled && node.user && (
                          <span className="text-[9px] font-code text-on-surface-variant mt-0.5">
                            {formatAddress(node.user)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Level 3: 4 Nodes (P3, P4, P5, P6) */}
                <div className="relative flex justify-between w-full max-w-sm sm:max-w-xl z-20 mt-8 px-2 sm:px-6">
                  {tree[2]?.nodes.map((node) => {
                    const isFilled = node.isFilled;
                    const isFirstIncome = node.position === 3;
                    const isUpgrade = node.position === 4 || node.position === 5;
                    const isSelected = selectedNode?.position === node.position;

                    return (
                      <div
                        key={node.position}
                        onClick={() => setSelectedNode(node)}
                        className={`flex flex-col items-center cursor-pointer hover:-translate-y-1 transition-transform ${
                          isSelected ? "scale-110" : ""
                        }`}
                      >
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full p-[2px] shadow-sm flex items-center justify-center ${
                            isSelected
                              ? "ring-4 ring-primary shadow-[0_0_20px_rgba(185,199,228,0.5)]"
                              : ""
                          } ${
                            isFilled
                              ? isFirstIncome
                                ? "bg-gradient-to-b from-green-400 to-surface text-green-400"
                                : isUpgrade
                                ? "bg-gradient-to-b from-tertiary to-surface text-tertiary"
                                : "bg-gradient-to-b from-secondary-container to-surface text-secondary"
                              : "bg-surface-container-highest text-outline-variant"
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center">
                            <span
                              className="material-symbols-outlined text-[18px] sm:text-[20px]"
                              style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {isFilled ? (isFirstIncome ? "payments" : isUpgrade ? "upgrade" : "account_circle") : "person_add"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`mt-1 text-[9px] font-code font-bold ${
                            isFilled ? (isFirstIncome ? "text-green-400" : isUpgrade ? "text-tertiary" : "text-secondary") : "text-outline"
                          }`}
                        >
                          {isFilled ? (isFirstIncome ? "1ST INCOME" : isUpgrade ? "UPGRADE" : "DIRECT") : `P${node.position}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Level 4: 8 Nodes (P7 through P14) */}
                <div className="relative flex justify-between w-full max-w-xs sm:max-w-2xl z-20 mt-8 px-1 gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {tree[3]?.nodes.map((node) => {
                    const isFilled = node.isFilled;
                    const isRecycle = node.position === 14;
                    const isSelected = selectedNode?.position === node.position;

                    return (
                      <div
                        key={node.position}
                        onClick={() => setSelectedNode(node)}
                        className={`flex flex-col items-center shrink-0 cursor-pointer hover:-translate-y-1 transition-transform ${
                          isSelected ? "scale-110" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] shadow-sm flex items-center justify-center ${
                            isSelected
                              ? "ring-4 ring-primary shadow-[0_0_20px_rgba(185,199,228,0.5)]"
                              : ""
                          } ${
                            isFilled
                              ? isRecycle
                                ? "bg-gradient-to-b from-tertiary to-surface text-tertiary"
                                : "bg-gradient-to-b from-secondary-container to-surface text-secondary"
                              : "bg-surface-container-highest text-outline-variant"
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center">
                            <span
                              className="material-symbols-outlined text-[14px] sm:text-[16px]"
                              style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {isFilled ? (isRecycle ? "autorenew" : "payments") : "add"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`mt-1 text-[8px] sm:text-[9px] font-code font-bold ${
                            isRecycle ? "text-tertiary" : isFilled ? "text-secondary" : "text-outline"
                          }`}
                        >
                          {isRecycle ? "RECYCLE" : `P${node.position}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Node Inspector Card */}
                {selectedNode && (
                  <div className="w-full mt-6 bg-surface-container-high/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-primary/30 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {(() => {
                      const info = getNodeLabel(selectedNode.position, currentCycle);
                      return (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base shadow-inner"
                              style={{ backgroundColor: `${info.color}20`, color: info.color }}
                            >
                              {selectedNode.position === 0 ? "YOU" : `P${selectedNode.position}`}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm sm:text-base text-on-surface">
                                  {selectedNode.position === 0
                                    ? "Root Node (YOU)"
                                    : `Position ${selectedNode.position}: ${info.label}`}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    selectedNode.isFilled
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-surface-container text-outline"
                                  }`}
                                >
                                  {selectedNode.isFilled ? "Occupied" : "Open / Available"}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-0.5 max-w-lg">
                                {info.description}
                              </p>
                              {selectedNode.isFilled && selectedNode.user && (
                                <p className="text-[11px] font-code text-primary mt-1">
                                  Occupant: {selectedNode.user}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-outline font-bold block">
                                Payout Target
                              </span>
                              <span
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: info.color }}
                              >
                                {info.recipient}
                              </span>
                              <span className="text-[11px] text-on-surface font-code block">
                                {formatBTT(slotCost)} TROB
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedNode(null)}
                              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface flex items-center justify-center transition-colors"
                              title="Dismiss"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Legend Overlay */}
                <div className="w-full mt-8 flex flex-wrap gap-4 justify-center bg-surface/80 backdrop-blur p-4 rounded-xl shadow-md border border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary-container shadow-[0_0_5px_rgba(206,0,8,0.5)]" />
                    <span className="text-xs text-on-surface-variant font-bold">P1 & P2 Direct Referrals (Qualification)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                    <span className="text-xs text-on-surface-variant font-bold">P3 First Income Trigger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_5px_rgba(233,193,118,0.5)]" />
                    <span className="text-xs text-on-surface-variant font-bold">P14 Level Complete & Recycle</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Analytics & Protocol Architecture Guide (1 col) */}
          <div className="col-span-1 flex flex-col gap-stack-md">
            {/* Slot Stats Card */}
            <div className="bg-surface-container/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-outline-variant/10">
              <h3 className="text-headline-md font-headline-md text-on-surface text-lg font-bold mb-6">
                Slot {selectedSlot} Analytics
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end pb-2 border-b border-outline-variant/10">
                  <span className="text-body-md text-on-surface-variant text-xs font-bold">Cost</span>
                  <span className="text-xl sm:text-headline-lg font-code font-black text-primary">
                    {formatBTT(slotCost)} <span className="text-xs text-outline-variant font-normal">TROB</span>
                  </span>
                </div>
                <div className="flex justify-between items-end pb-2 border-b border-outline-variant/10">
                  <span className="text-body-md text-on-surface-variant text-xs font-bold">Cycles Completed</span>
                  <span className="text-base sm:text-headline-md font-code font-black text-on-surface">
                    {currentCycle - 1}
                  </span>
                </div>
                <div className="flex justify-between items-end pb-2">
                  <span className="text-body-md text-on-surface-variant text-xs font-bold">Slot Total Earned</span>
                  <span className="text-base sm:text-headline-md font-code font-black text-tertiary">
                    {formatBTT(slotEarned)} <span className="text-xs text-outline-variant font-normal">TROB</span>
                  </span>
                </div>
              </div>

              {!isUnlocked ? (
                <div className="mt-6 flex flex-col gap-3">
                  {selectedSlot > 1 && (
                    <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-xl text-[11px] text-on-surface-variant flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0">bolt</span>
                      <div>
                        <strong className="text-tertiary block font-bold">100% Autonomous Upgrade:</strong>
                        Slot {selectedSlot} auto-unlocks for free when positions P4 (50%) and P5 (50%) fill in Slot {selectedSlot - 1}. Zero out-of-pocket deposit required!
                      </div>
                    </div>
                  )}

                  {selectedSlot === 1 ? (
                    <button
                      onClick={() => handleJoinSlot(1)}
                      disabled={isApproving || isJoining}
                      className="w-full py-3.5 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock_open</span>
                      <span>
                        {isApproving
                          ? "Approving 30 TROB..."
                          : isJoining
                          ? "Activating Slot 1..."
                          : "Activate Slot 1 (30 TROB — One-Time Entry)"}
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="w-full py-3 bg-surface-container-high border border-outline-variant/30 rounded-xl text-center text-xs text-on-surface font-code flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                        <span>Auto-Unlocks via P4 + P5 in Slot {selectedSlot - 1} (Free)</span>
                      </div>
                      <button
                        onClick={() => handleJoinSlot(selectedSlot)}
                        disabled={isApproving || isJoining}
                        className="w-full py-2.5 bg-surface-variant hover:bg-surface-bright text-outline hover:text-on-surface text-[11px] font-label-md font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">flash_on</span>
                        <span>
                          {isApproving
                            ? "Approving..."
                            : isJoining
                            ? "Fast-Tracking..."
                            : `Optional: Manual Fast-Track (${formatBTT(slotCost)} TROB)`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full mt-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>View Cycle History ({cycleSnapshotsCount})</span>
                </button>
              )}
            </div>

            {/* Equora Guide Card */}
            <div className="bg-gradient-to-br from-surface-container-high to-surface-container relative rounded-2xl p-6 shadow-lg border border-outline-variant/20 overflow-hidden flex-1 flex flex-col justify-between group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[30px] group-hover:bg-primary/20 transition-colors duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container shadow-inner border border-primary/30 p-1">
                    <img
                      alt="Equora Protocol Architecture"
                      className="w-full h-full object-cover rounded-lg"
                      src="/assets/branding/equorafilogo.jpeg"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-label-md text-primary font-bold">EQUORA Protocol</span>
                    <span className="block text-[11px] text-outline font-code">System Architecture</span>
                  </div>
                </div>

                <div className="bg-surface-container-highest/50 p-4 rounded-xl rounded-tl-none border-l-2 border-primary text-xs leading-relaxed text-on-surface-variant flex flex-col gap-2.5">
                  <div>
                    <strong className="text-on-surface font-bold">1. Strictly One-Time $30 Entry:</strong>
                    <p className="mt-0.5">Participants only ever deposit $30 once. You never need to deposit out-of-pocket again.</p>
                  </div>
                  <div>
                    <strong className="text-tertiary font-bold">2. P4 + P5 Auto-Upgrade Engine:</strong>
                    <p className="mt-0.5">In Cycle 1, nodes P4 (50%) and P5 (50%) accumulate into your smart contract Upgrade Reserve to autonomously fund and unlock the next slot in the same block.</p>
                  </div>
                  <div>
                    <strong className="text-secondary font-bold">3. 14-Node Perpetual Recycling:</strong>
                    <p className="mt-0.5">Once all 14 nodes fill, P14 directs 85% to your sponsor and 15% to the Genesis DAO Council pool, resetting the matrix for endless 700% cycle yields.</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-xs">
                <span className="text-[11px] text-outline uppercase tracking-widest font-code font-bold">
                  Matrix Auto-Reentry: <span className="text-green-400">ON</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 text-sm"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-on-surface mb-2">Slot {selectedSlot} Cycle History</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Total historical cycles recorded on-chain: {cycleSnapshotsCount}
            </p>
            <div className="bg-surface-container-lowest p-4 rounded-xl text-xs font-code text-primary border border-outline-variant/15">
              Active Cycle: #{currentCycle} (Filled: {filledNodes} / 14 nodes)
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
