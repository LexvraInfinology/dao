"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { LoginRegisterModal } from "../components/auth/LoginRegisterModal";
import {
  IconShield,
  IconZap,
  IconUsers,
  IconGrid,
  IconLock,
  IconAward,
  IconWallet,
  IconChart,
  IconRefresh,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
} from "../components/ui/Icons";

const STATS = [
  { label: "Protocol Volume", value: "$1,450,000+", icon: IconChart, color: "#f59e0b" },
  { label: "Genesis DAO Slots", value: "12 / 50 Filled", icon: IconShield, color: "#a855f7" },
  { label: "Completed Cycles", value: "8,940+", icon: IconRefresh, color: "#38bdf8" },
  { label: "Direct Settlements", value: "$1,180,000+", icon: IconZap, color: "#22c55e" },
];

const MATRIX_TIERS = [
  { slot: 1, cost: "30", direct: "180", recycle: "120", color: "#8b5cf6" },
  { slot: 2, cost: "60", direct: "360", recycle: "240", color: "#a855f7" },
  { slot: 3, cost: "120", direct: "720", recycle: "480", badge: "Rising Star", color: "#ec4899" },
  { slot: 4, cost: "240", direct: "1,440", recycle: "960", color: "#3b82f6" },
  { slot: 5, cost: "480", direct: "2,880", recycle: "1,920", color: "#06b6d4" },
  { slot: 6, cost: "960", direct: "5,760", recycle: "3,840", badge: "Prime Master", color: "#10b981" },
  { slot: 7, cost: "1,920", direct: "11,520", recycle: "7,680", color: "#f59e0b" },
  { slot: 8, cost: "3,840", direct: "23,040", recycle: "15,360", color: "#f97316" },
  { slot: 9, cost: "7,680", direct: "46,080", recycle: "30,720", badge: "Royal Titan", color: "#ef4444" },
  { slot: 10, cost: "15,360", direct: "92,160", recycle: "61,440", color: "#c084fc" },
  { slot: 11, cost: "30,720", direct: "184,320", recycle: "122,880", color: "#60a5fa" },
  { slot: 12, cost: "61,440", direct: "368,640", recycle: "245,760", badge: "Legendary", color: "#fcd34d" },
];

const MAGIC_BOX_BADGES = [
  {
    tier: "Slot 3",
    name: "Rising Star",
    level: "Tier 1 Rank",
    lock: "1 BTT Token",
    equity: "0.25% Revenue Share",
    color: "#ec4899",
  },
  {
    tier: "Slot 6",
    name: "Prime Master",
    level: "Tier 2 Rank",
    lock: "2 BTT Tokens",
    equity: "0.50% Revenue Share",
    color: "#06b6d4",
  },
  {
    tier: "Slot 9",
    name: "Royal Titan",
    level: "Tier 3 Rank",
    lock: "3 BTT Tokens",
    equity: "1.00% Revenue Share",
    color: "#10b981",
  },
  {
    tier: "Slot 12",
    name: "Legendary Supreme",
    level: "Tier 4 Rank",
    lock: "4 BTT Tokens",
    equity: "2.50% Revenue Share",
    color: "#f59e0b",
  },
];

const FAQS = [
  {
    q: "How are smart contracts executed non-custodially on B-TITAN?",
    a: "All matrix placements and DAO profit splits execute directly through verified Solidity 0.8.25 smart contracts on BNB Smart Chain. No centralized intermediary or contract admin holds user balances.",
  },
  {
    q: "What is the automated distribution inside the 50-Member Genesis DAO?",
    a: "The Genesis DAO is strictly hard-capped at 50 slots (300 BTT deposit). When a new member joins, 10% is sent to their direct sponsor, and the remaining 90% is split equally across all earlier existing DAO members automatically in the exact transaction block.",
  },
  {
    q: "How does the 14-node matrix spillover qualification work?",
    a: "Directly referring 2 members permanently qualifies your account to receive community spillover placements (Positions 7 & 10) from both upline and downline teams across all unlocked slot tiers.",
  },
  {
    q: "How does the 3-Year Vesting Vault distribute platform equity?",
    a: "Completing milestone slots (3, 6, 9, 12) mints rank NFT badges and locks BTT in a 3-year on-chain time-lock vault. Rank holders receive up to 2.50% basis points of platform revenue distributions.",
  },
];

export default function LandingPage() {
  const { isConnected } = useAccount();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openAuth = (tab: "register" | "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(2.5rem, 6vw, 5rem) 1rem 3rem", textAlign: "center" }}>
        <div className="container-custom">
          {/* Status Badge */}
          <div style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
            <span className="badge-glow badge-gold">
              <IconShield size={14} /> Verified Matrix & DAO Protocol • BNB Chain
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.12,
              marginBottom: "1.5rem",
              maxWidth: "960px",
              marginLeft: "auto",
              marginRight: "auto",
              letterSpacing: "-0.03em",
            }}
          >
            Decentralized Matrix &{" "}
            <span className="gradient-text-violet">Automated DAO</span> on{" "}
            <span className="gradient-text-gold">B-TITAN</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#94a3b8",
              maxWidth: "760px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
              fontFamily: "var(--font-body)",
            }}
          >
            A high-throughput Web3 protocol featuring a peer-to-peer 14-node matrix engine, 50-member Genesis DAO profit pool, and 3-year time-locked platform equity.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.85rem",
              flexWrap: "wrap",
              marginBottom: "3.5rem",
            }}
          >
            {!isConnected ? (
              <button onClick={() => openAuth("register")} className="btn btn-primary btn-lg">
                Enter Platform <IconArrowRight size={18} />
              </button>
            ) : (
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Open Dashboard <IconArrowRight size={18} />
              </Link>
            )}

            <Link href="/dao" className="btn btn-violet btn-lg">
              Genesis DAO (300 BTT)
            </Link>

            <Link href="/matrix" className="btn btn-secondary btn-lg">
              12-Slot Matrix
            </Link>
          </div>

          {/* Protocol Metrics Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              maxWidth: "1140px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: "1.25rem 1.5rem", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} color={stat.color} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-heading)",
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Genesis DAO Feature ───────────────────────────────────────────────── */}
      <section id="dao" style={{ padding: "clamp(2.5rem, 5vw, 4rem) 1rem" }}>
        <div className="container-custom">
          <div
            className="glass-card glass-card-gold"
            style={{
              padding: "clamp(1.75rem, 4vw, 3.5rem)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ maxWidth: "700px" }}>
              <div style={{ display: "inline-flex", marginBottom: "1rem" }}>
                <span className="badge-glow badge-gold">
                  <IconShield size={14} /> Fixed Cap • 50 Slots Only
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  marginBottom: "1rem",
                }}
              >
                Genesis DAO <span className="gradient-text-gold">Profit Distribution</span>
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                  marginBottom: "1.75rem",
                  fontFamily: "var(--font-body)",
                }}
              >
                Each new member deposit (300 BTT) is automatically routed: 10% direct sponsor bonus, with the remaining 90% distributed equally to all earlier registered members in real-time.
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 700 }}>
                  <span style={{ color: "#94a3b8" }}>Allocation Status</span>
                  <span style={{ color: "#fcd34d" }}>12 of 50 Slots Claimed</span>
                </div>
                <div
                  style={{
                    height: "10px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "24%",
                      background: "linear-gradient(90deg, #f59e0b, #ec4899)",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                <Link href="/dao" className="btn btn-primary btn-lg">
                  Join Genesis DAO (300 BTT) <IconArrowRight size={18} />
                </Link>
                <Link href="/dashboard" className="btn btn-secondary btn-lg">
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 12-Slot Matrix Explorer ──────────────────────────────────────────── */}
      <section id="matrix" style={{ padding: "clamp(2.5rem, 5vw, 4rem) 1rem" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
              <span className="badge-glow">
                <IconGrid size={14} /> Tier Architecture
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              12-Slot Matrix <span className="gradient-text-violet">Payout Matrix</span>
            </h2>
            <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
              Progress through 12 slot tiers with automated auto-upgrades and continuous recycle rebirths.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {MATRIX_TIERS.map((tier) => (
              <div
                key={tier.slot}
                className="glass-card"
                style={{
                  padding: "1.25rem",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {tier.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                      background: "rgba(236, 72, 153, 0.15)",
                      border: "1px solid rgba(236, 72, 153, 0.35)",
                      color: "#f472b6",
                    }}
                  >
                    {tier.badge}
                  </span>
                )}

                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: "0.2rem" }}>
                  SLOT {tier.slot}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: tier.color, marginBottom: "0.85rem" }}>
                  ${tier.cost} <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>BTT</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.65rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Direct (1-6):</span>
                    <span style={{ fontWeight: 700, color: "#22c55e" }}>${tier.direct}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Recycle:</span>
                    <span style={{ fontWeight: 700, color: "#60a5fa" }}>${tier.recycle}</span>
                  </div>
                </div>

                <Link
                  href={`/matrix?slot=${tier.slot}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", marginTop: "auto", justifyContent: "center" }}
                >
                  Activate Slot {tier.slot}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14-Node Tree Anatomy ──────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(2.5rem, 5vw, 4rem) 1rem", background: "rgba(12, 4, 28, 0.4)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
              <span className="badge-glow badge-cyan">
                <IconZap size={14} /> Automated Routing
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              14-Node Tree <span className="gradient-text-cyan">Distribution Map</span>
            </h2>
            <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
              Every slot fills in a 14-node matrix with deterministic, automated routing.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <div className="glass-card" style={{ padding: "1.5rem", borderLeft: "3px solid #22c55e" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <IconZap size={20} color="#22c55e" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#22c55e" }}>
                  Positions 1 to 6
                </h3>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                Direct Wallet Income
              </div>
              <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5 }}>
                100% of these 6 positions are credited directly to your withdrawable balance.
              </p>
            </div>

            <div className="glass-card" style={{ padding: "1.5rem", borderLeft: "3px solid #a855f7" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <IconUsers size={20} color="#a855f7" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#a855f7" }}>
                  Positions 7 & 10
                </h3>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                Community Spillover
              </div>
              <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5 }}>
                100% routed as passive community spillover to your direct referrals and upline team.
              </p>
            </div>

            <div className="glass-card" style={{ padding: "1.5rem", borderLeft: "3px solid #f59e0b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <IconLock size={20} color="#f59e0b" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f59e0b" }}>
                  Positions 8 & 9
                </h3>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                Auto-Upgrade Reserve
              </div>
              <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5 }}>
                Reserved in smart contract balance to automatically unlock your next slot tier.
              </p>
            </div>

            <div className="glass-card" style={{ padding: "1.5rem", borderLeft: "3px solid #3b82f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <IconRefresh size={20} color="#3b82f6" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#3b82f6" }}>
                  Positions 11 to 14
                </h3>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.35rem" }}>
                Cycle Recycle
              </div>
              <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.5 }}>
                Clears your 14-node tree and reopens a new cycle for infinite ongoing earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Magic Box Milestone Badges ────────────────────────────────────────── */}
      <section id="rewards" style={{ padding: "clamp(2.5rem, 5vw, 4rem) 1rem" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
              <span className="badge-glow badge-gold">
                <IconAward size={14} /> Protocol Equity
              </span>
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, marginBottom: "0.75rem" }}>
              Magic Box <span className="gradient-text-gold">Milestone Badges</span>
            </h2>
            <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
              Milestone cycles unlock NFT rank badges, token vesting, and global revenue share.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {MAGIC_BOX_BADGES.map((badge, idx) => (
              <div key={idx} className="glass-card" style={{ padding: "1.75rem 1.25rem", textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "14px",
                    background: `rgba(${idx === 0 ? "236,72,153" : idx === 1 ? "6,182,212" : idx === 2 ? "16,185,129" : "245,158,11"}, 0.15)`,
                    border: `1px solid ${badge.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <IconAward size={28} color={badge.color} />
                </div>

                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: badge.color, marginBottom: "0.2rem" }}>
                  {badge.tier} MILESTONE
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "0.85rem" }}>
                  {badge.name}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem", background: "rgba(0,0,0,0.35)", padding: "0.75rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>3-Year Vault:</span>
                    <span style={{ fontWeight: 700, color: "#fcd34d" }}>{badge.lock}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Platform Equity:</span>
                    <span style={{ fontWeight: 700, color: "#38bdf8" }}>{badge.equity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Accordion ─────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "clamp(2.5rem, 5vw, 4rem) 1rem", background: "rgba(8, 1, 20, 0.6)" }}>
        <div className="container-custom" style={{ maxWidth: "760px" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.35rem)", fontWeight: 900, marginBottom: "0.5rem" }}>
              Frequently Asked <span className="gradient-text-violet">Questions</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Technical & financial fundamentals of the protocol.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{ padding: "1.2rem 1.4rem", cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontSize: "0.95rem" }}>
                  <span>{faq.q}</span>
                  <IconChevronDown
                    size={18}
                    color="#a855f7"
                    style={{
                      transform: openFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
                {openFaq === idx && (
                  <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(168, 85, 247, 0.15)",
          padding: "2.5rem 1rem",
          textAlign: "center",
          background: "#05000c",
        }}
      >
        <div className="container-custom">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.05em" }} className="gradient-text-gold">
              B-TITAN DECENTRALIZED PROTOCOL
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", fontSize: "0.825rem", color: "#94a3b8", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <Link href="/dao" style={{ color: "inherit", textDecoration: "none" }}>Genesis DAO</Link>
            <Link href="/matrix" style={{ color: "inherit", textDecoration: "none" }}>12-Matrix</Link>
            <Link href="/rewards" style={{ color: "inherit", textDecoration: "none" }}>Magic Box</Link>
            <Link href="/wallet" style={{ color: "inherit", textDecoration: "none" }}>Wallet Portal</Link>
            <Link href="/leaderboard" style={{ color: "inherit", textDecoration: "none" }}>Leaderboard</Link>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#475569" }}>
            © {new Date().getFullYear()} B-TITAN Protocol. Smart contracts verified on BNB Smart Chain.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <LoginRegisterModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
}
