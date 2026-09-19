"use client";

import { useState } from "react";
import { useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";

/**
 * useClaimFallback
 * Allows a DAO member whose direct push failed to claim their uncollected earnings with 0 fee.
 */
export function useClaimFallback() {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.EquoraDAO;

  const [isClaiming, setIsClaiming] = useState(false);
  const { writeContractAsync: claimFallbackWrite } = useWriteContract();

  const claim = async () => {
    if (!daoContract?.address) {
      notification.error("DAO contract not deployed.");
      return;
    }

    try {
      setIsClaiming(true);
      const toastId = notification.loading("Claiming uncollected fallback balance...");

      const tx = await claimFallbackWrite({
        address: daoContract.address as `0x${string}`,
        abi: daoContract.abi,
        functionName: "claimFallback",
      });

      notification.dismiss(toastId);
      notification.txSuccess(tx);
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Fallback claim failed";
      notification.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  return { claim, isClaiming };
}
