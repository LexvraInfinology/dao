"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { buildMatrixTree, getNodeLabel, formatBTT, isMagicBoxSlot } from "../../utils/btitan/matrixHelpers";
import { formatAddress } from "../../utils/btitan/formatters";
import { SLOT_COSTS } from "../../types/btitan";
import { useMatrixData, useSlotNodes } from "../../hooks/btitan/useMatrixData";
import { useJoinMatrix }  from "../../hooks/btitan/useJoinMatrix";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

/** Slot detail panel — loads node data on demand */
function SlotNodePanel({ address, slotNumber, onClose }: {
  address: `0x${string}`;
  slotNumber: number;
  onClose: () => void;
}) {
  const { nodes, filledNodes, currentCycle, upgradeReserve, slotEarned, isLoading } = useSlotNodes(address, slotNumber);
  const tree = buildMatrixTree(nodes);

  return (
    <div
      className="card"
      style={{ position: "relative", marginTop: "1.5rem",
               borderColor: "rgba(245,158,11,0.4)",
               background: "linear-gradient(135deg, rgba(245,158,11,0.06), transparent)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ fontWeight: 800, color: "#f59e0b" }}>
          Slot {slotNumber} — Cycle {currentCycle} — {filledNodes}/14 Nodes Filled
        </h3>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#64748b",
                   cursor: "pointer", fontSize: "1.25rem", padding: "0.25rem" }}
        >✕</button>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading node data..." />
      ) : (
        <>
          {/* Node Tree Visualization */}
          {tree.map((level) => (
            <div key={level.level} style={{ display: "flex", justifyContent: "center",
                                            gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {level.positions.map(({ position, address: nodeAddr }) => {
                const label = getNodeLabel(position, currentCycle);
                const isFilled = !!nodeAddr && nodeAddr !== "0x0000000000000000000000000000000000000000";
                return (
                  <div
                    key={position}
                    id={`matrix-node-${slotNumber}-${position}`}
                    className={`matrix-node ${
                      isFilled
                        ? label.label === "Your Wallet" ? "wallet"
                        : label.label === "Recycle"    ? "recycle"
                        : "filled"
                        : "empty"
                    }`}
                    title={`Pos ${position}: ${label.label}${nodeAddr ? ` — ${formatAddress(nodeAddr)}` : " — Empty"}`}
                    style={{ borderColor: isFilled ? label.color : undefined, cursor: "default" }}
                  >
                    {position}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
            <span className="badge badge-green">● Your Wallet</span>
            <span className="badge badge-blue">● Upline</span>
            <span className="badge badge-gold">● Next Slot Fund</span>
            <span className="badge" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316",
                                             border: "1px solid rgba(249,115,22,0.3)" }}>● Recycle</span>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <div>
              <div className="stat-label">Slot Earned</div>
              <div style={{ fontWeight: 700, color: "#22c55e" }}>{formatBTT(slotEarned)} BTT</div>
            </div>
            <div>
              <div className="stat-label">Upgrade Reserve</div>
              <div style={{ fontWeight: 700, color: "#f59e0b" }}>{formatBTT(upgradeReserve)} BTT</div>
            </div>
            <div>
              <div className="stat-label">Slot Cost</div>
              <div style={{ fontWeight: 700, color: "#94a3b8" }}>{formatBTT(SLOT_COSTS[slotNumber])} BTT</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MatrixPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [joinTargetSlot, setJoinTargetSlot] = useState<number | null>(null);
  const [sponsor, setSponsor] = useState("");

  const { slots, financials, globalStats, isLoading } = useMatrixData(address);
  const { joinSlot, step: joinStep, activeSlot, reset: resetJoin } = useJoinMatrix();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

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
    <div className="page-container" style={{ paddingTop: "2rem" }}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">🔢 Matrix Slots</h1>
        <p className="page-subtitle">
          12 levels · 14-node tree · Auto-upgrade on cycle completion · Magic Box at slots 3, 6, 9, 12
        </p>
      </div>

      {/* ─── Global Stats ────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Withdrawable Balance</div>
          <div className="stat-value">{formatBTT(financials.availableBalance)} BTT</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lifetime Earned</div>
          <div className="stat-value">{formatBTT(financials.lifetimeEarned)} BTT</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform Members</div>
          <div className="stat-value">{globalStats.totalMembers.toString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Royal Pool</div>
          <div className="stat-value">{formatBTT(globalStats.royalPool)} BTT</div>
        </div>
      </div>

      {/* ─── 12-Slot Grid ────────────────────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: "1rem" }}>
        Your <span>Slots</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {slots.map((slot) => (
          <div
            key={slot.slotNumber}
            id={`slot-card-${slot.slotNumber}`}
            className={`slot-card ${
              selectedSlot === slot.slotNumber ? "active" :
              slot.isUnlocked ? "unlocked" : "locked"
            }`}
            onClick={() => {
              if (slot.isUnlocked) {
                setSelectedSlot(selectedSlot === slot.slotNumber ? null : slot.slotNumber);
              } else {
                setJoinTargetSlot(slot.slotNumber);
              }
            }}
            style={{ position: "relative" }}
          >
            {isMagicBoxSlot(slot.slotNumber) && (
              <span
                style={{ position: "absolute", top: 6, right: 6, fontSize: "0.6rem",
                         background: "rgba(167,139,250,0.2)", color: "#a78bfa",
                         border: "1px solid rgba(167,139,250,0.4)",
                         borderRadius: "4px", padding: "1px 5px", fontWeight: 700 }}
              >
                ✨ MB
              </span>
            )}
            <div className="slot-number">SLOT {slot.slotNumber}</div>
            <div className="slot-cost">{formatBTT(slot.cost)} BTT</div>
            {slot.isUnlocked ? (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Cycle {slot.currentCycle} · {slot.filledNodes}/14 filled
                </div>
                <div style={{ marginTop: "0.4rem" }}>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${(slot.filledNodes / 14) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🔒</span>
                <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "0.2rem" }}>Click to unlock</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Slot Detail Panel ───────────────────────────────────────────── */}
      {selectedSlot && address && (
        <SlotNodePanel
          address={address as `0x${string}`}
          slotNumber={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {/* ─── Join Slot Modal ─────────────────────────────────────────────── */}
      {joinTargetSlot && (
        <div className="modal-overlay" onClick={() => { if (!isJoining) setJoinTargetSlot(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#e2e8f0", marginBottom: "1.5rem" }}>
              🔢 Unlock Slot {joinTargetSlot}
            </h3>

            <div className="card card-gold" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>Slot Cost</span>
                <span style={{ fontWeight: 700, color: "#f59e0b" }}>
                  {formatBTT(SLOT_COSTS[joinTargetSlot])} BTT
                </span>
              </div>
              {isMagicBoxSlot(joinTargetSlot) && (
                <div style={{ background: "rgba(167,139,250,0.1)", borderRadius: "8px",
                              padding: "0.5rem 0.75rem", marginTop: "0.5rem" }}>
                  <span style={{ color: "#a78bfa", fontSize: "0.8rem", fontWeight: 600 }}>
                    ✨ Magic Box Slot — NFT Badge + 1 BTT Vested on first completion!
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
                Sponsor Address (optional)
              </label>
              <input
                id="matrix-sponsor-input"
                className="input-field"
                placeholder="0x... (your referrer's wallet)"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                disabled={isJoining}
              />
            </div>

            <div style={{ fontSize: "0.8rem", color: "#94a3b8", background: "rgba(255,255,255,0.04)",
                          borderRadius: "8px", padding: "0.75rem", marginBottom: "1.25rem" }}>
              <strong>Step 1:</strong> Approve {formatBTT(SLOT_COSTS[joinTargetSlot])} BTT<br/>
              <strong>Step 2:</strong> Unlock Slot {joinTargetSlot} on-chain<br/>
              Current: {joinStep === "approving" ? "⏳ Approving..." : joinStep === "joining" ? "⏳ Unlocking..." : "Ready"}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { setJoinTargetSlot(null); resetJoin(); }}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button
                id={`unlock-slot-${joinTargetSlot}-btn`}
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleJoin}
                disabled={isJoining || activeSlot === joinTargetSlot}
              >
                {isJoining ? (
                  <><div className="spinner" />
                    {joinStep === "approving" ? "Approving BTT..." : "Unlocking Slot..."}
                  </>
                ) : (
                  `🔓 Unlock Slot ${joinTargetSlot}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
