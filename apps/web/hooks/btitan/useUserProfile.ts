"use client";

import { useReadContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { UserProfile } from "../../types/btitan";

/**
 * useUserProfile
 * Reads user registration data from EquoraRegistry.
 * Maps to exact function signatures in EquoraRegistry.sol.
 */
export function useUserProfile(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const registry = contracts?.EquoraRegistry;

  const enabled = !!registry?.address && !!userAddress;

  // isRegistered(address user) → bool
  const { data: isRegistered } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "isRegistered",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // getSponsor(address user) → address
  const { data: sponsor } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "getSponsor",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // getDirectReferralsCount(address user) → uint256
  const { data: refCount } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "getDirectReferralsCount",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // isQualified(address user) → bool
  const { data: isQualified } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "isQualified",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // getUserId(address user) → uint256
  const { data: userId } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "getUserId",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // getDirectReferrals(address user) → address[]
  const { data: directReferrals } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "getDirectReferrals",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // userToCode(address user) → uint32 (5-digit referral code 10000-99999)
  const { data: referralCode } = useReadContract({
    address: registry?.address as `0x${string}`,
    abi: registry?.abi,
    functionName: "userToCode",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const parsedUserId = userId ? Number(userId) : 0;
  const parsedCode = referralCode ? Number(referralCode) : (parsedUserId > 0 ? parsedUserId + 9999 : 10000);

  const profile: UserProfile = {
    address: userAddress ?? "",
    isRegistered: !!isRegistered,
    sponsor: (sponsor as string) ?? "0x0000000000000000000000000000000000000000",
    directReferrals: (directReferrals as string[]) ?? [],
    directReferralCount: refCount ? Number(refCount) : 0,
    isQualified: !!isQualified,
    userId: parsedUserId,
    referralCode: parsedCode,
  };

  return {
    profile,
    contractAddress: registry?.address,
  };
}



