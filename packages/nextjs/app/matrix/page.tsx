"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { buildMatrixTree, getNodeLabel, formatBTT, isMagicBoxSlot, getSlotPrice } from "../../utils/btitan/matrixHelpers";
import { formatAddress } from "../../utils/btitan/formatters";
import { SLOT_COSTS } from "../../types/btitan";
import { useMatrixData, useSlotNodes } from "../../hooks/btitan/useMatrixData";
import { useJoinMatrix } from "../../hooks/btitan/useJoinMatrix";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  IconGrid,
  IconZap,
  IconCheck,
  IconLock,
  IconUsers,
  IconAward,
  IconWallet,
  IconChart,
  IconClose,
  IconShield,
  LogoTitan,
} from "../../components/ui/Icons";
import { AuthGuard } from "../../components/auth/AuthGuard";

/** Slot detail panel — loads node data on demand */
function SlotNodePanel({
  address,
  slotNumber,
  onClose,
}: {
  address: `0x${string}`;
  slotNumber: number;
  onClose: () => void;
}) {
  const { nodes, filledNodes, currentCycle, upgradeReserve, slotEarned, isLoading } = useSlotNodes(address, slotNumber);
  const tree = buildMatrixTree(nodes);

  return (
    <div
      className="glass-card glass-card-gold"
      style={{
        marginTop: "2rem",
        padding: "2rem",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge-glow badge-gold" style={{ marginBottom: "0.4rem", display: "inline-flex" }}>
            14-NODE TREE VISUALIZER
          </span>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ffffff", margin: "0.25rem 0" }}>
            Slot {slotNumber} • Cycle #{currentCycle} ({filledNodes} / 14 Nodes Filled)
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
          }}
        >
          <IconClose size={16} /> Close Visualizer
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading 14-node tree on-chain..." />
      ) : (
        <>
          {/* Node Tree Visualization */}
          <div
            style={{
              padding: "2rem 1rem",
              background: "rgba(10, 15, 26, 0.6)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "1.5rem",
              overflowX: "auto",
            }}
          >
            {tree.map((level) => (
              <div
                key={level.level}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: level.level === 1 ? "3.5rem" : level.level === 2 ? "1.5rem" : "0.6rem",
                  marginBottom: "1.5rem",
                  flexWrap: "nowrap",
                  minWidth: "600px",
                }}
              >
                {level.positions.map(({ position, address: nodeAddr }) => {
                  const label = getNodeLabel(position, currentCycle);
                  const isFilled = !!nodeAddr && nodeAddr !== "0x0000000000000000000000000000000000000000";

                  return (
                    <div
                      key={position}
                      id={`matrix-node-${slotNumber}-${position}`}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-heading)",
                        background: isFilled
                          ? label.label === "Your Wallet"
                            ? "rgba(34, 197, 94, 0.2)"
                            : label.label === "Recycle"
                            ? "rgba(249, 115, 22, 0.2)"
                            : "rgba(96, 165, 250, 0.2)"
                          : "rgba(255, 255, 255, 0.03)",
                        border: isFilled
                          ? `2px solid ${label.color}`
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        color: isFilled ? label.color : "#64748b",
                        boxShadow: isFilled ? `0 0 15px ${label.color}30` : "none",
                        cursor: "default",
                      }}
                      title={`Position #${position}: ${label.label}${nodeAddr ? ` (${formatAddress(nodeAddr)})` : " (Empty)"}`}
                    >
                      <span>{position}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Color Legend */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "1.5rem", fontSize: "0.8rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#22c55e", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} /> Direct Payout
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#60a5fa", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#60a5fa" }} /> Upline Sponsor
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#06b6d4", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#06b6d4" }} /> Downline Spillover
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f59e0b", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} /> Next Slot Reserve
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f97316", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316" }} /> Rebirth Recycle
            </span>
          </div>

          {/* Slot Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Slot Earnings</span>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#22c55e", fontFamily: "var(--font-heading)" }}>
                {formatBTT(slotEarned)} BTT
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Auto-Upgrade Reserve</span>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#f59e0b", fontFamily: "var(--font-heading)" }}>
                {formatBTT(upgradeReserve)} BTT
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Slot Price</span>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
                {formatBTT(SLOT_COSTS[slotNumber])} BTT
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MatrixPage() {
  return (
    <AuthGuard>
      <MatrixContent />
    </AuthGuard>
  );
}

function MatrixContent() {
  const { address, isConnected } = useAccount();

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [joinTargetSlot, setJoinTargetSlot] = useState<number | null>(null);
  const [sponsor, setSponsor] = useState("");

  const { slots, financials, globalStats, isLoading } = useMatrixData(address);
  const { joinSlot, step: joinStep, activeSlot, reset: resetJoin } = useJoinMatrix();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^0x[0-9a-fA-F]{40}$/.test(ref)) setSponsor(ref);
    }
  }, []);

  const handleJoin = async () => {
    if (!joinTargetSlot) return;
    await joinSlot(joinTargetSlot, sponsor);
    if (joinStep === "success") {
      setJoinTargetSlot(null);
      resetJoin();
    }
  };

  if (!isConnected) return null;
  if (isLoading) return <LoadingSpinner fullPage label="Loading matrix data..." />;

  const isJoining = joinStep === "approving" || joinStep === "joining";

  return (
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-violet" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
            <IconGrid size={14} /> 12-TIER PROGRESSIVE PROTOCOL ENGINE
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.02em",
            margin: "0 0 0.5rem 0",
          }}
        >
          12-Slot <span className="gradient-text-gold">Matrix Engine</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "620px", margin: "0 auto", lineHeight: 1.6 }}>
          14-Node binary matrices • 100% direct payouts & community spillover • Automatic upgrade reserve funds & infinite rebirth cycles.
        </p>
      </div>

      {/* ─── Top Stats Grid ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="glass-card glass-card-gold" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Available Withdrawable
            </span>
            <IconWallet size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {formatBTT(financials.availableBalance)} <span style={{ fontSize: "1rem", color: "#f59e0b" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            Instant withdrawal on-demand
          </p>
        </div>

        <div className="glass-card glass-card-violet" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Lifetime Earned
            </span>
            <IconChart size={20} color="#a78bfa" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {formatBTT(financials.lifetimeEarned)} <span style={{ fontSize: "1rem", color: "#a78bfa" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            Cumulative matrix payout
          </p>
        </div>

        <div className="glass-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Global Network
            </span>
            <IconUsers size={20} color="#60a5fa" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {globalStats.totalMembers.toString()}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            Active registered participants
          </p>
        </div>

        <div className="glass-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Royal Pool Reserve
            </span>
            <IconAward size={20} color="#22c55e" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {formatBTT(globalStats.royalPool)} <span style={{ fontSize: "1rem", color: "#22c55e" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            Platform milestone rewards
          </p>
        </div>
      </div>

      {/* ─── 12-Slot Interactive Grid ─────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem" }}>
          12 Progressive Matrix Tiers
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {slots.map((slot) => {
            const isMagic = isMagicBoxSlot(slot.slotNumber);
            const isSelected = selectedSlot === slot.slotNumber;

            return (
              <div
                key={slot.slotNumber}
                id={`slot-card-${slot.slotNumber}`}
                className="glass-card"
                onClick={() => {
                  if (slot.isUnlocked) {
                    setSelectedSlot(isSelected ? null : slot.slotNumber);
                  } else {
                    setJoinTargetSlot(slot.slotNumber);
                  }
                }}
                style={{
                  padding: "1.5rem",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.25s ease",
                  border: isSelected
                    ? "2px solid #f59e0b"
                    : slot.isUnlocked
                    ? "1px solid rgba(139, 92, 246, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  background: isSelected
                    ? "linear-gradient(180deg, rgba(245,158,11,0.15), rgba(15,23,42,0.8))"
                    : slot.isUnlocked
                    ? "rgba(139, 92, 246, 0.06)"
                    : "rgba(15, 23, 42, 0.4)",
                  boxShadow: isSelected ? "0 0 25px rgba(245,158,11,0.25)" : "none",
                }}
              >
                {isMagic && (
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      fontSize: "0.65rem",
                      background: "rgba(167,139,250,0.2)",
                      color: "#a78bfa",
                      border: "1px solid rgba(167,139,250,0.4)",
                      borderRadius: "6px",
                      padding: "2px 6px",
                      fontWeight: 800,
                    }}
                  >
                    MAGIC BOX
                  </span>
                )}

                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: slot.isUnlocked ? "#f59e0b" : "#64748b", textTransform: "uppercase" }}>
                  Slot {slot.slotNumber}
                </div>

                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)", margin: "0.35rem 0" }}>
                  {formatBTT(slot.cost)} <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>BTT</span>
                </div>

                {slot.isUnlocked ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.35rem" }}>
                      <span>Cycle #{slot.currentCycle}</span>
                      <span style={{ color: "#22c55e", fontWeight: 700 }}>{slot.filledNodes} / 14</span>
                    </div>
                    <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(slot.filledNodes / 14) * 100}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #22c55e, #10b981)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 600, marginTop: "0.6rem" }}>
                      {isSelected ? "▲ Hide Tree" : "▼ View Tree"}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.75rem" }}>
                    <IconLock size={14} /> Tap to unlock
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Selected Slot Tree Panel ────────────────────────────────────── */}
      {selectedSlot && address && (
        <SlotNodePanel
          address={address as `0x${string}`}
          slotNumber={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {/* ─── Join Target Slot Modal ──────────────────────────────────────── */}
      {joinTargetSlot && (
        <div className="modal-overlay" onClick={() => { if (!isJoining) setJoinTargetSlot(null); }}>
          <div
            className="glass-card glass-card-gold"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", width: "92%", padding: "2.25rem 2rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Unlock Slot {joinTargetSlot}
              </h3>
              <button
                onClick={() => setJoinTargetSlot(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <IconClose size={20} />
              </button>
            </div>

            <div className="glass-card" style={{ marginBottom: "1.25rem", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Required BTT Deposit</span>
                <span style={{ fontWeight: 800, color: "#f59e0b" }}>
                  {formatBTT(SLOT_COSTS[joinTargetSlot])} BTT
                </span>
              </div>
              {isMagicBoxSlot(joinTargetSlot) && (
                <div style={{ background: "rgba(167,139,250,0.12)", borderRadius: "8px", padding: "0.6rem 0.85rem", marginTop: "0.5rem" }}>
                  <span style={{ color: "#a78bfa", fontSize: "0.8rem", fontWeight: 700 }}>
                    ✨ Magic Box Milestone: Unlocks NFT Badge + 3-Year Vesting Share!
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                Sponsor Address (Optional)
              </label>
              <input
                id="matrix-sponsor-input"
                className="input-field"
                placeholder="0x... (Sponsor address)"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                disabled={isJoining}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => { setJoinTargetSlot(null); resetJoin(); }}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button
                id={`unlock-slot-${joinTargetSlot}-btn`}
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: "center" }}
                onClick={handleJoin}
                disabled={isJoining || activeSlot === joinTargetSlot}
              >
                {isJoining
                  ? joinStep === "approving"
                    ? "1/2 Approving..."
                    : "2/2 Unlocking..."
                  : `Confirm ${formatBTT(SLOT_COSTS[joinTargetSlot])} BTT`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
