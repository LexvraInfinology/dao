"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { formatCountdown, formatBps } from "../../utils/btitan/formatters";
import { useRewardsData } from "../../hooks/btitan/useRewardsData";
import { RANK_LABELS, RANK_COLORS, BTitanRank } from "../../types/btitan";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const RANK_ICONS: Record<BTitanRank, string> = {
  [BTitanRank.NONE]:      "⬜",
  [BTitanRank.RISING]:    "🌟",
  [BTitanRank.PRIME]:     "💎",
  [BTitanRank.ROYAL]:     "👑",
  [BTitanRank.LEGENDARY]: "🔥",
};

import { AuthGuard } from "../../components/auth/AuthGuard";

const MAGIC_BOX_MILESTONES = [
  { slot: 3,  rank: "Rising Star", icon: "🌟", color: "#f59e0b", nftType: "RISING"    },
  { slot: 6,  rank: "Prime",       icon: "💎", color: "#8b5cf6", nftType: "PRIME"     },
  { slot: 9,  rank: "Royal",       icon: "👑", color: "#06b6d4", nftType: "ROYAL"     },
  { slot: 12, rank: "Legendary",   icon: "🔥", color: "#f97316", nftType: "LEGENDARY" },
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
    <div className="page-container" style={{ paddingTop: "2rem" }}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">🎁 Rewards</h1>
        <p className="page-subtitle">
          NFT badges, Magic Box vesting, and your equity in the B-TITAN ecosystem.
        </p>
      </div>

      {/* ─── NFT Rank Badge ───────────────────────────────────────────────── */}
      <div className="card card-gold" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>
          {RANK_ICONS[nfts.rank]}
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800,
                     color: RANK_COLORS[nfts.rank], marginBottom: "0.25rem" }}>
          {RANK_LABELS[nfts.rank]}
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {nfts.rank === BTitanRank.NONE
            ? "Unlock Slot 3 to earn your first rank badge"
            : `Earned at Slot ${nfts.rank * 3} completion · Token ID #${nfts.welcomePassTokenId}`}
        </p>

        {nfts.hasWelcomePass && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <span className="badge badge-gold">🎫 Welcome Pass #{nfts.welcomePassTokenId}</span>
            <span className="badge badge-green">✅ {nfts.allTokenIds.length} NFT(s)</span>
          </div>
        )}
      </div>

      {/* ─── Magic Box Milestones ─────────────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: "1rem" }}>
        ✨ <span>Magic Box</span> Milestones
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1rem", marginBottom: "2rem" }}>
        {MAGIC_BOX_MILESTONES.map((m) => {
          const achieved = nfts.rank >= m.slot / 3;
          return (
            <div
              key={m.slot}
              className="card"
              style={{
                textAlign: "center",
                borderColor: achieved ? `${m.color}40` : "rgba(255,255,255,0.08)",
                background: achieved ? `${m.color}10` : "var(--color-surface)",
                opacity: achieved ? 1 : 0.6,
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{m.icon}</div>
              <div style={{ fontWeight: 700, color: m.color, marginBottom: "0.25rem" }}>
                Slot {m.slot}
              </div>
              <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.875rem" }}>{m.rank}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                NFT Badge + 1 BTT locked 3 years
              </div>
              {achieved ? (
                <span className="badge badge-green" style={{ marginTop: "0.5rem" }}>✅ Earned</span>
              ) : (
                <span className="badge badge-gray" style={{ marginTop: "0.5rem" }}>🔒 Locked</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Vesting Vault ───────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            🔐 <span>Vesting Vault</span>
          </h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <div className="stat-label">Total Locked</div>
              <div style={{ fontWeight: 700, color: "#a78bfa" }}>
                {formatBTT(vestingData.totalLocked)} BTT
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-label">Claimable Now</div>
              <div style={{ fontWeight: 700, color: "#22c55e" }}>
                {formatBTT(vestingData.claimableAmount)} BTT
              </div>
            </div>
          </div>
        </div>

        {vestingData.equityBps > 0 && (
          <div className="card card-purple" style={{ marginBottom: "1rem", padding: "0.875rem" }}>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>
              📊 Your Equity Share: {formatBps(vestingData.equityBps)}
              {" "}of total B-TITAN supply
            </span>
          </div>
        )}

        {vestingData.locks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔐</div>
            <div className="empty-state-text">
              No vesting locks yet.<br />
              Complete Magic Box slots (3, 6, 9, 12) to earn 1 BTT vested for 3 years.
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Lock #</th>
                <th>Amount</th>
                <th>Slot</th>
                <th>Unlock Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vestingData.locks.map((lock, i) => {
                const unlockTs = Number(lock.unlockTimestamp);
                const remaining = unlockTs - now;
                const isUnlocked = remaining <= 0;
                return (
                  <tr key={i}>
                    <td style={{ color: "#64748b" }}>#{i + 1}</td>
                    <td style={{ fontWeight: 700, color: "#a78bfa" }}>
                      {formatBTT(lock.amount)} BTT
                    </td>
                    <td>
                      <span className="badge badge-purple">Slot {lock.milestoneSlot}</span>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      {isUnlocked ? "🔓 Unlocked" : formatCountdown(remaining)}
                    </td>
                    <td>
                      {lock.claimed ? (
                        <span className="badge badge-gray">✅ Claimed</span>
                      ) : isUnlocked ? (
                        <span className="badge badge-green">🟢 Claimable</span>
                      ) : (
                        <span className="badge badge-purple">⏳ Vesting</span>
                      )}
                    </td>
                    <td>
                      {!lock.claimed && isUnlocked && (
                        <button
                          id={`claim-lock-${i}-btn`}
                          className="btn btn-primary btn-sm"
                          onClick={() => claimVestingLock(i)}
                        >
                          Claim
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Info Box ────────────────────────────────────────────────────── */}
      <div className="card" style={{ background: "rgba(167,139,250,0.05)",
                                     borderColor: "rgba(167,139,250,0.2)" }}>
        <h3 style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "0.75rem" }}>
          ℹ️ About Magic Box & Vesting
        </h3>
        <ul style={{ color: "#94a3b8", fontSize: "0.875rem", paddingLeft: "1.25rem",
                     lineHeight: 1.8, margin: 0 }}>
          <li>Complete the first cycle of slots 3, 6, 9, or 12 to trigger a Magic Box.</li>
          <li>Each Magic Box mints an NFT rank badge and vests 1 BTT for 3 years.</li>
          <li>After the vesting period, you can claim your BTT to your wallet.</li>
          <li>Your equity share grows with each Magic Box milestone.</li>
        </ul>
      </div>
    </div>
  );
}
