"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { RANK_LABELS, RANK_COLORS, BTitanRank } from "../../types/btitan";
import { useDAOData }      from "../../hooks/btitan/useDAOData";
import { useMatrixData }   from "../../hooks/btitan/useMatrixData";
import { useUserProfile }  from "../../hooks/btitan/useUserProfile";
import { LoadingSpinner }  from "../../components/ui/LoadingSpinner";

const QUICK_ACTIONS = [
  { href: "/dao",       icon: "🏛️", label: "Join DAO",      desc: "300 BTT · 50 founding spots",     color: "#f59e0b" },
  { href: "/matrix",   icon: "🔢", label: "Open Matrix",   desc: "Start Slot 1 · 30 BTT",            color: "#8b5cf6" },
  { href: "/referrals",icon: "👥", label: "Invite Friends", desc: "Earn from referrals",              color: "#22c55e" },
  { href: "/wallet",   icon: "💰", label: "Withdraw",      desc: "Claim your earnings",               color: "#60a5fa" },
];

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { memberInfo, stats: daoStats, isLoading: loadingDAO } = useDAOData(address);
  const { slots, financials, isLoading: loadingMatrix } = useMatrixData(address);
  const { profile } = useUserProfile(address);

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  if (!isConnected) return null;
  if (loadingDAO || loadingMatrix) return <LoadingSpinner fullPage label="Loading your dashboard..." />;

  const totalBalance = memberInfo.availableBalance + financials.availableBalance;
  const totalEarned  = memberInfo.totalEarned + financials.lifetimeEarned;
  const rank = profile.isRegistered ? BTitanRank.NONE : BTitanRank.NONE; // updated via useRewardsData on rewards page

  return (
    <div className="page-container" style={{ paddingTop: "2rem" }}>

      {/* ─── Welcome Banner ────────────────────────────────────────────── */}
      <div
        className="card card-gold"
        style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center",
                 justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}
      >
        <div>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Welcome back</p>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#e2e8f0", fontFamily: "monospace" }}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
            User #{profile.userId || "—"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {profile.isQualified && <span className="badge badge-green">✅ Qualified</span>}
          {memberInfo.isMember && <span className="badge badge-gold">🏛️ DAO Member #{memberInfo.position}</span>}
          {!profile.isRegistered && <span className="badge badge-gray">Not Registered</span>}
        </div>
      </div>

      {/* ─── Stats Grid ────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Total Withdrawable</div>
          <div className="stat-value">{formatBTT(totalBalance)} BTT</div>
          <div className="stat-sub">DAO + Matrix combined</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lifetime Earned</div>
          <div className="stat-value">{formatBTT(totalEarned)} BTT</div>
          <div className="stat-sub">All time earnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Highest Slot</div>
          <div className="stat-value">Slot {financials.highestSlot || "—"}</div>
          <div className="stat-sub">of 12 total levels</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Direct Referrals</div>
          <div className="stat-value">{profile.directReferralCount}</div>
          <div className="stat-sub">
            {profile.directReferralCount >= 2 ? "✅ Qualified" : `Need ${2 - profile.directReferralCount} more`}
          </div>
        </div>
      </div>

      {/* ─── DAO Status Card ───────────────────────────────────────────── */}
      {memberInfo.isMember && (
        <div
          className="card"
          style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center",
                   justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
                   borderColor: "rgba(245,158,11,0.3)",
                   background: "linear-gradient(135deg, rgba(245,158,11,0.08), transparent)" }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Genesis DAO</div>
            <div style={{ fontWeight: 700, color: "#e2e8f0" }}>Position #{memberInfo.position} / 50</div>
          </div>
          <div style={{ flex: 1, minWidth: "150px", background: "rgba(255,255,255,0.05)",
                        borderRadius: "8px", padding: "0.5rem 1rem" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.25rem" }}>DAO Progress</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(daoStats.memberCount / 50) * 100}%` }} />
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              {daoStats.memberCount} / 50 positions
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>DAO Balance</div>
            <div style={{ fontWeight: 800, color: "#f59e0b", fontSize: "1.125rem" }}>
              {formatBTT(memberInfo.availableBalance)} BTT
            </div>
          </div>
          <Link href="/dao" className="btn btn-secondary btn-sm">View DAO →</Link>
        </div>
      )}

      {/* ─── Quick Actions ─────────────────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: "1rem" }}>
        Quick <span>Actions</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem", marginBottom: "2rem" }}>
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", display: "flex", flexDirection: "column",
                                           gap: "0.5rem", borderColor: `${action.color}30` }}>
              <div style={{ fontSize: "2rem" }}>{action.icon}</div>
              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>{action.label}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{action.desc}</div>
              <div style={{ marginTop: "auto", fontSize: "0.75rem", color: action.color, fontWeight: 600 }}>
                Open →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Matrix Slot Grid ──────────────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: "1rem" }}>
        Your <span>Matrix Slots</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {slots.map((slot) => (
          <Link key={slot.slotNumber} href="/matrix" style={{ textDecoration: "none" }}>
            <div
              className={`slot-card ${
                slot.isUnlocked && slot.slotNumber === financials.highestSlot
                  ? "active"
                  : slot.isUnlocked
                  ? "unlocked"
                  : "locked"
              }`}
              style={{ textAlign: "center" }}
            >
              <div className="slot-number">S{slot.slotNumber}</div>
              <div style={{ fontSize: "1rem", marginTop: "0.25rem" }}>
                {slot.isUnlocked && slot.slotNumber === financials.highestSlot
                  ? "🔥"
                  : slot.isUnlocked
                  ? "✅"
                  : "🔒"}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link href="/matrix" className="btn btn-primary">🔢 Open Full Matrix View</Link>
      </div>

      {/* ─── Not Registered CTA ────────────────────────────────────────── */}
      {!profile.isRegistered && (
        <div className="card card-gold" style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", marginBottom: "0.5rem" }}>
            Get Started
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            Join the Genesis DAO or start your Matrix to earn BTT rewards.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dao" className="btn btn-primary btn-lg">🏛️ Join DAO — 300 BTT</Link>
            <Link href="/matrix" className="btn btn-secondary btn-lg">🔢 Start Matrix</Link>
          </div>
        </div>
      )}
    </div>
  );
}
