"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { useDAOData }    from "../../hooks/btitan/useDAOData";
import { useMatrixData } from "../../hooks/btitan/useMatrixData";
import { useWithdraw }   from "../../hooks/btitan/useWithdraw";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dao" | "matrix">("dao");

  const { memberInfo, isLoading: loadingDAO } = useDAOData(address);
  const { financials, isLoading: loadingMatrix } = useMatrixData(address);
  const { withdrawFromDAO, withdrawFromMatrix, withdrawing } = useWithdraw();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  if (!isConnected) return null;
  if (loadingDAO || loadingMatrix) return <LoadingSpinner fullPage label="Loading wallet data..." />;

  const totalWithdrawable = memberInfo.availableBalance + financials.availableBalance;
  const totalEarned = memberInfo.totalEarned + financials.lifetimeEarned;
  const totalWithdrawn = memberInfo.totalWithdrawn + financials.withdrawn;

  return (
    <div className="page-container" style={{ paddingTop: "2rem" }}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">💰 Wallet</h1>
        <p className="page-subtitle">Manage your BTT earnings, withdraw balances, and track finances.</p>
      </div>

      {/* ─── Address Card ────────────────────────────────────────────────── */}
      <div className="card card-gold" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Connected Wallet</div>
        <div style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: "#e2e8f0",
                      wordBreak: "break-all" }}>
          {address}
        </div>
        <button
          id="copy-address-btn"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: "0.75rem" }}
          onClick={() => navigator.clipboard.writeText(address ?? "")}
        >
          📋 Copy Address
        </button>
      </div>

      {/* ─── Summary Stats ───────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Total Withdrawable</div>
          <div className="stat-value">{formatBTT(totalWithdrawable)} BTT</div>
          <div className="stat-sub">DAO + Matrix combined</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lifetime Earned</div>
          <div className="stat-value">{formatBTT(totalEarned)} BTT</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Withdrawn</div>
          <div className="stat-value">{formatBTT(totalWithdrawn)} BTT</div>
          <div className="stat-sub">Historical withdrawals</div>
        </div>
      </div>

      {/* ─── Withdrawal Tabs ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem",
                      background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px" }}>
          {(["dao", "matrix"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s",
                background: activeTab === tab ? "rgba(245,158,11,0.15)" : "transparent",
                color: activeTab === tab ? "#f59e0b" : "#64748b",
              }}
            >
              {tab === "dao" ? "🏛️ DAO Balance" : "🔢 Matrix Balance"}
            </button>
          ))}
        </div>

        {/* DAO Panel */}
        {activeTab === "dao" && (
          <div>
            {memberInfo.isMember ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <div className="stat-label">DAO Withdrawable</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b" }}>
                      {formatBTT(memberInfo.availableBalance)} BTT
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="stat-label">Total Earned from DAO</div>
                    <div style={{ fontWeight: 700, color: "#94a3b8" }}>
                      {formatBTT(memberInfo.totalEarned)} BTT
                    </div>
                  </div>
                </div>
                <button
                  id="withdraw-dao-btn"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => withdrawFromDAO(memberInfo.availableBalance)}
                  disabled={memberInfo.availableBalance === 0n || withdrawing === "dao"}
                >
                  {withdrawing === "dao" ? (
                    <><div className="spinner" />Withdrawing...</>
                  ) : (
                    `💰 Withdraw ${formatBTT(memberInfo.availableBalance)} BTT`
                  )}
                </button>
                {memberInfo.availableBalance === 0n && (
                  <p style={{ textAlign: "center", color: "#475569", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                    No DAO balance available to withdraw yet.
                  </p>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏛️</div>
                <div className="empty-state-text">
                  You are not a DAO member yet.<br />
                  Join the Genesis DAO for 300 BTT to start earning.
                </div>
                <a href="/dao" className="btn btn-primary btn-sm">Join DAO →</a>
              </div>
            )}
          </div>
        )}

        {/* Matrix Panel */}
        {activeTab === "matrix" && (
          <div>
            {financials.highestSlot > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <div className="stat-label">Matrix Withdrawable</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#8b5cf6" }}>
                      {formatBTT(financials.availableBalance)} BTT
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="stat-label">Lifetime Matrix Earned</div>
                    <div style={{ fontWeight: 700, color: "#94a3b8" }}>
                      {formatBTT(financials.lifetimeEarned)} BTT
                    </div>
                  </div>
                </div>
                <button
                  id="withdraw-matrix-btn"
                  className="btn btn-primary"
                  style={{ width: "100%",
                           background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
                  onClick={() => withdrawFromMatrix(financials.availableBalance)}
                  disabled={financials.availableBalance === 0n || withdrawing === "matrix"}
                >
                  {withdrawing === "matrix" ? (
                    <><div className="spinner" />Withdrawing...</>
                  ) : (
                    `🔢 Withdraw ${formatBTT(financials.availableBalance)} BTT`
                  )}
                </button>
                {financials.availableBalance === 0n && (
                  <p style={{ textAlign: "center", color: "#475569", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                    No matrix balance available to withdraw yet.
                  </p>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔢</div>
                <div className="empty-state-text">
                  No matrix slots unlocked yet.<br />
                  Start with Slot 1 for just 30 BTT.
                </div>
                <a href="/matrix" className="btn btn-primary btn-sm">Start Matrix →</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Info Box ────────────────────────────────────────────────────── */}
      <div className="card" style={{ background: "rgba(96,165,250,0.05)", borderColor: "rgba(96,165,250,0.2)" }}>
        <h3 style={{ fontWeight: 700, color: "#60a5fa", marginBottom: "0.75rem" }}>ℹ️ About Withdrawals</h3>
        <ul style={{ color: "#94a3b8", fontSize: "0.875rem", paddingLeft: "1.25rem",
                     lineHeight: 1.8, margin: 0 }}>
          <li>Withdrawals transfer BTT tokens directly to your connected wallet.</li>
          <li>DAO and Matrix balances are separate — withdraw each independently.</li>
          <li>Minimum gas fees apply — make sure your wallet has enough BNB/ETH for gas.</li>
          <li>Magic Box vested tokens are claimed on the <a href="/rewards" style={{ color: "#f59e0b" }}>Rewards page</a>.</li>
        </ul>
      </div>
    </div>
  );
}
