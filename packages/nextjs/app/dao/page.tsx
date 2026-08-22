"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { useDAOData } from "../../hooks/btitan/useDAOData";
import { useJoinDAO } from "../../hooks/btitan/useJoinDAO";
import { useWithdraw } from "../../hooks/btitan/useWithdraw";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  IconShield,
  IconZap,
  IconCheck,
  IconUsers,
  IconWallet,
  IconChart,
  IconClose,
  IconLock,
  LogoTitan,
} from "../../components/ui/Icons";
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
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-gold" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
            <IconShield size={14} /> EXCLUSIVE FOUNDING ALLOCATION
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
          Genesis <span className="gradient-text-gold">DAO Pool</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
          Hard-capped at strictly 50 founding members • 300 BTT entry • 90% automated equal distribution across all earlier members in real-time.
        </p>
      </div>

      {/* ─── Stats Row ──────────────────────────────────────────────────── */}
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
              Slots Claimed
            </span>
            <IconUsers size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {stats.memberCount} <span style={{ fontSize: "1.25rem", color: "#94a3b8", fontWeight: 700 }}>/ 50</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, marginTop: "0.75rem", overflow: "hidden" }}>
            <div
              style={{
                width: `${(stats.memberCount / 50) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: remainingPositions > 10 ? "#22c55e" : "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Remaining Slots
            </span>
            <IconShield size={20} color={remainingPositions > 10 ? "#22c55e" : "#ef4444"} />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {remainingPositions}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            {remainingPositions > 0 ? "Open for new founding members" : "DAO Strictly Closed"}
          </p>
        </div>

        <div className="glass-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Distributed
            </span>
            <IconChart size={20} color="#60a5fa" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {formatBTT(stats.totalDistributed)} <span style={{ fontSize: "1rem", color: "#60a5fa" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            100% on-chain instant payout
          </p>
        </div>

        <div className="glass-card glass-card-violet" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Membership
            </span>
            <IconWallet size={20} color="#a78bfa" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {memberInfo.isMember ? `Slot #${memberInfo.position}` : "Not Joined"}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            {memberInfo.isMember ? `Lifetime: ${formatBTT(memberInfo.totalEarned)} BTT` : "Join below to reserve spot"}
          </p>
        </div>
      </div>

      {/* ─── 50-Slot Visual Grid ─────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: "0 0 0.25rem 0" }}>
              50-Slot Visual Queue Matrix
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              Live on-chain allocation order. Earlier members receive a proportional share of all subsequent entries.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", fontSize: "0.8rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#22c55e", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} /> Filled
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f59e0b", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} /> Your Slot
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} /> Available
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {Array.from({ length: MAX_POSITIONS }, (_, i) => {
            const pos = i + 1;
            const isFilled = pos <= stats.memberCount;
            const isYours = memberInfo.isMember && pos === memberInfo.position;

            return (
              <div
                key={pos}
                id={`dao-slot-${pos}`}
                style={{
                  height: 48,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-heading)",
                  transition: "all 0.2s ease",
                  cursor: "default",
                  background: isYours
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : isFilled
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isYours
                    ? "2px solid #fbbf24"
                    : isFilled
                    ? "1px solid rgba(34, 197, 94, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  color: isYours ? "#0a0f1a" : isFilled ? "#22c55e" : "#64748b",
                  boxShadow: isYours ? "0 0 15px rgba(245,158,11,0.4)" : "none",
                }}
                title={isFilled ? `Slot #${pos}${isYours ? " (You)" : " (Claimed)"}` : `Slot #${pos} Available`}
              >
                {pos}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Member Action Banner ────────────────────────────────────────── */}
      {memberInfo.isMember && (
        <div
          className="glass-card glass-card-gold"
          style={{
            padding: "2rem",
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <span className="badge-glow badge-gold" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
              <IconCheck size={14} /> ACTIVE FOUNDING MEMBER
            </span>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff", margin: "0.25rem 0" }}>
              Available DAO Balance: {formatBTT(memberInfo.availableBalance)} BTT
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              Lifetime DAO Payouts: <strong style={{ color: "#e2e8f0" }}>{formatBTT(memberInfo.totalEarned)} BTT</strong>
            </p>
          </div>

          <button
            id="dao-withdraw-btn"
            className="btn btn-primary btn-lg"
            onClick={handleWithdrawAll}
            disabled={memberInfo.availableBalance === 0n || withdrawing === "dao"}
          >
            {withdrawing === "dao" ? "Processing Withdrawal..." : "Withdraw DAO Earnings"}
          </button>
        </div>
      )}

      {/* ─── Join CTA for Non-Members ────────────────────────────────────── */}
      {!memberInfo.isMember && !stats.isCompleted && remainingPositions > 0 && (
        <div
          className="glass-card glass-card-gold"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            maxWidth: "680px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              boxShadow: "0 0 30px rgba(245,158,11,0.25)",
            }}
          >
            <LogoTitan size={44} />
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#ffffff", marginBottom: "0.5rem" }}>
            Claim Genesis DAO <span className="gradient-text-gold">Slot #{stats.memberCount + 1}</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            Join the founding 50 members for 300 BTT. Once joined, 90% of all future member deposits are automatically distributed directly into your account in every transaction block.
          </p>

          <button
            id="join-dao-btn"
            className="btn btn-primary btn-lg"
            onClick={() => setShowModal(true)}
            style={{ padding: "0.9rem 2.5rem", fontSize: "1rem" }}
          >
            <IconZap size={20} /> Join Genesis DAO — 300 BTT
          </button>
        </div>
      )}

      {/* ─── Join Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { if (!isJoining) setShowModal(false); }}>
          <div
            className="glass-card glass-card-gold"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", width: "92%", padding: "2.25rem 2rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Genesis DAO Entry
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <IconClose size={20} />
              </button>
            </div>

            <div className="glass-card" style={{ marginBottom: "1.25rem", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Fixed Entry Fee</span>
                <span style={{ fontWeight: 800, color: "#f59e0b" }}>300 BTT</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Reserved Slot</span>
                <span style={{ fontWeight: 800, color: "#ffffff" }}>Slot #{stats.memberCount + 1} of 50</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>On-Chain Step</span>
                <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: "0.875rem" }}>
                  {joinStep === "approving" ? "1/2 Approving BTT..." : joinStep === "joining" ? "2/2 Joining Pool..." : "Approve & Join"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                Sponsor / Referral Address (Optional)
              </label>
              <input
                id="dao-sponsor-input"
                className="input-field"
                placeholder="0x... (Sponsor address)"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                disabled={isJoining}
                style={{ width: "100%" }}
              />
            </div>

            {errorMessage && (
              <div
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  color: "#ef4444",
                  fontSize: "0.825rem",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => { setShowModal(false); resetJoin(); }}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button
                id="confirm-join-dao-btn"
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: "center" }}
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining
                  ? joinStep === "approving"
                    ? "1/2 Approving..."
                    : "2/2 Joining..."
                  : "Confirm 300 BTT Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
