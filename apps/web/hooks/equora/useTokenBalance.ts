"use client";

import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatEther } from "viem";
import deployedContracts from "../../contracts/deployedContracts";

export function useTokenBalance(targetAddress?: string) {
  const { address: connectedAddress } = useAccount();
  const address = targetAddress || connectedAddress;
  const chainId = useChainId();
  const contracts = (deployedContracts as any)?.[chainId];
  const tokenContract = contracts?.MockToken || contracts?.EquoraToken;

  const { data: balance, refetch } = useReadContract({
    address: tokenContract?.address as `0x${string}`,
    abi: tokenContract?.abi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!tokenContract?.address,
      refetchInterval: 10000,
    },
  });

  const rawBalance = (balance as bigint) ?? 0n;
  const formatted = formatEther(rawBalance);
  const formattedRounded = Number(formatted).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return {
    balance: rawBalance,
    formatted,
    formattedRounded,
    symbol: "mEQR",
    tokenAddress: tokenContract?.address,
    refetch,
  };
}
