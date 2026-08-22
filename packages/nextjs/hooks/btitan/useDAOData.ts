"use client";

import { useReadContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { DAOMemberDetails, DAOStats } from "../../types/btitan";

/**
 * useDAOData
 * Reads live DAO data from BTitanDAO.
 * Maps to the exact function signatures verified in BTitanDAO.sol.
 */
export function useDAOData(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.BTitanDAO;

  const enabled = !!daoContract?.address && !!userAddress;
  const contractEnabled = !!daoContract?.address;

  // getMemberDetails(address user) → (isMember, position, availableBalance, earned, withdrawn)
  const { data: memberDetails, isLoading } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getMemberDetails",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // getDAOStats() → (memberCount, collected, distributed, completed)
  const { data: daoStats } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getDAOStats",
    query: { enabled: contractEnabled },
  });

  // getRemainingPositions() → uint256
  const { data: remaining } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "getRemainingPositions",
    query: { enabled: contractEnabled },
  });

  // previewNextDistribution() → (recipientCount, amountPerRecipient)
  const { data: preview } = useReadContract({
    address: daoContract?.address as `0x${string}`,
    abi: daoContract?.abi,
    functionName: "previewNextDistribution",
    query: { enabled: contractEnabled },
  });

  // Parse tuples — match sol return order exactly
  const md = memberDetails as [boolean, bigint, bigint, bigint, bigint] | undefined;
  const ds = daoStats as [bigint, bigint, bigint, boolean] | undefined;
  const pr = preview as [bigint, bigint] | undefined;

  const memberInfo: DAOMemberDetails = {
    isMember: md?.[0] ?? false,
    position: md ? Number(md[1]) : 0,
    availableBalance: md?.[2] ?? BigInt(0),
    totalEarned: md?.[3] ?? BigInt(0),
    totalWithdrawn: md?.[4] ?? BigInt(0),
  };

  const stats: DAOStats = {
    memberCount: ds ? Number(ds[0]) : 0,
    totalCollected: ds?.[1] ?? BigInt(0),
    totalDistributed: ds?.[2] ?? BigInt(0),
    isCompleted: ds?.[3] ?? false,
  };

  return {
    memberInfo,
    stats,
    remainingPositions: remaining ? Number(remaining) : 50,
    previewDistribution: {
      recipientCount: pr ? Number(pr[0]) : 0,
      amountPerRecipient: pr?.[1] ?? BigInt(0),
    },
    isLoading,
    contractAddress: daoContract?.address,
    abi: daoContract?.abi,
  };
}



