"use client";

import { useReadContract, useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { UserNFTs, UserVestingData, VestingLock, BTitanRank } from "../../types/btitan";
import { notification } from "../../utils/scaffold-eth/notification";

/**
 * useRewardsData
 * Reads NFT holdings + vesting locks from BTitanNFT + BTitanVestingVault.
 * Maps to exact verified function signatures.
 *
 * NFT Functions:
 *   hasWelcomePass(address) → bool
 *   getWelcomePassTokenId(address) → uint256
 *   getUserRank(address) → IBTitanNFT.Rank (enum 0-4)
 *   getUserTokens(address) → uint256[]
 *
 * Vault Functions:
 *   getUserLocks(address) → VestingLock[] (struct array)
 *   getClaimableAmount(address) → uint256
 *   getTotalLockedAmount(address) → uint256
 *   getEquityBps(address) → uint256
 *   claimUnlockedTokens(uint256 lockIndex) — write
 */
export function useRewardsData(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const nftContract = contracts?.BTitanNFT;
  const vaultContract = contracts?.BTitanVestingVault;

  const nftEnabled   = !!nftContract?.address   && !!userAddress;
  const vaultEnabled = !!vaultContract?.address  && !!userAddress;

  // ─── NFT Reads ──────────────────────────────────────────────────────────────
  const { data: hasWelcomePass } = useReadContract({
    address: nftContract?.address as `0x${string}`,
    abi: nftContract?.abi,
    functionName: "hasWelcomePass",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: nftEnabled },
  });

  const { data: welcomePassId } = useReadContract({
    address: nftContract?.address as `0x${string}`,
    abi: nftContract?.abi,
    functionName: "getWelcomePassTokenId",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: nftEnabled },
  });

  const { data: userRankRaw } = useReadContract({
    address: nftContract?.address as `0x${string}`,
    abi: nftContract?.abi,
    functionName: "getUserRank",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: nftEnabled },
  });

  const { data: userTokenIds } = useReadContract({
    address: nftContract?.address as `0x${string}`,
    abi: nftContract?.abi,
    functionName: "getUserTokens",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: nftEnabled },
  });

  // ─── Vault Reads ────────────────────────────────────────────────────────────
  const { data: userLocks, isLoading: loadingLocks } = useReadContract({
    address: vaultContract?.address as `0x${string}`,
    abi: vaultContract?.abi,
    functionName: "getUserLocks",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: vaultEnabled },
  });

  const { data: claimableAmount } = useReadContract({
    address: vaultContract?.address as `0x${string}`,
    abi: vaultContract?.abi,
    functionName: "getClaimableAmount",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: vaultEnabled },
  });

  const { data: totalLocked } = useReadContract({
    address: vaultContract?.address as `0x${string}`,
    abi: vaultContract?.abi,
    functionName: "getTotalLockedAmount",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: vaultEnabled },
  });

  const { data: equityBps } = useReadContract({
    address: vaultContract?.address as `0x${string}`,
    abi: vaultContract?.abi,
    functionName: "getEquityBps",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: vaultEnabled },
  });

  // ─── Vault Write ────────────────────────────────────────────────────────────
  const { writeContractAsync: claimWrite } = useWriteContract();

  const claimVestingLock = async (lockIndex: number) => {
    if (!vaultContract?.address) {
      notification.error("VestingVault contract not found");
      return;
    }
    const toastId = notification.loading("Claiming vested BTT...");
    try {
      const tx = await claimWrite({
        address: vaultContract.address as `0x${string}`,
        abi: vaultContract.abi,
        functionName: "claimUnlockedTokens",
        args: [BigInt(lockIndex)],
      });
      notification.dismiss(toastId);
      notification.txSuccess(tx);
      notification.success("🎁 BTT claimed from vesting vault!");
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.shortMessage || err?.message || "Claim failed");
    }
  };

  // ─── Parsed Data ────────────────────────────────────────────────────────────
  const nfts: UserNFTs = {
    hasWelcomePass: !!hasWelcomePass,
    welcomePassTokenId: welcomePassId ? Number(welcomePassId) : 0,
    rank: (userRankRaw !== undefined ? Number(userRankRaw) : BTitanRank.NONE) as BTitanRank,
    allTokenIds: ((userTokenIds as bigint[]) ?? []).map(Number),
  };

  const rawLocks = (userLocks as any[]) ?? [];
  const vestingData: UserVestingData = {
    locks: rawLocks.map((l, i) => ({
      beneficiary: l.beneficiary ?? l[0] ?? "",
      amount: l.amount ?? l[1] ?? BigInt(0),
      unlockTimestamp: l.unlockTimestamp ?? l[2] ?? BigInt(0),
      claimed: l.claimed ?? l[3] ?? false,
      milestoneSlot: Number(l.milestoneSlot ?? l[4] ?? 0),
    })) as VestingLock[],
    totalLocked: (totalLocked as bigint) ?? BigInt(0),
    claimableAmount: (claimableAmount as bigint) ?? BigInt(0),
    equityBps: equityBps ? Number(equityBps) : 0,
  };

  return {
    nfts,
    vestingData,
    claimVestingLock,
    isLoading: loadingLocks,
  };
}



