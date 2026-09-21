"use client";

import { useAccount, useChainId, useReadContract } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { DAOMemberDetails, DAOStats } from "../../types/equora";

export function useDAOData(userAddress?: string) {
  const { address: connectedAddress } = useAccount();
  const address = (userAddress || connectedAddress) as `0x${string}` | undefined;
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.EquoraDAO;

  // 1. Read Member Details
  const {
    data: memberDetailsData,
    isLoading: isMemberLoading,
    refetch: refetchMember,
  } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getMemberDetails",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!daoContract?.address,
      refetchInterval: 5000,
    },
  });

  // 2. Read DAO Stats
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getDAOStats",
    query: {
      enabled: !!daoContract?.address,
      refetchInterval: 5000,
    },
  });

  // 3. Read Remaining Positions
  const {
    data: remainingPositionsData,
    isLoading: isRemainingLoading,
    refetch: refetchRemaining,
  } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getRemainingPositions",
    query: {
      enabled: !!daoContract?.address,
      refetchInterval: 5000,
    },
  });

  // 4. Read cap progress for current user
  const {
    data: capProgressData,
    refetch: refetchCap,
  } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getCapProgress",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!daoContract?.address,
      refetchInterval: 5000,
    },
  });

  // 5. Retopup time remaining
  const {
    data: retopupTimeData,
    refetch: refetchRetopup,
  } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "retopupTimeRemaining",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!daoContract?.address,
      refetchInterval: 3000,
    },
  });

  // 5. Read All Member Addresses
  const {
    data: allMembersData,
    refetch: refetchAllMembers,
  } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getAllMembers",
    query: {
      enabled: !!daoContract?.address,
      refetchInterval: 10000,
    },
  });

  // Parse member details
  let memberDetails: DAOMemberDetails = {
    isMember: false,
    position: 0,
    availableBalance: 0n,
    withdrawableBalance: 0n,
    totalEarned: 0n,
    totalWithdrawn: 0n,
    pendingDistribution: 0n,
    totalClaimable: 0n,
    nftTokenId: 0,
  };

  if (memberDetailsData) {
    const [isMember, position, nftTokenId, fallbackClaimable, totalEarned, isCapped, retopupDeadline, isBlank, poolClaimable] =
      memberDetailsData as [boolean, bigint, bigint, bigint, bigint, boolean, bigint, boolean, bigint];

    memberDetails = {
      isMember,
      position: Number(position),
      nftTokenId: Number(nftTokenId),
      availableBalance: 0n,
      withdrawableBalance: 0n,
      totalEarned,
      totalWithdrawn: 0n,
      pendingDistribution: 0n,
      totalClaimable: fallbackClaimable,
      isCapped,
      retopupDeadline: Number(retopupDeadline),
      isBlank,
      poolShareClaimable: poolClaimable ?? 0n,
    };
  }

  // Parse DAO Stats
  let stats: DAOStats = {
    memberCount: 0,
    maxPositions: 100,
    totalCollected: 0n,
    totalDistributed: 0n,
    isCompleted: false,
    totalPoolReceived: 0n,
    totalPoolDistributed: 0n,
  };

  if (statsData) {
    const [memberCount, totalCollected, totalDistributed, isCompleted] =
      statsData as [bigint, bigint, bigint, boolean, boolean, bigint, bigint, bigint, bigint, bigint];

    stats = {
      memberCount: Number(memberCount),
      maxPositions: 100,
      totalCollected,
      totalDistributed,
      isCompleted: isCompleted as boolean,
      totalPoolReceived: (statsData as any)?.[8] ?? 0n,
      totalPoolDistributed: (statsData as any)?.[9] ?? 0n,
    };
  }

  const remainingPositions = remainingPositionsData !== undefined ? Number(remainingPositionsData) : 100;

  const [capEarned, capMax] = (capProgressData as [bigint, bigint, bigint]) || [0n, 1500n * 10n**18n, 0n];
  const retopupSecondsLeft = retopupTimeData ? Number(retopupTimeData) : 0;

  const refetch = () => {
    refetchMember();
    refetchStats();
    refetchRemaining();
    refetchCap();
    refetchRetopup();
    refetchAllMembers();
  };

  return {
    memberDetails,
    memberInfo: memberDetails, // alias for backwards-compatibility
    stats,
    totalMembers: stats.memberCount,
    isFull: stats.isCompleted || remainingPositions === 0,
    totalPool: stats.totalCollected,
    totalPoolReceived: stats.totalPoolReceived ?? 0n,
    totalPoolDistributed: stats.totalPoolDistributed ?? 0n,
    remainingPositions,
    // 3X Cap state
    capEarned,
    capMax,
    capProgressPct: capMax > 0n ? Number((capEarned * 100n) / capMax) : 0,
    retopupSecondsLeft,
    isCapped: memberDetails.isCapped ?? false,
    isBlank: memberDetails.isBlank ?? false,
    totalClaimable: memberDetails.totalClaimable || 0n,
    poolShareClaimable: memberDetails.poolShareClaimable || 0n,
    allMembers: (allMembersData as string[]) || [],
    isLoading: isMemberLoading || isStatsLoading || isRemainingLoading,
    handleClaimYield: async () => {},
    isClaimingYield: false,
    refetch,
  };
}
