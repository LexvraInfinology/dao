"use client";

import { useState } from "react";
import { useReadContract, useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";

export function useRewardsData(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];

  const salaryContract = contracts?.EquoraSalaryPool;
  const magicBoxContract = contracts?.EquoraMagicBox;
  const rewardContract = contracts?.EquoraRewardPool;
  const nftContract = contracts?.BTitanNFT;

  const enabled = !!userAddress;

  // ─── Salary Pool Reads ───────────────────────────────────────────────────────
  const { data: userTierRaw, refetch: refetchTier } = useReadContract({
    address: salaryContract?.address as `0x${string}`,
    abi: salaryContract?.abi,
    functionName: "getUserTier",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!salaryContract?.address, refetchInterval: 5000 },
  });

  const { data: claimableSalaryRaw, refetch: refetchSalary } = useReadContract({
    address: salaryContract?.address as `0x${string}`,
    abi: salaryContract?.abi,
    functionName: "getClaimable",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!salaryContract?.address, refetchInterval: 5000 },
  });

  const { data: userMilestonesRaw, refetch: refetchMilestones } = useReadContract({
    address: salaryContract?.address as `0x${string}`,
    abi: salaryContract?.abi,
    functionName: "getUserPoolCount",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!salaryContract?.address, refetchInterval: 5000 },
  });

  const { data: poolCountsRaw, refetch: refetchPoolCounts } = useReadContract({
    address: salaryContract?.address as `0x${string}`,
    abi: salaryContract?.abi,
    functionName: "getPoolCounts",
    query: { enabled: !!salaryContract?.address, refetchInterval: 10000 },
  });

  // ─── Magic Box Reads ─────────────────────────────────────────────────────────
  const { data: boxPendingRewardRaw, refetch: refetchBoxReward } = useReadContract({
    address: magicBoxContract?.address as `0x${string}`,
    abi: magicBoxContract?.abi,
    functionName: "getPendingReward",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!magicBoxContract?.address, refetchInterval: 5000 },
  });

  const { data: boxTimeUntilNextDrawRaw, refetch: refetchBoxTimer } = useReadContract({
    address: magicBoxContract?.address as `0x${string}`,
    abi: magicBoxContract?.abi,
    functionName: "getTimeUntilNextDraw",
    query: { enabled: !!magicBoxContract?.address, refetchInterval: 10000 },
  });

  const { data: boxEligibleCountRaw, refetch: refetchBoxCount } = useReadContract({
    address: magicBoxContract?.address as `0x${string}`,
    abi: magicBoxContract?.abi,
    functionName: "getEligibleCount",
    query: { enabled: !!magicBoxContract?.address, refetchInterval: 10000 },
  });

  // ─── Milestone Reward Pool Reads ─────────────────────────────────────────────
  const { data: rewardPendingRaw, refetch: refetchMilestonePending } = useReadContract({
    address: rewardContract?.address as `0x${string}`,
    abi: rewardContract?.abi,
    functionName: "getPendingReward",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!rewardContract?.address, refetchInterval: 5000 },
  });

  const { data: userRewardStatusRaw, refetch: refetchMilestoneStatus } = useReadContract({
    address: rewardContract?.address as `0x${string}`,
    abi: rewardContract?.abi,
    functionName: "getUserRewardStatus",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!rewardContract?.address, refetchInterval: 5000 },
  });

  // ─── NFT Reads ───────────────────────────────────────────────────────────────
  const { data: hasWelcomePassRaw } = useReadContract({
    address: nftContract?.address as `0x${string}`,
    abi: nftContract?.abi,
    functionName: "hasWelcomePass",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!nftContract?.address },
  });

  // ─── Writes ──────────────────────────────────────────────────────────────────
  const [isClaimingSalary, setIsClaimingSalary] = useState(false);
  const [isClaimingBox, setIsClaimingBox] = useState(false);
  const [isClaimingMilestone, setIsClaimingMilestone] = useState(false);

  const { writeContractAsync: writeSalary } = useWriteContract();
  const { writeContractAsync: writeBox } = useWriteContract();
  const { writeContractAsync: writeReward } = useWriteContract();

  const claimSalary = async () => {
    if (!salaryContract?.address) return;
    setIsClaimingSalary(true);
    const toastId = notification.loading("Claiming monthly salary distribution...");
    try {
      const tx = await writeSalary({
        address: salaryContract.address as `0x${string}`,
        abi: salaryContract.abi,
        functionName: "claimSalary",
        args: [],
      });
      notification.dismiss(toastId);
      notification.txSuccess(tx);
      notification.success("🎉 Monthly salary claimed successfully!");
      refetchSalary();
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.shortMessage || err?.message || "Salary claim failed");
    } finally {
      setIsClaimingSalary(false);
    }
  };

  const claimBoxReward = async () => {
    if (!magicBoxContract?.address) return;
    setIsClaimingBox(true);
    const toastId = notification.loading("Claiming Magic Box quarterly reward...");
    try {
      const tx = await writeBox({
        address: magicBoxContract.address as `0x${string}`,
        abi: magicBoxContract.abi,
        functionName: "claimReward",
        args: [],
      });
      notification.dismiss(toastId);
      notification.txSuccess(tx);
      notification.success("🎁 Magic Box reward claimed successfully!");
      refetchBoxReward();
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.shortMessage || err?.message || "Box claim failed");
    } finally {
      setIsClaimingBox(false);
    }
  };

  const claimMilestoneReward = async () => {
    if (!rewardContract?.address) return;
    setIsClaimingMilestone(true);
    const toastId = notification.loading("Claiming instant milestone reward...");
    try {
      const tx = await writeReward({
        address: rewardContract.address as `0x${string}`,
        abi: rewardContract.abi,
        functionName: "claimReward",
        args: [],
      });
      notification.dismiss(toastId);
      notification.txSuccess(tx);
      notification.success("💎 Milestone reward claimed successfully!");
      refetchMilestonePending();
      refetchMilestoneStatus();
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.shortMessage || err?.message || "Milestone claim failed");
    } finally {
      setIsClaimingMilestone(false);
    }
  };

  const refetchAll = () => {
    refetchTier();
    refetchSalary();
    refetchMilestones();
    refetchPoolCounts();
    refetchBoxReward();
    refetchBoxTimer();
    refetchBoxCount();
    refetchMilestonePending();
    refetchMilestoneStatus();
  };

  // Parsing outputs
  const userTier = userTierRaw !== undefined ? Number(userTierRaw) : 0;
  const claimableSalary = (claimableSalaryRaw as bigint) ?? 0n;
  const userMilestones = userMilestonesRaw !== undefined ? Number(userMilestonesRaw) : 0;

  const poolCountsTuple = poolCountsRaw as [bigint, bigint, bigint, bigint] | undefined;
  const poolCounts = poolCountsTuple
    ? [Number(poolCountsTuple[0]), Number(poolCountsTuple[1]), Number(poolCountsTuple[2]), Number(poolCountsTuple[3])]
    : [0, 0, 0, 0];

  const boxPendingReward = (boxPendingRewardRaw as bigint) ?? 0n;
  const boxTimeUntilNextDraw = boxTimeUntilNextDrawRaw !== undefined ? Number(boxTimeUntilNextDrawRaw) : 0;
  const boxEligibleCount = boxEligibleCountRaw !== undefined ? Number(boxEligibleCountRaw) : 0;

  const milestonePendingReward = (rewardPendingRaw as bigint) ?? 0n;
  const statusTuple = userRewardStatusRaw as [boolean, boolean, boolean, boolean, bigint, bigint] | undefined;
  const milestoneStatus = {
    rewardedAlpha: statusTuple?.[0] ?? false,
    rewardedPrime: statusTuple?.[1] ?? false,
    rewardedElite: statusTuple?.[2] ?? false,
    rewardedCrown: statusTuple?.[3] ?? false,
    pendingReward: statusTuple?.[4] ?? 0n,
    totalClaimed: statusTuple?.[5] ?? 0n,
  };

  return {
    salary: {
      userTier,
      claimableSalary,
      userMilestones,
      poolCounts,
      claimSalary,
      isClaimingSalary,
    },
    magicBox: {
      pendingReward: boxPendingReward,
      timeUntilNextDraw: boxTimeUntilNextDraw,
      eligibleCount: boxEligibleCount,
      claimBoxReward,
      isClaimingBox,
    },
    milestone: {
      pendingReward: milestonePendingReward,
      status: milestoneStatus,
      claimMilestoneReward,
      isClaimingMilestone,
    },
    hasWelcomePass: !!hasWelcomePassRaw,
    refetchAll,
  };
}
