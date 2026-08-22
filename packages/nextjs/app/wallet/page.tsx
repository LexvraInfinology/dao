"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { useDAOData } from "../../hooks/btitan/useDAOData";
import { useMatrixData } from "../../hooks/btitan/useMatrixData";
import { useWithdraw } from "../../hooks/btitan/useWithdraw";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { notification } from "../../utils/scaffold-eth/notification";
import {
  IconWallet,
  IconZap,
  IconCheck,
  IconShield,
  IconChart,
  IconGrid,
  LogoTitan,
} from "../../components/ui/Icons";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}

function WalletContent() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"dao" | "matrix">("dao");

  const { memberInfo, isLoading: loadingDAO } = useDAOData(address);
  const { financials, isLoading: loadingMatrix } = useMatrixData(address);
  const { withdrawFromDAO, withdrawFromMatrix, withdrawing } = useWithdraw();

  if (!isConnected) return null;
  if (loadingDAO || loadingMatrix) return <LoadingSpinner fullPage label="Loading wallet data..." />;

  const totalWithdrawable = (memberInfo?.availableBalance ?? 0n) + (financials?.availableBalance ?? 0n);
  const totalEarned = (memberInfo?.totalEarned ?? 0n) + (financials?.lifetimeEarned ?? 0n);
  const totalWithdrawn = (memberInfo?.totalWithdrawn ?? 0n) + (financials?.withdrawn ?? 0n);

  return (
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-gold" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
            <IconWallet size={14} /> NON-CUSTODIAL TREASURY VAULT
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
          Protocol <span className="gradient-text-gold">Treasury Wallet</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
          Manage your accumulated BTT earnings, monitor lifetime payouts, and execute direct on-chain withdrawals.
        </p>
      </div>

      {/* ─── Address Card ────────────────────────────────────────────────── */}
      <div
        className="glass-card glass-card-gold"
        style={{
          marginBottom: "2rem",
          padding: "1.75rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            Connected Settlement Address
          </span>
          <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: "0.25rem", wordBreak: "break-all" }}>
            {address}
          </div>
        </div>

        <button
          id="copy-address-btn"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (address) {
              navigator.clipboard.writeText(address);
              notification.success("Address copied to clipboard!");
            }
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <IconCheck size={14} /> Copy Address
        </button>
      </div>

      {/* ─── Summary Stats Grid ──────────────────────────────────────────── */}
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
              Total Withdrawable
            </span>
            <IconWallet size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {formatBTT(totalWithdrawable)} <span style={{ fontSize: "1rem", color: "#f59e0b" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            DAO + Matrix combined balance
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
            {formatBTT(totalEarned)} <span style={{ fontSize: "1rem", color: "#a78bfa" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            Cumulative protocol payout
          </p>
        </div>

        <div className="glass-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Withdrawn
            </span>
            <IconCheck size={20} color="#22c55e" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
            {formatBTT(totalWithdrawn)} <span style={{ fontSize: "1rem", color: "#22c55e" }}>BTT</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", margin: 0 }}>
            Settled to your Web3 wallet
          </p>
        </div>
      </div>

      {/* ─── Withdrawal Panels ───────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        
        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2rem",
            background: "rgba(10, 15, 26, 0.6)",
            borderRadius: "12px",
            padding: "6px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {(["dao", "matrix"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.9rem",
                transition: "all 0.2s",
                background: activeTab === tab ? "rgba(245,158,11,0.15)" : "transparent",
                color: activeTab === tab ? "#f59e0b" : "#64748b",
                borderBottom: activeTab === tab ? "2px solid #f59e0b" : "2px solid transparent",
              }}
            >
              {tab === "dao" ? "Genesis DAO Pool" : "12-Slot Matrix Balance"}
            </button>
          ))}
        </div>

        {/* DAO Panel */}
        {activeTab === "dao" && (
          <div>
            {memberInfo?.isMember ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Available DAO Balance</span>
                    <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#f59e0b", fontFamily: "var(--font-heading)" }}>
                      {formatBTT(memberInfo.availableBalance)} BTT
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Total DAO Earnings</span>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff" }}>
                      {formatBTT(memberInfo.totalEarned)} BTT
                    </div>
                  </div>
                </div>

                <button
                  id="withdraw-dao-btn"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => withdrawFromDAO(memberInfo.availableBalance)}
                  disabled={memberInfo.availableBalance === 0n || withdrawing === "dao"}
                >
                  {withdrawing === "dao"
                    ? "Executing On-Chain Withdrawal..."
                    : `Withdraw ${formatBTT(memberInfo.availableBalance)} BTT from DAO`}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <IconShield size={28} color="#f59e0b" />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem" }}>
                  Not a DAO Founding Member
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 1.5rem" }}>
                  Join the Genesis DAO founding 50 members to start receiving 90% automatic shares on all platform registrations.
                </p>
                <a href="/dao" className="btn btn-primary btn-sm">
                  Join Genesis DAO (300 BTT) →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Matrix Panel */}
        {activeTab === "matrix" && (
          <div>
            {(financials?.highestSlot ?? 0) > 0 ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Available Matrix Balance</span>
                    <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#a78bfa", fontFamily: "var(--font-heading)" }}>
                      {formatBTT(financials?.availableBalance ?? 0n)} BTT
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Lifetime Matrix Earned</span>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff" }}>
                      {formatBTT(financials?.lifetimeEarned ?? 0n)} BTT
                    </div>
                  </div>
                </div>

                <button
                  id="withdraw-matrix-btn"
                  className="btn btn-violet btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => withdrawFromMatrix(financials?.availableBalance ?? 0n)}
                  disabled={(financials?.availableBalance ?? 0n) === 0n || withdrawing === "matrix"}
                >
                  {withdrawing === "matrix"
                    ? "Executing On-Chain Withdrawal..."
                    : `Withdraw ${formatBTT(financials?.availableBalance ?? 0n)} BTT from Matrix`}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "rgba(139,92,246,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <IconGrid size={28} color="#a78bfa" />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem" }}>
                  No Matrix Slots Active
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 1.5rem" }}>
                  Unlock Slot 1 for 30 BTT to begin receiving direct payouts and community spillover earnings.
                </p>
                <a href="/matrix" className="btn btn-primary btn-sm">
                  Start Matrix Engine →
                </a>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
