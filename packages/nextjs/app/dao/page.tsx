"use client";

import { useState, useEffect } from "react";
import { useAccount }   from "wagmi";
import { useRouter }    from "next/navigation";
import { formatBTT }    from "../../utils/btitan/matrixHelpers";
import { useDAOData }   from "../../hooks/btitan/useDAOData";
import { useJoinDAO }   from "../../hooks/btitan/useJoinDAO";
import { useWithdraw }  from "../../hooks/btitan/useWithdraw";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

import { AuthGuard } from "../../components/auth/AuthGuard";

const MAX_POSITIONS = 50;

export default function DAOPage() {
  return (
    <AuthGuard>
      <DAOContent />
    </AuthGuard>
  );
}

function DAOContent() {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [sponsor, setSponsor] = useState("");

  const { memberInfo, stats, remainingPositions, previewDistribution, isLoading } = useDAOData(address);
  const { join, step: joinStep, errorMessage, reset: resetJoin } = useJoinDAO();
  const { withdrawFromDAO, withdrawing } = useWithdraw();

  // Auto-populate sponsor from URL ?ref= param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^0x[0-9a-fA-F]{40}$/.test(ref)) setSponsor(ref);
    }
  }, []);

  const handleJoin = async () => {
    await join(sponsor);
    if (joinStep === "success") {
      setShowModal(false);
      resetJoin();
    }
  };

  const handleWithdrawAll = async () => {
    if (memberInfo.availableBalance > 0n) {
      await withdrawFromDAO(memberInfo.availableBalance);
    }
  };

  if (!isConnected) return null;
  if (isLoading) return <LoadingSpinner fullPage label="Loading DAO data..." />;

  const isJoining = joinStep === "approving" || joinStep === "joining";

  return (
    <div className="page-container" style={{ paddingTop: "2rem" }}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">🏛️ Genesis DAO</h1>
        <p className="page-subtitle">
          50-position founding DAO · 300 BTT entry · Linear left-to-right distribution
        </p>
      </div>

      {/* ─── Stats Row ──────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-label">Positions Filled</div>
          <div className="stat-value">{stats.memberCount} / 50</div>
          <div style={{ marginTop: "0.5rem" }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(stats.memberCount / 50) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spots Remaining</div>
          <div className="stat-value" style={{ color: remainingPositions > 10 ? "#22c55e" : "#ef4444" }}>
            {remainingPositions}
          </div>
          <div className="stat-sub">{remainingPositions > 0 ? "Open for new members" : "DAO Complete"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Collected</div>
          <div className="stat-value">{formatBTT(stats.totalCollected)} BTT</div>
          <div className="stat-sub">Total deposited</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Your Position</div>
          <div className="stat-value" style={{ color: memberInfo.isMember ? "#f59e0b" : "#64748b" }}>
            {memberInfo.isMember ? `#${memberInfo.position}` : "—"}
          </div>
          <div className="stat-sub">{memberInfo.isMember ? "Active Member" : "Not joined"}</div>
        </div>
      </div>

      {/* ─── 50-Slot Visual Queue ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            DAO <span>Queue</span>
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge badge-green">🟢 Filled</span>
            <span className="badge badge-gold">⭐ You</span>
            <span className="badge badge-gray">⬜ Empty</span>
          </div>
        </div>
        <div className="dao-grid">
          {Array.from({ length: MAX_POSITIONS }, (_, i) => {
            const pos = i + 1;
            const isFilled = pos <= stats.memberCount;
            const isYours  = memberInfo.isMember && pos === memberInfo.position;
            return (
              <div
                key={pos}
                id={`dao-slot-${pos}`}
                className={`dao-slot ${isYours ? "yours" : isFilled ? "filled" : "empty"}`}
                title={isFilled ? `Position #${pos}${isYours ? " — You" : ""}` : `Position #${pos}: Available`}
              >
                {pos}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Next Distribution Preview ───────────────────────────────────── */}
      {stats.memberCount > 0 && (
        <div className="card card-gold" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "1rem" }}>
            📊 Next Member Distribution Preview
          </h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <div className="stat-label">Recipients</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>
                {previewDistribution.recipientCount}
              </div>
            </div>
            <div>
              <div className="stat-label">Each Receives</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>
                {formatBTT(previewDistribution.amountPerRecipient)} BTT
              </div>
            </div>
            <div>
              <div className="stat-label">Total Distributed</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#60a5fa" }}>
                {formatBTT(stats.totalDistributed)} BTT
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Member Earnings Card ────────────────────────────────────────── */}
      {memberInfo.isMember && (
        <div className="card" style={{ marginBottom: "1.5rem", display: "flex",
             justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
             borderColor: "rgba(245,158,11,0.3)", background: "linear-gradient(135deg, rgba(245,158,11,0.08), transparent)" }}>
          <div>
            <div className="stat-label">Your DAO Balance</div>
            <div className="stat-value">{formatBTT(memberInfo.availableBalance)} BTT</div>
            <div className="stat-sub">
              Lifetime earned: {formatBTT(memberInfo.totalEarned)} BTT
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              id="dao-withdraw-btn"
              className="btn btn-primary"
              onClick={handleWithdrawAll}
              disabled={memberInfo.availableBalance === 0n || withdrawing === "dao"}
            >
              {withdrawing === "dao" ? (
                <><div className="spinner" />Withdrawing...</>
              ) : (
                "💰 Withdraw All"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Join CTA ────────────────────────────────────────────────────── */}
      {!memberInfo.isMember && !stats.isCompleted && remainingPositions > 0 && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            id="join-dao-btn"
            className="btn btn-primary btn-lg animate-pulse-gold"
            onClick={() => setShowModal(true)}
          >
            🏛️ Join Genesis DAO — 300 BTT
          </button>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.75rem" }}>
            You'll receive position #{stats.memberCount + 1} of 50
          </p>
        </div>
      )}

      {stats.isCompleted && !memberInfo.isMember && (
        <div className="card" style={{ textAlign: "center", marginTop: "2rem", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏆</div>
          <div style={{ fontWeight: 700, color: "#f59e0b", fontSize: "1.25rem" }}>
            Genesis DAO is Complete — All 50 Spots Filled!
          </div>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Stay tuned for the next round.
          </p>
        </div>
      )}

      {/* ─── Join Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { if (!isJoining) setShowModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#e2e8f0", marginBottom: "1.5rem" }}>
              🏛️ Join Genesis DAO
            </h3>

            <div className="card card-gold" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Entry Fee</span>
                <span style={{ fontWeight: 700, color: "#f59e0b" }}>300 BTT</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Your Position</span>
                <span style={{ fontWeight: 700, color: "#e2e8f0" }}>#{stats.memberCount + 1} / 50</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Step</span>
                <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: "0.875rem" }}>
                  {joinStep === "approving" ? "1/2 Approving..." :
                   joinStep === "joining"   ? "2/2 Joining DAO..." :
                   "2 wallet confirmations needed"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
                Referral Address (optional)
              </label>
              <input
                id="dao-sponsor-input"
                className="input-field"
                placeholder="0x... (your referrer's wallet)"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                disabled={isJoining}
              />
            </div>

            {errorMessage && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem",
                            color: "#ef4444", fontSize: "0.8rem" }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { setShowModal(false); resetJoin(); }}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button
                id="confirm-join-dao-btn"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? (
                  <><div className="spinner" />
                    {joinStep === "approving" ? "Approving BTT..." : "Joining DAO..."}
                  </>
                ) : (
                  "✅ Confirm Join — 300 BTT"
                )}
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: "1rem", textAlign: "center" }}>
              Two wallet confirmations: approve BTT, then join DAO.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
