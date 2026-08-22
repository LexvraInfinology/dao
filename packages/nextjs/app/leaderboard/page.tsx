"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useReadContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { formatBTT } from "../../utils/btitan/matrixHelpers";
import { formatAddress } from "../../utils/btitan/formatters";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

type SupportedChainId = keyof typeof deployedContracts;

interface LeaderEntry {
  address: string;
  totalEarned: bigint;
  highestSlot: number;
  rank: number;
}

const TROPHY: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_COLORS: Record<number, string> = {
  1: "#f59e0b",
  2: "#94a3b8",
  3: "#f97316",
};

function useLeaderboardData() {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const registry = contracts?.BTitanRegistry;

  // Get all registered users
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
  const { address: myAddress, isConnected } = useAccount();
  const router = useRouter();
  const { userList, isLoading } = useLeaderboardData();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  if (!isConnected) return null;
  if (isLoading) return <LoadingSpinner fullPage label="Loading leaderboard..." />;

  // Note: Full leaderboard with per-user stats requires multicall.
  // For now show the registered member list with on-chain count.
  const totalMembers = userList.length;
  const myRank = myAddress
    ? userList.findIndex((u) => u.toLowerCase() === myAddress.toLowerCase()) + 1
    : 0;

  return (
    <div className="page-container" style={{ paddingTop: "2rem" }}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">
          Registered B-TITAN members — {totalMembers} total.
        </p>
      </div>

      {/* ─── Your Position Banner ─────────────────────────────────────────── */}
      {myRank > 0 && (
        <div className="card card-gold" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
            Your Registration Rank
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "#f59e0b" }}>
            #{myRank}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
            of {totalMembers} registered members
          </div>
        </div>
      )}

      {/* ─── Top 3 Podium ─────────────────────────────────────────────────── */}
      {userList.length >= 3 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end",
                      gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {/* 2nd place */}
          <div style={{ textAlign: "center", flex: "0 1 160px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🥈</div>
            <div style={{ background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.3)",
                          borderRadius: "12px 12px 0 0", padding: "1rem",
                          minHeight: "80px", display: "flex", flexDirection: "column",
                          justifyContent: "flex-end" }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#94a3b8" }}>
                {formatAddress(userList[1])}
              </div>
              <div style={{ fontWeight: 700, color: "#94a3b8", marginTop: "0.25rem" }}>
                #2
              </div>
            </div>
          </div>

          {/* 1st place */}
          <div style={{ textAlign: "center", flex: "0 1 180px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🥇</div>
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.4)",
                          borderRadius: "12px 12px 0 0", padding: "1.25rem",
                          minHeight: "110px", display: "flex", flexDirection: "column",
                          justifyContent: "flex-end", boxShadow: "0 0 20px rgba(245,158,11,0.2)" }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#f59e0b" }}>
                {formatAddress(userList[0])}
              </div>
              <div style={{ fontWeight: 800, color: "#f59e0b", marginTop: "0.25rem" }}>
                #1 FIRST
              </div>
            </div>
          </div>

          {/* 3rd place */}
          <div style={{ textAlign: "center", flex: "0 1 160px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🥉</div>
            <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
                          borderRadius: "12px 12px 0 0", padding: "1rem",
                          minHeight: "60px", display: "flex", flexDirection: "column",
                          justifyContent: "flex-end" }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#f97316" }}>
                {formatAddress(userList[2])}
              </div>
              <div style={{ fontWeight: 700, color: "#f97316", marginTop: "0.25rem" }}>
                #3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Full Leaderboard Table ───────────────────────────────────────── */}
      <div className="card">
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
          All <span>Members</span>
          <span className="badge badge-gold" style={{ marginLeft: "0.75rem" }}>
            {totalMembers}
          </span>
        </h2>

        {userList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <div className="empty-state-text">
              No members registered yet.<br />
              Be the first to join B-TITAN!
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Address</th>
                  <th>Status</th>
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
                        background: isMe ? "rgba(245,158,11,0.06)" : undefined,
                      }}
                    >
                      <td>
                        <span style={{ fontWeight: 700,
                                       color: rank <= 3 ? MEDAL_COLORS[rank] : "#64748b" }}>
                          {TROPHY[rank] ?? `#${rank}`}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{ width: 32, height: 32, borderRadius: "50%",
                                     background: `hsl(${parseInt(user.slice(2, 8), 16) % 360}, 60%, 35%)`,
                                     display: "flex", alignItems: "center", justifyContent: "center",
                                     fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}
                          >
                            {user.slice(2, 4).toUpperCase()}
                          </div>
                          <span style={{ fontFamily: "monospace", color: isMe ? "#f59e0b" : "#e2e8f0" }}>
                            {formatAddress(user)}
                            {isMe && <span style={{ marginLeft: "0.5rem", color: "#f59e0b" }}>(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-green">Active</span>
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
