"use client";

import { useAccount } from "wagmi";
import { formatBTT } from "../../utils/equora/matrixHelpers";
import { useMatrixData } from "../../hooks/equora/useMatrixData";
import { useRewardsData } from "../../hooks/equora/useRewardsData";
import { AuthGuard } from "../../components/auth/AuthGuard";

function formatSecondsToDhms(seconds: number) {
  if (seconds <= 0) return "Ready for Draw";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m ${s}s`;
}

export default function RewardsPage() {
  return (
    <AuthGuard>
      <RewardsContent />
    </AuthGuard>
  );
}

function RewardsContent() {
  const { address } = useAccount();
  const { financials } = useMatrixData(address);
  const { salary, magicBox, milestone, hasWelcomePass } = useRewardsData(address);

  const highestSlot = financials?.highestSlot || 1;
  const rankFromSlot = highestSlot >= 12 ? 4 : highestSlot >= 8 ? 3 : highestSlot >= 4 ? 2 : 1;
  const currentTier = Math.max(salary.userTier, rankFromSlot);

  const poolTiers = [
    {
      tier: 1,
      name: "Alpha Pool Card",
      badge: "Pool Tier 1",
      milestones: "Milestones 1–42",
      icon: "workspace_premium",
      desc: "Levels 1–3 Complete (42 Slots)",
      perks: ["Alpha Salary Pool Share (10%)", "Milestone 1 Cash Reward", "Soulbound Alpha Badge"],
      achieved: currentTier >= 1,
      rewarded: milestone.status.rewardedAlpha,
    },
    {
      tier: 2,
      name: "Prime Pool Card",
      badge: "Pool Tier 2",
      milestones: "Milestones 43–84",
      icon: "military_tech",
      desc: "Levels 4–6 Complete (84 Slots)",
      perks: ["Prime Salary Pool Share (15%)", "Milestone 2 Cash Reward", "Exclusive Current Tier Payout"],
      achieved: currentTier >= 2,
      rewarded: milestone.status.rewardedPrime,
    },
    {
      tier: 3,
      name: "Elite Pool Card",
      badge: "Pool Tier 3",
      milestones: "Milestones 85–126",
      icon: "local_police",
      desc: "Levels 7–9 Complete (126 Slots)",
      perks: ["Elite Salary Pool Share (25%)", "Milestone 3 Cash Reward", "Exclusive Current Tier Payout"],
      achieved: currentTier >= 3,
      rewarded: milestone.status.rewardedElite,
    },
    {
      tier: 4,
      name: "Crown Pool Card",
      badge: "Pool Tier 4",
      milestones: "Milestones 127–168",
      icon: "diamond",
      desc: "Levels 10–12 Complete (168 Slots)",
      perks: ["Crown Salary Apex Share (50%)", "Milestone 4 Top Cash Reward", "Apex Leadership Royalty"],
      achieved: currentTier >= 4,
      rewarded: milestone.status.rewardedCrown,
    },
  ];

  return (
    <div className="flex flex-col w-full relative overflow-hidden font-body-md text-on-surface">
      {/* ─── Decorative Background Glow ────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10" />

      <div className="px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-10 sm:gap-12 max-w-container-max mx-auto w-full relative z-10">
        {/* ─── Header & EquoraBot Banner ────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 w-fit backdrop-blur-md border border-primary/20">
              <span className="material-symbols-outlined text-[14px] text-tertiary">workspace_premium</span>
              <span className="text-xs text-primary font-label-md uppercase tracking-widest font-bold">
                Equora Rewards & Salary Ecosystem
              </span>
            </div>
            <h1 className="font-headline-xl text-3xl sm:text-headline-xl font-black text-on-background max-w-2xl leading-tight">
              Track Your Progress to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">
                Crown Status
              </span>
            </h1>
            <p className="font-body-lg text-sm sm:text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
              Earn from our unpausable smart contract pools: exclusive monthly salary dividends, quarterly community Magic Box draws, and instant milestone payouts as you conquer matrix tiers.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center p-3 bg-surface-container/50 backdrop-blur-xl rounded-2xl relative shadow-xl overflow-hidden group border border-tertiary/25 w-64 h-52 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 via-transparent to-primary/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <img
              alt="Magic Blind Box 3D Art"
              className="w-full h-full object-cover rounded-xl relative z-10 group-hover:scale-105 transition-transform duration-500"
              src="/assets/branding/mystery_box.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent z-20 flex flex-col justify-end p-3">
              <span className="text-[10px] font-bold font-code text-tertiary uppercase tracking-wider">
                Quarterly Community Pool
              </span>
              <p className="text-xs text-white font-bold">
                {4 - currentTier > 0 ? `${4 - currentTier} tiers away from Crown!` : "Crown Member Active!"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Live Claim Widgets Row ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Widget 1: Monthly Salary Pool */}
          <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/20 shadow-lg flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-label-md uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  Monthly Salary Pool
                </span>
                <span className="text-[10px] font-code px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  11th UTC Settlement
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-on-surface-variant">Claimable Salary:</span>
                <div className="text-2xl font-headline-xl font-black text-on-surface">
                  {formatBTT(salary.claimableSalary)}{" "}
                  <span className="text-xs font-normal text-on-surface-variant">TROB</span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                Exclusive tier earnings (Alpha 10%, Prime 15%, Elite 25%, Crown 50%). Achievers receive dividends strictly from their current highest milestone tier.
              </p>
            </div>
            <button
              onClick={salary.claimSalary}
              disabled={salary.isClaimingSalary || salary.claimableSalary === 0n}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>{salary.isClaimingSalary ? "Claiming..." : "Claim Salary"}</span>
            </button>
          </div>

          {/* Widget 2: Magic Box Quarterly Pool */}
          <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/20 shadow-lg flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-label-md uppercase tracking-wider text-tertiary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">featured_seasonal_and_gifts</span>
                  Quarterly Magic Box
                </span>
                <span className="text-[10px] font-code px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-bold">
                  {magicBox.eligibleCount} Eligible
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-on-surface-variant">Pending Draw Prize:</span>
                <div className="text-2xl font-headline-xl font-black text-tertiary">
                  {formatBTT(magicBox.pendingReward)}{" "}
                  <span className="text-xs font-normal text-on-surface-variant">TROB</span>
                </div>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>Next Draw: <strong className="text-on-surface">{formatSecondsToDhms(magicBox.timeUntilNextDraw)}</strong></span>
              </div>
            </div>
            <button
              onClick={magicBox.claimBoxReward}
              disabled={magicBox.isClaimingBox || magicBox.pendingReward === 0n}
              className="w-full py-2.5 bg-tertiary hover:bg-tertiary/90 text-on-tertiary rounded-lg font-label-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">redeem</span>
              <span>{magicBox.isClaimingBox ? "Claiming..." : "Claim Box Reward"}</span>
            </button>
          </div>

          {/* Widget 3: Instant Milestone Payout */}
          <div className="bg-surface-container/50 backdrop-blur-xl rounded-2xl p-6 border border-outline-variant/20 shadow-lg flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-label-md uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Instant Milestone Rewards
                </span>
                <span className="text-[10px] font-code px-2 py-0.5 rounded bg-secondary/10 text-secondary font-bold">
                  1-Time Payouts
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xs text-on-surface-variant">Milestone Balance:</span>
                <div className="text-2xl font-headline-xl font-black text-secondary">
                  {formatBTT(milestone.pendingReward)}{" "}
                  <span className="text-xs font-normal text-on-surface-variant">TROB</span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                Instant one-time bonuses credited the moment you qualify for Alpha, Prime, Elite, or Crown rank.
              </p>
            </div>
            <button
              onClick={milestone.claimMilestoneReward}
              disabled={milestone.isClaimingMilestone || milestone.pendingReward === 0n}
              className="w-full py-2.5 bg-secondary-container hover:bg-secondary-container/90 text-on-secondary rounded-lg font-label-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">celebration</span>
              <span>{milestone.isClaimingMilestone ? "Claiming..." : "Claim Milestone Bonus"}</span>
            </button>
          </div>
        </div>

        {/* ─── 4 Pool Cards Grid ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-headline-lg font-bold text-on-surface">Official Pool Cards</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Complete matrix levels to advance through salary tiers. Members receive monthly dividends from their current highest achieved tier only.
              </p>
            </div>
            <span className="text-xs font-code text-tertiary">
              Your Milestones: <strong>{salary.userMilestones}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {poolTiers.map((card) => (
              <div
                key={card.tier}
                className={`rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden transition-all shadow-sm border ${
                  card.achieved
                    ? card.tier === 4
                      ? "bg-surface-container-low border-tertiary/40 shadow-lg shadow-tertiary/10"
                      : "bg-surface-container-low border-primary/30"
                    : "bg-surface-container-low/40 border-outline-variant/10 opacity-60"
                }`}
              >
                {card.tier === 4 && card.achieved && (
                  <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none" />
                )}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`text-xs font-label-md uppercase tracking-wider font-bold ${
                      card.tier === 4 ? "text-tertiary" : "text-on-surface-variant"
                    }`}
                  >
                    {card.badge}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      card.achieved ? "bg-primary/20 text-primary" : "bg-surface-variant text-outline"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {card.achieved ? "lock_open" : "lock"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 py-2 z-10">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${
                      card.tier === 4
                        ? "bg-gradient-to-b from-tertiary/20 to-surface/20 text-tertiary"
                        : "bg-gradient-to-b from-surface-variant to-surface text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[36px]">{card.icon}</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">{card.name}</h3>
                    <span className="text-[11px] font-code text-primary font-bold">{card.desc}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 z-10 text-xs text-on-surface-variant">
                  {card.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-2 z-10">
                  <div
                    className={`w-full text-center py-2 rounded-lg font-label-md text-xs font-bold uppercase tracking-wider ${
                      card.achieved
                        ? card.tier === 4
                          ? "bg-tertiary/10 text-tertiary border border-tertiary/30"
                          : "bg-primary/20 text-primary"
                        : "bg-surface-variant text-on-surface-variant/50"
                    }`}
                  >
                    {card.achieved ? "✓ Tier Achieved" : "Locked"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Exclusive Tier Salary System Explanation Banner ─────────────────────── */}
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-surface-variant" />
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center relative z-10">
            <div className="flex-1 flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-primary font-code font-bold">
                AUTONOMOUS EXCLUSIVE SALARY SYSTEM
              </span>
              <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-on-surface">
                How Monthly Salary Distributions Work
              </h2>
              <p className="text-xs sm:text-body-md text-on-surface-variant leading-relaxed">
                Equora.Fi distributes 40% of protocol volume on the 11th of each month across 4 exclusive achievement tiers: <strong>Alpha (10%)</strong>, <strong>Prime (15%)</strong>, <strong>Elite (25%)</strong>, and <strong>Crown (50%)</strong>. Members receive salary strictly for their current highest milestone rank without multi-pool dilution. If any tier has zero achievers, its allocation dynamically cascades to active tiers. If zero achievers exist platform-wide, 100% of the funds roll over to the next month without loss.
              </p>
            </div>
            <div className="flex gap-6 sm:gap-8 items-center shrink-0">
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-code font-black text-tertiary">Exclusive</div>
                <div className="text-xs text-outline font-label-md uppercase tracking-wider mt-1">Current Tier</div>
              </div>
              <div className="w-px h-12 bg-outline-variant/30" />
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-code font-black text-primary">11th</div>
                <div className="text-xs text-outline font-label-md uppercase tracking-wider mt-1">Monthly Auto</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
