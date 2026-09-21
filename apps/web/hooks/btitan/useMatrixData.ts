"use client";

import { useReadContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { SlotData, SLOT_COSTS } from "../../types/btitan";

/**
 * useMatrixData
 * Reads live matrix data from BTitanMatrix.
 * Uses exact verified function signatures:
 *   - getUserFinancials(address) → (availableBalance, lifetimeEarned, withdrawn, highestSlotUnlocked)
 *   - getAllSlotsStatus(address) → (bool[12] unlocked, uint256[12] cycles, uint256[12] filled)
 *   - getGlobalStats() → (members, recycles, volume, royalPool)
 */
export function useMatrixData(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const matrixContract = contracts?.BTitanMatrix;

  const enabled = !!matrixContract?.address && !!userAddress;
  const contractEnabled = !!matrixContract?.address;

  const { data: financialsRaw, isLoading: loadingFin, refetch: refetchFinancials } = useReadContract({
    address: matrixContract?.address as `0x${string}`,
    abi: matrixContract?.abi,
    functionName: "getUserFinancials",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled, refetchInterval: 3000 },
  });

  const { data: slotsStatusRaw, isLoading: loadingSlots, refetch: refetchSlots } = useReadContract({
    address: matrixContract?.address as `0x${string}`,
    abi: matrixContract?.abi,
    functionName: "getAllSlotsStatus",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled, refetchInterval: 3000 },
  });

  const { data: statsRaw, refetch: refetchStats } = useReadContract({
    address: matrixContract?.address as `0x${string}`,
    abi: matrixContract?.abi,
    functionName: "getGlobalStats",
    query: { enabled: contractEnabled, refetchInterval: 5000 },
  });

  const fin = financialsRaw as [bigint, bigint, bigint, bigint] | undefined;
  const stats = statsRaw as [bigint, bigint, bigint, bigint] | undefined;
  const ss = slotsStatusRaw as [boolean[], bigint[], bigint[]] | undefined;

  const slots: SlotData[] = Array.from({ length: 12 }, (_, i) => ({
    slotNumber: i + 1,
    isUnlocked: ss?.[0]?.[i] ?? false,
    currentCycle: ss ? Number(ss[1][i]) : 0,
    filledNodes: ss ? Number(ss[2][i]) : 0,
    nodes: [],
    upgradeReserve: BigInt(0),
    totalEarned: BigInt(0),
    cost: SLOT_COSTS[i + 1],
  }));

  const refetch = () => {
    refetchFinancials();
    refetchSlots();
    refetchStats();
  };

  return {
    slots,
    financials: {
      availableBalance: fin?.[0] ?? BigInt(0),
      lifetimeEarned: fin?.[1] ?? BigInt(0),
      withdrawn: fin?.[2] ?? BigInt(0),
      highestSlot: fin ? Number(fin[3]) : 0,
    },
    globalStats: {
      totalMembers: stats?.[0] ?? BigInt(0),
      totalRecycles: stats?.[1] ?? BigInt(0),
      totalVolume: stats?.[2] ?? BigInt(0),
      poolForwarded: stats?.[3] ?? BigInt(0),
    },
    isLoading: loadingFin || loadingSlots,
    contractAddress: matrixContract?.address,
    abi: matrixContract?.abi,
    refetch,
  };
}

/**
 * useSlotNodes
 * Lazily loads full node data for a single slot via getSlotData(user, slot).
 * slotNumber passed as bigint to match the uint256 ABI param.
 */
export function useSlotNodes(userAddress?: `0x${string}`, slotNumber?: number) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const matrixContract = contracts?.BTitanMatrix;

  const { data, isLoading, refetch: refetchSlot } = useReadContract({
    address: matrixContract?.address as `0x${string}`,
    abi: matrixContract?.abi,
    functionName: "getSlotData",
    // Convert slotNumber to bigint to match uint256 ABI param
    args: userAddress && slotNumber ? [userAddress, BigInt(slotNumber)] : undefined,
    query: { enabled: !!matrixContract?.address && !!userAddress && !!slotNumber },
  });

  const { data: snapshotCountRaw, refetch: refetchSnapshotCount } = useReadContract({
    address: matrixContract?.address as `0x${string}`,
    abi: matrixContract?.abi,
    functionName: "getCycleSnapshotCount",
    args: userAddress && slotNumber ? [userAddress, BigInt(slotNumber)] : undefined,
    query: { enabled: !!matrixContract?.address && !!userAddress && !!slotNumber },
  });

  const raw = data as [boolean, bigint, bigint, string[], bigint, bigint] | undefined;

  return {
    isUnlocked: raw?.[0] ?? false,
    currentCycle: raw ? Number(raw[1]) : 0,
    filledNodes: raw ? Number(raw[2]) : 0,
    nodes: (raw?.[3] ?? []) as string[],
    upgradeReserve: raw?.[4] ?? BigInt(0),
    slotEarned: raw?.[5] ?? BigInt(0),
    cycleSnapshotsCount: snapshotCountRaw !== undefined ? Number(snapshotCountRaw) : 0,
    refetch: () => {
      refetchSlot();
      refetchSnapshotCount();
    },
    isLoading,
  };
}

