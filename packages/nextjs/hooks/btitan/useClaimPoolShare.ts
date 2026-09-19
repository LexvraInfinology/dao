"use client";

import { useState } from "react";
import { useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";

/**
 * useClaimPoolShare
 * Allows a DAO member to claim their accrued 35% Matrix volume pool share (DAO Plan Share Benefit).
 */
export function useClaimPoolShare(onSuccess?: () => void) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.EquoraDAO;

  const [isClaiming, setIsClaiming] = useState(false);
  const { writeContractAsync: claimPoolWrite } = useWriteContract();

  const claim = async () => {
    if (!daoContract?.address) {
      notification.error("DAO contract not deployed.");
      return;
    }

    try {
      setIsClaiming(true);
      const toastId = notification.loading("Claiming 35% Matrix Pool Dividend...");

      const tx = await claimPoolWrite({
        address: daoContract.address as `0x${string}`,
        abi: daoContract.abi,
        functionName: "claimPoolShare",
      });

      notification.dismiss(toastId);
      notification.txSuccess(tx);
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Pool dividend claim failed";
      notification.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  return { claim, isClaiming };
}
