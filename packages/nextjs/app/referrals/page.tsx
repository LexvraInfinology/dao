"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";
import { generateReferralUrl, formatAddress, copyToClipboard } from "../../utils/btitan/formatters";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [refUrl, setRefUrl] = useState("");

  const { profile } = useUserProfile(address);

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  useEffect(() => {
    if (address) setRefUrl(generateReferralUrl(address));
  }, [address]);

  const handleCopy = async () => {
    if (!refUrl) return;
    const ok = await copyToClipboard(refUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isConnected) return null;

  const refCount = profile.directReferralCount;
  const isQualified = profile.isQualified;
  const referrals = profile.directReferrals;

  return (
    <div className="page-container" style={{ paddingTop: "2rem" }}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">👥 Referrals</h1>
        <p className="page-subtitle">
          Invite friends to earn spillover income. Need 2 referrals to become qualified.
        </p>
      </div>

      {/* ─── Qualification Status ─────────────────────────────────────────── */}
      <div
        className={`card ${isQualified ? "card-green" : ""}`}
        style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center",
                 justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
                 borderColor: isQualified ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)" }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
            Qualification Status
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800,
                        color: isQualified ? "#22c55e" : "#f59e0b" }}>
            {isQualified ? "✅ Qualified!" : `${refCount} / 2 Referrals`}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
            {isQualified
              ? "You receive direct earnings from the matrix"
              : `Need ${2 - refCount} more referral${2 - refCount !== 1 ? "s" : ""} to unlock matrix earnings`}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900,
                        color: isQualified ? "#22c55e" : "#f59e0b" }}>
            {refCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Direct Referrals</div>
        </div>
      </div>

      {/* ─── Referral Link Card ───────────────────────────────────────────── */}
      <div className="card card-gold" style={{ marginBottom: "1.5rem" }}>
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
          Your <span>Referral Link</span>
        </h2>

        <div
          style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px",
                   padding: "0.875rem 1rem", fontFamily: "monospace", fontSize: "0.8rem",
                   color: "#94a3b8", wordBreak: "break-all", marginBottom: "0.875rem",
                   border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {refUrl || "Connect wallet to generate link"}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            id="copy-referral-link-btn"
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={!refUrl}
          >
            {copied ? "✅ Copied!" : "📋 Copy Link"}
          </button>

          {/* Share Buttons */}
          {refUrl && (
            <>
              <a
                id="share-twitter-btn"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Join me on B-TITAN — the Web3 matrix platform! Earn BTT with the Genesis DAO and 12-slot matrix.\n\n${refUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                🐦 Twitter
              </a>
              <a
                id="share-telegram-btn"
                href={`https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(
                  "Join B-TITAN — Web3 Matrix Platform! Earn BTT passively."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                ✈️ Telegram
              </a>
            </>
          )}
        </div>
      </div>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
          How <span>It Works</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { step: "1", icon: "🔗", title: "Share Your Link", desc: "Send your unique referral URL to friends" },
            { step: "2", icon: "👤", title: "Friend Joins",    desc: "They join via your link — you're set as their sponsor" },
            { step: "3", icon: "✅", title: "Get Qualified",   desc: "2 direct referrals = qualified for matrix earnings" },
            { step: "4", icon: "💰", title: "Earn Spillover",  desc: "Positions 7 & 10 of your matrix tree pay your referrals" },
          ].map((item) => (
            <div
              key={item.step}
              style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px",
                       padding: "1rem", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "0.25rem" }}>{item.title}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Direct Referrals Table ───────────────────────────────────────── */}
      <div className="card">
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
          Direct <span>Referrals</span>
          <span className="badge badge-gold" style={{ marginLeft: "0.75rem", fontSize: "0.75rem" }}>
            {refCount}
          </span>
        </h2>

        {referrals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">
              No direct referrals yet.<br />
              Share your link to start earning!
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Wallet Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref, i) => (
                <tr key={ref}>
                  <td style={{ color: "#64748b" }}>{i + 1}</td>
                  <td>
                    <span style={{ fontFamily: "monospace", color: "#e2e8f0" }}>
                      {formatAddress(ref)}
                    </span>
                    <button
                      id={`copy-ref-${i}-btn`}
                      onClick={() => copyToClipboard(ref)}
                      style={{ background: "none", border: "none", color: "#475569",
                               cursor: "pointer", marginLeft: "0.5rem", fontSize: "0.8rem" }}
                    >
                      📋
                    </button>
                  </td>
                  <td>
                    <span className="badge badge-green">✅ Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
