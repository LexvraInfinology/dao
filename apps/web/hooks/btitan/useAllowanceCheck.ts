"use client";

import { useAccount, useChainId, useReadContract } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { parseUnits } from "../../utils/scaffold-eth/contract";

const REQUIRED_ALLOWANCE = parseUnits("300", 18);

export function useAllowanceCheck() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.EquoraDAO;
  const tokenContract = contracts?.MockToken || contracts?.BTitanToken;

  const {
    data: allowanceData,
    isLoading: isChecking,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokenContract?.address as `0x${string}`,
    abi: tokenContract?.abi,
    functionName: "allowance",
    args: address && daoContract?.address ? [address, daoContract.address] : undefined,
    query: {
      enabled: !!address && !!daoContract?.address && !!tokenContract?.address,
    },
  });

  const currentAllowance = (allowanceData as bigint) ?? 0n;
  const hasAllowance = currentAllowance >= REQUIRED_ALLOWANCE;

  return {
    hasAllowance,
    currentAllowance,
    isChecking,
    refetchAllowance,
  };
}
