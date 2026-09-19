"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { formatAddress } from "../../utils/btitan/formatters";
import { useUserProfile } from "../../hooks/btitan/useUserProfile";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function ReferralsPage() {
  return (
    <AuthGuard>
      <ReferralsContent />
    </AuthGuard>
  );
}

function ReferralsContent() {
  const { address } = useAccount();
  const { profile } = useUserProfile(address);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const referralCode = profile?.referralCode || (profile?.userId ? profile.userId + 9999 : 10000);
  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://equora.fi/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("5-Digit Referral link copied to clipboard!");
  };

  const directCount = profile?.directReferralCount || 0;
  const sponsor = profile?.sponsor && profile.sponsor !== "0x0000000000000000000000000000000000000000"
    ? profile.sponsor
    : "0x0000...0000";

  return (
    <div className="flex flex-col w-full relative z-0 font-body-md text-on-surface">
      <div className="p-4 sm:p-8 w-full max-w-container-max mx-auto space-y-8 sm:space-y-10 pb-24">
        {/* ─── Hero / Stats Panel ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Code Generator Card (2 cols) */}
          <div className="col-span-1 lg:col-span-2 bg-surface-container rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-outline-variant/20">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-primary uppercase tracking-widest text-xs font-label-md font-bold">
                <span className="material-symbols-outlined text-lg">share</span>
                <span>Institutional Network Expansion</span>
                <span className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-code font-bold text-[11px]">
                  ID: #{referralCode}
                </span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-headline-lg font-headline-lg text-on-surface font-black mb-2">
                  Invite Partners & Scale Network
                </h2>
                <p className="text-xs sm:text-body-md text-on-surface-variant max-w-lg leading-relaxed">
                  Direct partners unlock your 12-slot matrix progression, 40% salary pool ladder points, and 100% instant push dividend splits on every level cycle.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <div className="flex-1 bg-background p-3 sm:p-3.5 rounded-xl flex items-center justify-between border border-outline-variant/20">
                  <span className="text-xs font-code text-on-surface truncate pr-3 select-all">
                    {referralUrl}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowQR(true)}
                  className="bg-secondary-container text-on-secondary-container px-5 py-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider hover:bg-secondary-container/90 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                  <span>Generate QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sponsor Verification Card (1 col) */}
          <div className="col-span-1 bg-surface-container-high rounded-2xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center justify-center relative overflow-hidden border border-outline-variant/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-container to-primary" />
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-surface rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-base sm:text-headline-md font-headline-md text-on-surface font-bold">
                Verified Sponsor
              </h3>
              <p className="text-xs font-code text-primary opacity-80 font-bold">
                {formatAddress(sponsor)}
              </p>
            </div>
            <div className="mt-6 w-full bg-surface p-3.5 sm:p-4 rounded-xl flex justify-between items-center z-10 border border-outline-variant/15">
              <span className="text-xs text-on-surface-variant font-medium">Status</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-code font-bold tracking-wider uppercase">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* ─── Network Genealogy Map ────────────────────────────────────────── */}
        <section className="space-y-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg sm:text-headline-md font-headline-md text-on-surface flex items-center gap-3 font-bold">
              <span className="material-symbols-outlined text-primary">account_tree</span>
              Network Genealogy ({directCount} Direct Partners)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-label-md transition-colors shadow-sm ${
                  viewMode === "list"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-label-md transition-colors shadow-sm ${
                  viewMode === "tree"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                Tree View
              </button>
            </div>
          </div>

          <div className="w-full bg-surface-container rounded-2xl min-h-[460px] relative overflow-hidden shadow-xl p-6 sm:p-8 flex items-center justify-center border border-outline-variant/15">
            {/* Ambient Background Grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #b9c7e4 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Tree Canvas */}
            <div className="relative w-full h-full flex flex-col items-center justify-between py-6">
              {/* Root Node (You) */}
              <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(206,0,8,0.4)] z-20 hover:scale-110 transition-transform cursor-pointer relative group">
                <span className="material-symbols-outlined text-on-secondary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
                <div className="absolute top-full mt-2 w-48 bg-surface p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 border border-outline-variant/30 text-center">
                  <p className="text-xs text-on-surface font-code font-bold truncate">{address || "You"}</p>
                  <p className="text-[10px] text-tertiary font-bold uppercase mt-0.5">Tier 1 Partner</p>
                </div>
              </div>

              {/* Direct Downline Nodes */}
              <div className="w-full flex justify-around items-center px-4 sm:px-12 my-12 z-20">
                <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer relative group border border-primary/30">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                  <div className="absolute bottom-full mb-2 w-32 bg-surface p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 text-center border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface font-code truncate">Partner #1</p>
                    <p className="text-[9px] text-green-400 uppercase tracking-widest mt-0.5 font-bold">Active</p>
                  </div>
                </div>

                <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer relative group border border-primary/30">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                  <div className="absolute bottom-full mb-2 w-32 bg-surface p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 text-center border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface font-code truncate">Partner #2</p>
                    <p className="text-[9px] text-green-400 uppercase tracking-widest mt-0.5 font-bold">Active</p>
                  </div>
                </div>

                <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer relative group border border-outline-variant/30 opacity-50">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">person_off</span>
                  <div className="absolute bottom-full mb-2 w-32 bg-surface p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 text-center border border-outline-variant/20">
                    <p className="text-[10px] text-on-surface font-code truncate">Open Slot</p>
                    <p className="text-[9px] text-outline uppercase tracking-widest mt-0.5 font-bold">Available</p>
                  </div>
                </div>
              </div>

              {/* Protocol Assistant Overlay */}
              <div className="w-full flex justify-end items-end gap-3 mt-4">
                <div className="bg-surface/90 backdrop-blur-md p-3.5 rounded-2xl rounded-br-none shadow-2xl border border-primary/20 max-w-xs relative text-xs text-on-surface leading-tight">
                  <p>
                    Each direct partner unlocks deeper matrix tiers and increases your monthly salary ladder allocation. Keep expanding your network!
                  </p>
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl bg-surface-container shrink-0 p-1">
                  <img
                    alt="EQUORA.FI Network"
                    className="w-full h-full object-cover rounded-xl"
                    src="/assets/branding/equorafilogo.jpeg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Direct Partners Table ────────────────────────────────────────── */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-headline-md font-headline-md text-on-surface font-bold">
                Direct Partners ({directCount})
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                On-chain direct referrals recorded under your ID #{referralCode}
              </p>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container rounded-full py-2 pl-9 pr-4 text-xs font-code text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner w-56 sm:w-64 border border-outline-variant/20"
              />
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/15">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-high/50 text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] font-bold">
                    <th className="p-4 font-semibold">#</th>
                    <th className="p-4 font-semibold">Wallet Address</th>
                    <th className="p-4 font-semibold">Network Role</th>
                    <th className="p-4 font-semibold">Matrix Status</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-code">
                  {/* Root Node (You) */}
                  <tr className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-4 text-outline font-bold">ROOT</td>
                    <td className="p-4 font-bold text-primary flex items-center gap-2">
                      <span>{address ? formatAddress(address) : "0x71C...4921"}</span>
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">YOU</span>
                    </td>
                    <td className="p-4 text-on-surface font-sans">Network Sponsor</td>
                    <td className="p-4 text-tertiary">
                      {profile?.isQualified ? "Qualified (2/2 Direct)" : `${directCount} / 2 Referrals`}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>

                  {/* Direct Downlines */}
                  {profile?.directReferrals && profile.directReferrals.length > 0 ? (
                    profile.directReferrals
                      .filter((ref) => !searchQuery || ref.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((refAddress, idx) => (
                        <tr key={refAddress} className="hover:bg-surface-container-high/30 transition-colors">
                          <td className="p-4 text-outline font-bold">#{idx + 1}</td>
                          <td className="p-4 text-on-surface font-bold">{formatAddress(refAddress)}</td>
                          <td className="p-4 text-on-surface font-sans">Direct Partner (Tier 1)</td>
                          <td className="p-4 text-green-400 font-sans">Matrix Active</td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant font-sans">
                        <div className="max-w-md mx-auto space-y-2">
                          <p className="text-sm font-semibold text-on-surface">No Direct Partners Yet</p>
                          <p className="text-xs text-outline">
                            Share your personal 5-digit referral link to build your team and qualify for matrix upgrade bonuses!
                          </p>
                          <button
                            onClick={copyToClipboard}
                            className="mt-3 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold font-label-md uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            <span>Copy Referral Link</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 text-sm"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-on-surface mb-1">Referral QR Code</h3>
            <p className="text-xs text-on-surface-variant mb-6">Scan with camera to join EQUORA_Fi</p>
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-md">
              <img
                alt="QR Code"
                className="w-full h-full object-contain"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralUrl)}`}
              />
            </div>
            <p className="mt-4 text-[10px] font-code text-outline truncate">{referralUrl}</p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full mt-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-xs font-bold uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
