"use client";

import { useState } from "react";
import { useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";
import { SLOT_COSTS } from "../../types/equora";

/**
 * useJoinMatrix
 * Handles the approve + joinSlot two-step flow for buying a matrix slot.
 */
export function useJoinMatrix(
  defaultSlot?: number,
  defaultSponsor?: string,
  onSuccess?: () => void
) {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const matrixContract = contracts?.EquoraMatrix;
  const tokenContract = contracts?.MockToken || contracts?.EquoraToken;

  const [step, setStep] = useState<"idle" | "approving" | "joining" | "success" | "error">("idle");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const { writeContractAsync: approveToken } = useWriteContract();
  const { writeContractAsync: joinSlotWrite } = useWriteContract();

  const joinSlot = async (slotNumber?: number, sponsorAddress?: string) => {
    const slotToJoin = slotNumber || defaultSlot || 1;
    const sponsor = sponsorAddress || defaultSponsor;

    if (!matrixContract?.address || !tokenContract?.address) {
      notification.error("Contracts not deployed. Run yarn deploy first.");
      return;
    }

    const cost = SLOT_COSTS[slotToJoin];
    if (!cost) {
      notification.error(`Invalid slot: ${slotToJoin}`);
      return;
    }

    setActiveSlot(slotToJoin);

    try {
      // Step 1: Approve slot cost
      setStep("approving");
      const approveToast = notification.loading(`Approving Slot ${slotToJoin} cost...`);

      await approveToken({
        address: tokenContract.address as `0x${string}`,
        abi: tokenContract.abi,
        functionName: "approve",
        args: [matrixContract.address as `0x${string}`, cost],
      });

      notification.dismiss(approveToast);

      // Step 2: Join slot
      setStep("joining");
      const joinToast = notification.loading(`Unlocking Slot ${slotToJoin}...`);

      const validSponsor =
        sponsor && /^0x[0-9a-fA-F]{40}$/.test(sponsor)
          ? sponsor
          : "0x0000000000000000000000000000000000000000";

      const tx = await joinSlotWrite({
        address: matrixContract.address as `0x${string}`,
        abi: matrixContract.abi,
        functionName: "joinSlot",
        args: [slotToJoin, validSponsor as `0x${string}`],
      });

      notification.dismiss(joinToast);
      notification.txSuccess(tx);
      notification.success(`🎉 Slot ${slotToJoin} unlocked!`);
      setStep("success");
      onSuccess?.();
    } catch (err: any) {
      setStep("error");
      notification.error(err?.shortMessage || err?.message || "Transaction failed");
    }
  };

  const handleJoinSlot = async (slotOverride?: number, sponsorOverride?: string) => {
    await joinSlot(slotOverride, sponsorOverride);
  };

  const reset = () => {
    setStep("idle");
    setActiveSlot(null);
  };

  return {
    joinSlot,
    handleJoinSlot,
    step,
    isApproving: step === "approving",
    isJoining: step === "joining",
    activeSlot,
    reset,
  };
}



