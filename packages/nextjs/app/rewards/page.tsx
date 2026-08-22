"use client";

import { useAccount } from "wagmi";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { formatCountdown, formatBps } from "../../utils/btitan/formatters";
import { useRewardsData } from "../../hooks/btitan/useRewardsData";
import { RANK_LABELS, RANK_COLORS, BTitanRank } from "../../types/btitan";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  IconAward,
  IconLock,
  IconZap,
  IconCheck,
  IconShield,
  IconWallet,
  IconChart,
  LogoTitan,
} from "../../components/ui/Icons";
import { AuthGuard } from "../../components/auth/AuthGuard";

const MAGIC_BOX_MILESTONES = [
  { slot: 3, rank: "Rising Star", color: "#f59e0b", nftType: "RISING" },
  { slot: 6, rank: "Prime", color: "#8b5cf6", nftType: "PRIME" },
  { slot: 9, rank: "Royal", color: "#06b6d4", nftType: "ROYAL" },
  { slot: 12, rank: "Legendary", color: "#f97316", nftType: "LEGENDARY" },
];

export default function RewardsPage() {
  return (
    <AuthGuard>
      <RewardsContent />
    </AuthGuard>
  );
}

function RewardsContent() {
  const { address, isConnected } = useAccount();
  const { nfts, vestingData, claimVestingLock, isLoading } = useRewardsData(address);

  if (!isConnected) return null;
  if (isLoading) return <LoadingSpinner fullPage label="Loading rewards data..." />;

  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-violet" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
            <IconAward size={14} /> NFT MILESTONES & 3-YEAR VESTING VAULT
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
          Magic Box <span className="gradient-text-gold">NFT Vault</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
          Attain milestone rank NFTs, lock equity in the 3-year protocol vault, and receive long-term platform dividend shares.
        </p>
      </div>

      {/* ─── User NFT Rank Badge Card ────────────────────────────────────── */}
      <div
        className="glass-card glass-card-gold"
        style={{
          marginBottom: "2.5rem",
          padding: "2.5rem 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(139,92,246,0.2))",
            border: "1px solid rgba(245,158,11,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            boxShadow: "0 0 35px rgba(245,158,11,0.3)",
          }}
        >
          <LogoTitan size={52} />
        </div>

        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 900,
            color: RANK_COLORS[nfts.rank] || "#ffffff",
            fontFamily: "var(--font-heading)",
            margin: "0 0 0.4rem 0",
          }}
        >
          {RANK_LABELS[nfts.rank]}
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>
          {nfts.rank === BTitanRank.NONE
            ? "Complete Slot 3 cycle to earn your first prestigious rank NFT badge"
            : `Achieved at Slot ${nfts.rank * 3} completion • Token ID #${nfts.welcomePassTokenId}`}
        </p>

        {nfts.hasWelcomePass && (
          <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
            <span className="badge-glow badge-gold" style={{ fontSize: "0.8rem", padding: "0.3rem 0.85rem" }}>
              <IconAward size={14} /> Welcome Pass #{nfts.welcomePassTokenId}
            </span>
            <span className="badge-glow badge-green" style={{ fontSize: "0.8rem", padding: "0.3rem 0.85rem" }}>
              <IconCheck size={14} /> {nfts.allTokenIds.length} NFT Badges Verified
            </span>
          </div>
        )}
      </div>

      {/* ─── 4 Milestone Rank Cards ──────────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: "1.25rem", textAlign: "left" }}>
        Magic Box <span>Milestones</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        {MAGIC_BOX_MILESTONES.map((m) => {
          const achieved = nfts.rank >= m.slot / 3;
          return (
            <div
              key={m.slot}
              className="glass-card"
              style={{
                padding: "1.75rem",
                textAlign: "center",
                border: achieved ? `1px solid ${m.color}60` : "1px solid rgba(255,255,255,0.06)",
                background: achieved ? `linear-gradient(180deg, ${m.color}15, rgba(15,23,42,0.7))` : "rgba(15,23,42,0.4)",
                boxShadow: achieved ? `0 0 25px ${m.color}20` : "none",
                opacity: achieved ? 1 : 0.7,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  background: achieved ? `${m.color}25` : "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 0.75rem",
                }}
              >
                <IconAward size={26} color={achieved ? m.color : "#64748b"} />
              </div>

              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: m.color, textTransform: "uppercase" }}>
                Slot {m.slot}
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)", margin: "0.25rem 0" }}>
                {m.rank}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                NFT Badge + 1 BTT (3-Yr Locked)
              </div>

              <div style={{ marginTop: "1rem" }}>
                {achieved ? (
                  <span className="badge-glow badge-green" style={{ fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>
                    <IconCheck size={12} /> Milestone Achieved
                  </span>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <IconLock size={12} /> Locked (Reach S{m.slot})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Vesting Vault Table ─────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: "0 0 0.25rem 0" }}>
              3-Year Vesting Vault
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              Automatic time-locked equity pool from Magic Box completions.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Total Locked</span>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#a78bfa" }}>
                {formatBTT(vestingData.totalLocked)} BTT
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Claimable</span>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#22c55e" }}>
                {formatBTT(vestingData.claimableAmount)} BTT
              </div>
            </div>
          </div>
        </div>

        {vestingData.locks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <IconLock size={28} color="#64748b" />
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
              No active vesting locks yet. Complete Magic Box slots (3, 6, 9, 12) to vest BTT automatically.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Lock #</th>
                  <th style={{ textAlign: "left" }}>Amount</th>
                  <th style={{ textAlign: "left" }}>Milestone</th>
                  <th style={{ textAlign: "left" }}>Unlock Timeline</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {vestingData.locks.map((lock, i) => {
                  const unlockTs = Number(lock.unlockTimestamp);
                  const remaining = unlockTs - now;
                  const isUnlocked = remaining <= 0;
                  return (
                    <tr key={i}>
                      <td style={{ color: "#64748b", fontWeight: 700 }}>#{i + 1}</td>
                      <td style={{ fontWeight: 800, color: "#a78bfa" }}>
                        {formatBTT(lock.amount)} BTT
                      </td>
                      <td>
                        <span className="badge-glow badge-violet" style={{ fontSize: "0.75rem" }}>
                          Slot {lock.milestoneSlot}
                        </span>
                      </td>
                      <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        {isUnlocked ? "Unlocked & Ready" : formatCountdown(remaining)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {lock.claimed ? (
                          <span className="badge badge-gray">Claimed</span>
                        ) : isUnlocked ? (
                          <span className="badge-glow badge-green">Ready to Claim</span>
                        ) : (
                          <span className="badge badge-violet">Vesting</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {!lock.claimed && isUnlocked && (
                          <button
                            id={`claim-lock-${i}-btn`}
                            className="btn btn-primary btn-sm"
                            onClick={() => claimVestingLock(i)}
                          >
                            Claim BTT
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
