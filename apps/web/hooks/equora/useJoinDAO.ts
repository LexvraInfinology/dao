"use client";

import { useState } from "react";
import { useWriteContract, useChainId, useAccount } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";
import { parseUnits } from "../../utils/scaffold-eth/contract";
import { useAllowanceCheck } from "./useAllowanceCheck";

const ENTRY_FEE = parseUnits("300", 18); // 300 BTT

/**
 * useJoinDAO
 * Handles joining Genesis DAO:
 * - Checks allowance: if already >= 300 BTT, skips approval for a 1-click Join!
 * - If not, executes approve(300) then joinDAO(sponsor).
 */
export function useJoinDAO(onSuccess?: () => void) {
  const chainId = useChainId();
  const { address } = useAccount();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.EquoraDAO;
  const tokenContract = contracts?.MockToken || contracts?.EquoraToken;

  const { hasAllowance, refetchAllowance } = useAllowanceCheck();

  const [step, setStep] = useState<"idle" | "approving" | "joining" | "retopup" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { writeContractAsync: approveToken } = useWriteContract();
  const { writeContractAsync: joinDAOWrite } = useWriteContract();
  const { writeContractAsync: retopupWrite } = useWriteContract();

  const join = async () => {
    if (!daoContract?.address || !tokenContract?.address) {
      notification.error("Contracts not deployed. Please check network connection.");
      return;
    }

    try {
      // Step 1: Check if approve is needed
      if (!hasAllowance) {
        setStep("approving");
        const approvingToast = notification.loading("Step 1/2: Approving 300 TROB...");

        const approveTx = await approveToken({
          address: tokenContract.address as `0x${string}`,
          abi: tokenContract.abi,
          functionName: "approve",
          args: [daoContract.address as `0x${string}`, ENTRY_FEE],
        });

        notification.dismiss(approvingToast);
        notification.txSent(approveTx);
        await refetchAllowance();
      }

      // Step 2: Join DAO & push payouts
      setStep("joining");
      const joiningToast = notification.loading(
        hasAllowance
          ? "Joining Genesis DAO & Pushing Instant Founder Payouts..."
          : "Step 2/2: Joining Genesis DAO..."
      );

      const joinTx = await joinDAOWrite({
        address: daoContract.address as `0x${string}`,
        abi: daoContract.abi,
        functionName: "joinDAO",
        args: [],
      });

      notification.dismiss(joiningToast);
      notification.txSuccess(joinTx);
      setStep("success");
      await refetchAllowance();
      onSuccess?.();
    } catch (err: any) {
      setStep("error");
      const msg = err?.shortMessage || err?.message || "Transaction failed";
      setErrorMessage(msg);
      notification.error(msg);
    }
  };

  const retopup = async () => {
    if (!daoContract?.address || !tokenContract?.address) {
      notification.error("Contracts not deployed. Please check network connection.");
      return;
    }

    try {
      if (!hasAllowance) {
        setStep("approving");
        const approvingToast = notification.loading("Step 1/2: Approving 300 TROB for Re-topup...");

        const approveTx = await approveToken({
          address: tokenContract.address as `0x${string}`,
          abi: tokenContract.abi,
          functionName: "approve",
          args: [daoContract.address as `0x${string}`, ENTRY_FEE],
        });

        notification.dismiss(approvingToast);
        notification.txSent(approveTx);
        await refetchAllowance();
      }

      setStep("retopup");
      const retopupToast = notification.loading("Re-topping up DAO seat (300 TROB)...");

      const retopupTx = await retopupWrite({
        address: daoContract.address as `0x${string}`,
        abi: daoContract.abi,
        functionName: "retopup",
        args: [],
      });

      notification.dismiss(retopupToast);
      notification.txSuccess(retopupTx);
      notification.success("🎉 Re-topup successful! 3X cap reset to 0.");
      setStep("success");
      await refetchAllowance();
      onSuccess?.();
    } catch (err: any) {
      setStep("error");
      const msg = err?.shortMessage || err?.message || "Re-topup failed";
      setErrorMessage(msg);
      notification.error(msg);
    }
  };

  const reset = () => {
    setStep("idle");
    setErrorMessage("");
  };

  return {
    join,
    handleJoinDAO: join,
    retopup,
    step,
    isApproving: step === "approving",
    isJoining: step === "joining",
    isRetopping: step === "retopup",
    errorMessage,
    reset,
    hasAllowance,
  };
}
