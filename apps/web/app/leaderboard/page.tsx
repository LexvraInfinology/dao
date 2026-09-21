"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatAddress } from "../../utils/equora/formatters";
import { formatBTT } from "../../utils/equora/matrixHelpers";
import { useMatrixData } from "../../hooks/equora/useMatrixData";
import { useUserProfile } from "../../hooks/equora/useUserProfile";
import { AuthGuard } from "../../components/auth/AuthGuard";

const MOCK_LEADERS = [
  { rank: 1, address: "0x9A2C54B789D61E2F3a145876901234567890F3c1", recruits: 1245, volume: "45,200.00", growth: "+5.2%", isGenesis: true },
  { rank: 2, address: "0x3B8D9921C5820491A8E29584710293847581E1a9", recruits: 982, volume: "38,150.50", growth: "+2.1%", isGenesis: true },
  { rank: 3, address: "0x7C1A48D93E20B84920194857201948572019B4d2", recruits: 840, volume: "31,000.00", growth: "-1.4%", isGenesis: false },
  { rank: 4, address: "0x1D9E40592837461920394857201948572019C5e8", recruits: 712, volume: "28,540.25", growth: "+0.8%", isGenesis: false },
  { rank: 5, address: "0x4E2B81940592837461920394857201948572D6f9", recruits: 654, volume: "24,800.00", growth: "+4.3%", isGenesis: false },
];

export default function LeaderboardPage() {
  return (
    <AuthGuard>
      <LeaderboardContent />
    </AuthGuard>
  );
}

function LeaderboardContent() {
  const { address } = useAccount();
  const { financials } = useMatrixData(address);
  const { profile } = useUserProfile(address);
  const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d">("all");

  const totalVolume = financials?.lifetimeEarned ? formatBTT(financials.lifetimeEarned) : "0.00";
  const directCount = profile?.directReferralCount || 0;

  return (
    <div className="flex flex-col w-full relative min-h-screen font-body-md text-on-surface">
      {/* ─── Ambient Canadian Aurora Background ────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-1/4 left-1/3 w-[900px] h-[900px] bg-tertiary/10 rounded-full blur-[140px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "15s", animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 p-4 sm:p-8 md:p-12 flex flex-col gap-stack-lg max-w-container-max mx-auto w-full">
        {/* ─── Header Section ─────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md mt-4 sm:mt-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-label-md uppercase tracking-widest backdrop-blur-md border border-primary/20 font-bold">
                Protocol Leaderboard
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant text-[12px] font-code">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live On-Chain
              </span>
            </div>
            <h1 className="text-2xl sm:text-headline-xl font-headline-xl font-black text-on-surface tracking-tight">
              Top Institutional Recruiters
            </h1>
            <p className="text-xs sm:text-body-lg font-body-lg text-on-surface-variant">
              Global ranking of high-net-worth nodes and Genesis DAO contributors.
            </p>
          </div>
        </header>

        {/* ─── User Highlight Status Banner ───────────────────────────────── */}
        <section className="w-full bg-primary-container/40 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden shadow-2xl border border-outline-variant/20 mt-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent z-0 pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0 pointer-events-none" />

          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 z-10 hidden md:block rounded-2xl overflow-hidden border border-primary/30 shadow-xl p-1 bg-surface-container">
            <img
              alt="EQUORA.FI Leaderboard"
              className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-500"
              src="/assets/branding/equorafilogo.jpeg"
            />
          </div>

          <div className="flex-1 flex flex-col gap-4 z-10 w-full">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">military_tech</span>
              <span className="text-xs font-label-md text-tertiary uppercase tracking-widest font-bold">
                Your Current Status
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-12 sm:items-end justify-between">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-headline-lg font-headline-lg font-black text-on-surface">
                  {directCount > 0 ? `Active Node` : "Novice Node"}
                </span>
                <span className="text-xs font-body-md text-on-surface-variant">
                  {directCount} Direct Downline Partners
                </span>
              </div>
              <div className="w-px h-12 bg-outline-variant/30 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-xl sm:text-headline-md font-headline-md font-black text-on-surface">
                  {totalVolume} TROB
                </span>
                <span className="text-xs font-body-md text-on-surface-variant">Total Value Generated</span>
              </div>
              <div className="w-px h-12 bg-outline-variant/30 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-xl sm:text-headline-md font-headline-md font-black text-primary">+100%</span>
                <span className="text-xs font-body-md text-on-surface-variant">Push Distribution</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4">
              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_10px_rgba(233,193,118,0.5)]"
                  style={{ width: `${Math.min(100, (directCount / 10) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-label-md text-on-surface-variant whitespace-nowrap font-code">
                {directCount >= 10 ? "Top Sovereign Leader" : `${10 - directCount} Partners to Apex Rank`}
              </span>
            </div>
          </div>
        </section>

        {/* ─── Global Rankings Table ────────────────────────────────────────── */}
        <section className="bg-surface-container/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl mt-2 flex flex-col border border-outline-variant/20">
          <div className="p-4 sm:p-6 bg-surface-container-low/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-base sm:text-headline-md font-headline-md font-bold text-on-surface">
              Global Rankings
            </h2>
            <div className="flex gap-1 bg-surface-container-high p-1 rounded-lg border border-outline-variant/20">
              <button
                onClick={() => setTimeframe("all")}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-label-md font-bold transition-all ${
                  timeframe === "all"
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeframe("30d")}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-label-md font-bold transition-all ${
                  timeframe === "30d"
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeframe("7d")}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-label-md font-bold transition-all ${
                  timeframe === "7d"
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                7 Days
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface-container/50 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                  <th className="p-4 sm:p-6 font-semibold w-20 text-center">Rank</th>
                  <th className="p-4 sm:p-6 font-semibold">Node Address</th>
                  <th className="p-4 sm:p-6 font-semibold">Direct Recruits</th>
                  <th className="p-4 sm:p-6 font-semibold">Matrix Volume</th>
                  <th className="p-4 sm:p-6 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {MOCK_LEADERS.map((leader) => (
                  <tr
                    key={leader.rank}
                    className={`hover:bg-surface-container/80 transition-colors ${
                      leader.rank === 1 ? "bg-primary/5" : "bg-surface-container-low/20"
                    }`}
                  >
                    <td className="p-4 sm:p-6 text-center font-headline-md font-bold text-tertiary">
                      {leader.rank === 1 ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[20px]">trophy</span> 1
                        </span>
                      ) : (
                        leader.rank
                      )}
                    </td>
                    <td className="p-4 sm:p-6 font-code text-on-surface flex items-center gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-tertiary to-primary flex items-center justify-center shadow-md shrink-0">
                        <span className="material-symbols-outlined text-on-primary text-[14px]">
                          account_balance
                        </span>
                      </div>
                      <span className="font-bold">{formatAddress(leader.address)}</span>
                      {leader.isGenesis && (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-tertiary/20 text-tertiary font-bold ml-1">
                          GENESIS
                        </span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6 font-semibold">{leader.recruits}</td>
                    <td className="p-4 sm:p-6 font-bold">{leader.volume} TROB</td>
                    <td className="p-4 sm:p-6 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          leader.growth.startsWith("+") ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {leader.growth.startsWith("+") ? "trending_up" : "trending_down"}
                        </span>
                        {leader.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
