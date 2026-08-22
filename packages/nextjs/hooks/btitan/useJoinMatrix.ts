"use client";

import { useState } from "react";
import { useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";
import { SLOT_COSTS } from "../../types/btitan";

/**
 * useJoinMatrix
 * Handles the approve + joinSlot two-step flow for buying a matrix slot.
 */
export function useJoinMatrix() {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const matrixContract = contracts?.BTitanMatrix;
  const tokenContract = contracts?.BTitanToken;

  const [step, setStep] = useState<"idle" | "approving" | "joining" | "success" | "error">("idle");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const { writeContractAsync: approveToken } = useWriteContract();
  const { writeContractAsync: joinSlotWrite } = useWriteContract();

  const joinSlot = async (slotNumber: number, sponsorAddress?: string) => {
    if (!matrixContract?.address || !tokenContract?.address) {
      notification.error("Contracts not deployed. Run yarn deploy first.");
      return;
    }

    const cost = SLOT_COSTS[slotNumber];
    if (!cost) {
      notification.error(`Invalid slot: ${slotNumber}`);
      return;
    }

    setActiveSlot(slotNumber);

    try {
      // Step 1: Approve slot cost
      setStep("approving");
      const approveToast = notification.loading(`Approving Slot ${slotNumber} cost...`);

      await approveToken({
        address: tokenContract.address as `0x${string}`,
        abi: tokenContract.abi,
        functionName: "approve",
        args: [matrixContract.address as `0x${string}`, cost],
      });

      notification.dismiss(approveToast);

      // Step 2: Join slot
      setStep("joining");
      const joinToast = notification.loading(`Unlocking Slot ${slotNumber}...`);

      const validSponsor =
        sponsorAddress && /^0x[0-9a-fA-F]{40}$/.test(sponsorAddress)
          ? sponsorAddress
          : "0x0000000000000000000000000000000000000000";

      const tx = await joinSlotWrite({
        address: matrixContract.address as `0x${string}`,
        abi: matrixContract.abi,
        functionName: "joinSlot",
        args: [slotNumber, validSponsor as `0x${string}`],
      });

      notification.dismiss(joinToast);
      notification.txSuccess(tx);
      notification.success(`🎉 Slot ${slotNumber} unlocked!`);
      setStep("success");
    } catch (err: any) {
      setStep("error");
      notification.error(err?.shortMessage || err?.message || "Transaction failed");
    }
  };

  const reset = () => {
    setStep("idle");
    setActiveSlot(null);
  };

  return { joinSlot, step, activeSlot, reset };
}



