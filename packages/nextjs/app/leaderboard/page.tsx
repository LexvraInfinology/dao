"use client";

import { useAccount } from "wagmi";
import { useReadContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { formatAddress } from "../../utils/btitan/formatters";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  IconAward,
  IconShield,
  IconUsers,
  IconCheck,
  IconZap,
  LogoTitan,
} from "../../components/ui/Icons";
import { AuthGuard } from "../../components/auth/AuthGuard";

function useLeaderboardData() {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const registry = contracts?.BTitanRegistry;

  const { data: userList, isLoading: loadingUsers } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "getUserList",
    query: { enabled: !!registry?.address },
  });

  return {
    userList: (userList as string[]) ?? [],
    isLoading: loadingUsers,
  };
}

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <LeaderboardContent />
    </AuthGuard>
  );
}

function LeaderboardContent() {
  const { address: myAddress, isConnected } = useAccount();
  const { userList, isLoading } = useLeaderboardData();

  if (!isConnected) return null;
  if (isLoading) return <LoadingSpinner fullPage label="Loading protocol leaderboard..." />;

  const totalMembers = userList.length;
  const myRank = myAddress
    ? userList.findIndex((u) => u.toLowerCase() === myAddress.toLowerCase()) + 1
    : 0;

  return (
    <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
          <span className="badge-glow badge-gold" style={{ padding: "0.35rem 1rem", fontSize: "0.8rem" }}>
            <IconAward size={14} /> GLOBAL PROTOCOL RANKINGS
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
          Protocol <span className="gradient-text-gold">Leaderboard</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
          Live verifiable on-chain registration order and top platform contributors across the B-TITAN ecosystem.
        </p>
      </div>

      {/* ─── Your Rank Position Card ─────────────────────────────────────── */}
      {myRank > 0 && (
        <div
          className="glass-card glass-card-gold"
          style={{
            marginBottom: "2.5rem",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "540px",
            margin: "0 auto 2.5rem auto",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            Your Global Registration Rank
          </span>
          <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#f59e0b", fontFamily: "var(--font-heading)", lineHeight: 1.1, margin: "0.5rem 0" }}>
            #{myRank}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
            of {totalMembers} registered members worldwide
          </p>
        </div>
      )}

      {/* ─── Top 3 Podium ─────────────────────────────────────────────────── */}
      {userList.length >= 3 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "1.25rem",
            marginBottom: "3rem",
            flexWrap: "wrap",
          }}
        >
          {/* #2 Rank */}
          <div style={{ textAlign: "center", flex: "1 1 180px", maxWidth: "220px" }}>
            <span className="badge-glow badge-gray" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
              #2 RANK
            </span>
            <div
              className="glass-card"
              style={{
                padding: "1.5rem 1rem",
                borderRadius: "16px 16px 0 0",
                minHeight: "140px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                border: "1px solid rgba(148, 163, 184, 0.3)",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 700 }}>
                {formatAddress(userList[1])}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                Founding Member #2
              </div>
            </div>
          </div>

          {/* #1 Champion */}
          <div style={{ textAlign: "center", flex: "1 1 200px", maxWidth: "250px" }}>
            <span className="badge-glow badge-gold" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
              👑 #1 GENESIS ROOT
            </span>
            <div
              className="glass-card glass-card-gold"
              style={{
                padding: "2rem 1rem",
                borderRadius: "20px 20px 0 0",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                boxShadow: "0 0 35px rgba(245, 158, 11, 0.25)",
                border: "2px solid #f59e0b",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "#ffffff", fontWeight: 800 }}>
                {formatAddress(userList[0])}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700, marginTop: "0.3rem" }}>
                Genesis Root Pioneer
              </div>
            </div>
          </div>

          {/* #3 Rank */}
          <div style={{ textAlign: "center", flex: "1 1 180px", maxWidth: "220px" }}>
            <span className="badge-glow badge-violet" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
              #3 RANK
            </span>
            <div
              className="glass-card"
              style={{
                padding: "1.5rem 1rem",
                borderRadius: "16px 16px 0 0",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                border: "1px solid rgba(249, 115, 22, 0.3)",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 700 }}>
                {formatAddress(userList[2])}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                Founding Member #3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Global Registered Roster Table ──────────────────────────────── */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
            Registered Member Roster ({totalMembers})
          </h2>
        </div>

        {userList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ color: "#94a3b8", margin: 0 }}>No registered members found on this network.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Rank</th>
                  <th style={{ textAlign: "left" }}>Member Address</th>
                  <th style={{ textAlign: "right" }}>Network Status</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, i) => {
                  const rank = i + 1;
                  const isMe = myAddress?.toLowerCase() === user.toLowerCase();

                  return (
                    <tr
                      key={user}
                      id={`leaderboard-row-${rank}`}
                      style={{
                        background: isMe ? "rgba(245,158,11,0.08)" : undefined,
                      }}
                    >
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            color: rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#f97316" : "#64748b",
                          }}
                        >
                          #{rank}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontFamily: "monospace", color: isMe ? "#f59e0b" : "#e2e8f0", fontWeight: 600 }}>
                            {user}
                          </span>
                          {isMe && (
                            <span className="badge-glow badge-gold" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="badge-glow badge-green" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                          <IconCheck size={12} /> Active
                        </span>
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
