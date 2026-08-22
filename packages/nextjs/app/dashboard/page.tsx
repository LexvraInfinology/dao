"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import Link from "next/link";
import { formatBTT, getSlotPrice } from "../../utils/btitan/matrixHelpers";
import { useDAOData } from "../../hooks/btitan/useDAOData";
import { useMatrixData } from "../../hooks/btitan/useMatrixData";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";
import { notification } from "../../utils/scaffold-eth/notification";
import {
  IconShield,
  IconZap,
  IconGrid,
  IconUsers,
  IconLock,
  IconAward,
  IconWallet,
  IconChart,
  IconCheck,
  IconRefresh,
  LogoTitan,
} from "../../components/ui/Icons";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { address } = useAccount();
  const chainId = useChainId();

  const { memberInfo, stats: daoStats, isLoading: loadingDAO } = useDAOData(address);
  const { slots, financials, isLoading: loadingMatrix } = useMatrixData(address);
  const { profile } = useUserProfile(address);

  const [copiedLink, setCopiedLink] = useState(false);

  const totalBalance = (memberInfo?.availableBalance ?? 0) + (financials?.availableBalance ?? 0);
  const totalEarned = (memberInfo?.totalEarned ?? 0) + (financials?.lifetimeEarned ?? 0);
  const highestSlot = financials?.highestSlot || 1;
  const isQualified = (profile?.directReferralCount ?? 0) >= 2;

  const referralLink = typeof window !== "undefined" && address
    ? `${window.location.origin}/?ref=${address}`
    : `https://btitan.net/?ref=${address || ""}`;

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    notification.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const networkName = chainId === 56 ? "BNB Smart Chain Mainnet" : chainId === 97 ? "BSC Testnet" : "Hardhat Devnet (31337)";

  return (
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Top Executive Member Banner ─────────────────────────────────── */}
      <div
        className="glass-card glass-card-gold"
        style={{
          marginBottom: "2rem",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", zIndex: 2 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(245,158,11,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 25px rgba(245,158,11,0.25)",
            }}
          >
            <LogoTitan size={44} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <span className="badge-glow badge-gold" style={{ fontSize: "0.75rem", padding: "0.2rem 0.65rem" }}>
                <IconShield size={12} /> {profile?.isRegistered ? `MEMBER #${profile.userId}` : "COMMUNITY GUEST"}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "9999px",
                  background: "rgba(34, 197, 94, 0.12)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                {networkName}
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 900,
                color: "#ffffff",
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.02em",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
              <button
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address);
                    notification.success("Wallet address copied!");
                  }
                }}
                title="Copy Address"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: "0.75rem",
                }}
              >
                Copy
              </button>
            </h1>

            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.35rem", margin: 0 }}>
              Sponsor:{" "}
              <span style={{ color: "#e2e8f0", fontFamily: "monospace" }}>
                {profile?.sponsor && profile.sponsor !== "0x0000000000000000000000000000000000000000"
                  ? `${profile.sponsor.slice(0, 6)}...${profile.sponsor.slice(-4)}`
                  : "Genesis Root"}
              </span>
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", zIndex: 2 }}>
          {isQualified ? (
            <span className="badge-glow badge-green" style={{ padding: "0.4rem 0.85rem" }}>
              <IconCheck size={14} /> Qualified for Spillover
            </span>
          ) : (
            <span
              style={{
                fontSize: "0.8rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontWeight: 600,
              }}
            >
              Direct Referrals: {profile?.directReferralCount ?? 0} / 2
            </span>
          )}

          <button
            onClick={copyReferralLink}
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {copiedLink ? <IconCheck size={16} /> : <IconUsers size={16} />}
            {copiedLink ? "Link Copied!" : "Share Referral Link"}
          </button>
        </div>
      </div>

      {/* ─── Financial KPI Grid ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* KPI 1: Available Balance */}
        <div
          className="glass-card glass-card-gold"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Withdrawable Balance
              </span>
              <IconWallet size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              {formatBTT(totalBalance)}{" "}
              <span style={{ fontSize: "1rem", color: "#f59e0b", fontWeight: 700 }}>BTT</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              Instant on-chain settlement
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link
              href="/wallet"
              className="btn btn-primary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Withdraw Funds →
            </Link>
          </div>
        </div>

        {/* KPI 2: Lifetime Earned */}
        <div
          className="glass-card glass-card-violet"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Lifetime Earnings
              </span>
              <IconChart size={20} color="#a78bfa" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              {formatBTT(totalEarned)}{" "}
              <span style={{ fontSize: "1rem", color: "#a78bfa", fontWeight: 700 }}>BTT</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              Matrix Direct + Spillover + DAO
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
            <span style={{ color: "#94a3b8" }}>DAO Share:</span>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>{formatBTT(memberInfo?.totalEarned ?? 0)} BTT</span>
          </div>
        </div>

        {/* KPI 3: Highest Active Slot */}
        <div
          className="glass-card"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#60a5fa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Matrix Progression
              </span>
              <IconGrid size={20} color="#60a5fa" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              Slot {highestSlot}{" "}
              <span style={{ fontSize: "1rem", color: "#60a5fa", fontWeight: 700 }}>/ 12</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              Current Tier: {getSlotPrice(highestSlot)} BTT
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link
              href="/matrix"
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Open 14-Node Tree →
            </Link>
          </div>
        </div>

        {/* KPI 4: Direct Team */}
        <div
          className="glass-card"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#22c55e", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Direct Network
              </span>
              <IconUsers size={20} color="#22c55e" />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-heading)" }}>
              {profile?.directReferralCount ?? 0}{" "}
              <span style={{ fontSize: "1rem", color: "#22c55e", fontWeight: 700 }}>Partners</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              {isQualified ? "Full spillover unlocked" : "Refer 2 members to qualify"}
            </p>
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link
              href="/referrals"
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              View Team Tree →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Genesis DAO Allocation Widget (If Member) ─────────────────── */}
      {memberInfo?.isMember && (
        <div
          className="glass-card glass-card-gold"
          style={{
            marginBottom: "2.5rem",
            padding: "1.75rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <span className="badge-glow badge-gold" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
              🏛️ GENESIS DAO FOUNDING MEMBER
            </span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: "0.25rem 0" }}>
              Slot Position #{memberInfo.position} of 50
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              Receiving equal 90% share of all future DAO entries automatically.
            </p>
          </div>

          <div style={{ flex: 1, minWidth: "220px", maxWidth: "340px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
              <span>Total DAO Slots Filled</span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{daoStats?.memberCount ?? 0} / 50</span>
            </div>
            <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: `${((daoStats?.memberCount ?? 0) / 50) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          <Link href="/dao" className="btn btn-primary btn-sm">
            DAO Governance Hub →
          </Link>
        </div>
      )}

      {/* ─── 12-Slot Matrix Overview Grid ───────────────────────────────── */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h2 className="section-title" style={{ margin: 0, textAlign: "left" }}>
              12-Matrix <span>Tier Status</span>
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem", margin: 0 }}>
              14-Node auto-upgrading matrix progression from Slot 1 (30 BTT) to Slot 12 (61,440 BTT)
            </p>
          </div>
          <Link href="/matrix" className="btn btn-secondary btn-sm">
            Full Matrix View →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((slotNum) => {
            const isSlotUnlocked = slotNum <= highestSlot;
            const isCurrentSlot = slotNum === highestSlot;
            const price = getSlotPrice(slotNum);

            return (
              <Link
                key={slotNum}
                href="/matrix"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass-card"
                  style={{
                    padding: "1.25rem 0.75rem",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    border: isCurrentSlot
                      ? "2px solid #f59e0b"
                      : isSlotUnlocked
                      ? "1px solid rgba(139,92,246,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: isCurrentSlot
                      ? "linear-gradient(180deg, rgba(245,158,11,0.15), rgba(15,23,42,0.8))"
                      : isSlotUnlocked
                      ? "rgba(139,92,246,0.08)"
                      : "rgba(15,23,42,0.4)",
                    boxShadow: isCurrentSlot ? "0 0 20px rgba(245,158,11,0.2)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: isCurrentSlot ? "#f59e0b" : isSlotUnlocked ? "#a78bfa" : "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Slot {slotNum}
                  </div>

                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 900,
                      color: "#ffffff",
                      fontFamily: "var(--font-heading)",
                      margin: "0.35rem 0",
                    }}
                  >
                    {price >= 1000 ? `${price / 1000}k` : price}
                    <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginLeft: "2px" }}>BTT</span>
                  </div>

                  <div style={{ fontSize: "0.75rem", marginTop: "0.35rem" }}>
                    {isCurrentSlot ? (
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>● Active</span>
                    ) : isSlotUnlocked ? (
                      <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ Unlocked</span>
                    ) : (
                      <span style={{ color: "#64748b" }}>🔒 Locked</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── Command Launcher Grid ──────────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: "1.25rem", textAlign: "left" }}>
        Protocol <span>Command Center</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <Link href="/matrix" style={{ textDecoration: "none" }}>
          <div
            className="glass-card glass-card-violet"
            style={{
              padding: "1.75rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconGrid size={24} color="#a78bfa" />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
              12-Matrix Engine
            </h3>
            <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
              Interact with the 14-node tree visualizer, view direct payouts, and auto-upgrade reserves.
            </p>
            <span style={{ marginTop: "auto", fontSize: "0.8rem", color: "#a78bfa", fontWeight: 700 }}>
              Open Matrix →
            </span>
          </div>
        </Link>

        <Link href="/dao" style={{ textDecoration: "none" }}>
          <div
            className="glass-card glass-card-gold"
            style={{
              padding: "1.75rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconShield size={24} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
              Genesis DAO
            </h3>
            <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
              Exclusive 50-slot founding pool with 90% automated equal distribution on every new registration.
            </p>
            <span style={{ marginTop: "auto", fontSize: "0.8rem", color: "#f59e0b", fontWeight: 700 }}>
              View DAO Hub →
            </span>
          </div>
        </Link>

        <Link href="/rewards" style={{ textDecoration: "none" }}>
          <div
            className="glass-card"
            style={{
              padding: "1.75rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconAward size={24} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
              Magic Box & NFTs
            </h3>
            <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
              Unlock milestone rank badges (*Rising Star, Prime, Royal, Legendary*) and 3-year vesting pools.
            </p>
            <span style={{ marginTop: "auto", fontSize: "0.8rem", color: "#22c55e", fontWeight: 700 }}>
              Claim Rewards →
            </span>
          </div>
        </Link>

        <Link href="/wallet" style={{ textDecoration: "none" }}>
          <div
            className="glass-card"
            style={{
              padding: "1.75rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconWallet size={24} color="#60a5fa" />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
              Treasury Wallet
            </h3>
            <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
              Execute instant non-custodial withdrawals of your combined Matrix & DAO balances.
            </p>
            <span style={{ marginTop: "auto", fontSize: "0.8rem", color: "#60a5fa", fontWeight: 700 }}>
              Open Wallet →
            </span>
          </div>
        </Link>
      </div>

    </div>
  );
}
