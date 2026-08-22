"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";
import { generateReferralUrl, formatAddress, copyToClipboard } from "../../utils/btitan/formatters";
import { notification } from "../../utils/scaffold-eth/notification";
import {
  IconUsers,
  IconCheck,
  IconZap,
  IconShield,
  IconGrid,
  IconWallet,
  LogoTitan,
} from "../../components/ui/Icons";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function ReferralsPage() {
  return (
    <AuthGuard>
      <ReferralsContent />
    </AuthGuard>
  );
}

function ReferralsContent() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [refUrl, setRefUrl] = useState("");

  const { profile } = useUserProfile(address);

  useEffect(() => {
    if (address) setRefUrl(generateReferralUrl(address));
  }, [address]);

  const handleCopy = async () => {
    if (!refUrl) return;
    const ok = await copyToClipboard(refUrl);
    if (ok) {
      setCopied(true);
      notification.success("Referral URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isConnected) return null;

  const refCount = profile.directReferralCount;
  const isQualified = profile.isQualified;
  const referrals = profile.directReferrals;

  return (
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-green" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
            <IconUsers size={14} /> REFERRAL NETWORK & SPILLOVER ENGINE
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
          Referral <span className="gradient-text-gold">Partner Network</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
          Invite 2 partners to unlock 100% full matrix rewards and global community spillover allocations.
        </p>
      </div>

      {/* ─── Qualification Status Hero ────────────────────────────────────── */}
      <div
        className={`glass-card ${isQualified ? "glass-card-gold" : ""}`}
        style={{
          marginBottom: "2rem",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isQualified ? "#22c55e" : "#f59e0b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Qualification Status
            </span>
          </div>

          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              color: "#ffffff",
              fontFamily: "var(--font-heading)",
              margin: 0,
            }}
          >
            {isQualified ? "Full Spillover Qualified" : `${refCount} of 2 Partners Invited`}
          </h2>

          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.4rem", margin: 0 }}>
            {isQualified
              ? "Your account is eligible for 100% matrix direct and automated spillover payouts."
              : `Invite ${2 - refCount} more direct partner${2 - refCount !== 1 ? "s" : ""} to unlock global matrix spillover.`}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: isQualified ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
              border: isQualified ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(245,158,11,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "1.75rem", fontWeight: 900, color: isQualified ? "#22c55e" : "#f59e0b", lineHeight: 1 }}>
              {refCount}
            </span>
            <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
              Partners
            </span>
          </div>
        </div>
      </div>

      {/* ─── Share Link Card ──────────────────────────────────────────────── */}
      <div className="glass-card glass-card-gold" style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginBottom: "1rem" }}>
          Your Direct Referral Link
        </h2>

        <div
          style={{
            background: "rgba(10, 15, 26, 0.8)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            color: "#f59e0b",
            wordBreak: "break-all",
            marginBottom: "1.25rem",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          {refUrl || "Generating referral link..."}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            id="copy-referral-link-btn"
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={!refUrl}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <IconCheck size={16} />
            {copied ? "Link Copied!" : "Copy Referral Link"}
          </button>

          {refUrl && (
            <>
              <a
                id="share-twitter-btn"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Join the B-TITAN protocol! Earn direct and spillover rewards in the Genesis DAO and 12-Slot Matrix:\n\n${refUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Share on X (Twitter)
              </a>
              <a
                id="share-telegram-btn"
                href={`https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(
                  "Join B-TITAN Protocol — Web3 Matrix & Genesis DAO Platform!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Share on Telegram
              </a>
            </>
          )}
        </div>
      </div>

      {/* ─── Direct Referrals List ────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Direct Referrals ({refCount})
          </h2>
        </div>

        {referrals.length === 0 ? (
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
              <IconUsers size={28} color="#64748b" />
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
              No direct partners yet. Share your referral link above to start building your network!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>#</th>
                  <th style={{ textAlign: "left" }}>Partner Wallet</th>
                  <th style={{ textAlign: "right" }}>Network Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref, i) => (
                  <tr key={ref}>
                    <td style={{ color: "#64748b", fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <span style={{ fontFamily: "monospace", color: "#e2e8f0", fontWeight: 600 }}>
                        {ref}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="badge-glow badge-green" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                        <IconCheck size={12} /> Active Member
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
