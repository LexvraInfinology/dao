"use client";

import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useChainId,
} from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";
import { parseUnits } from "../../utils/scaffold-eth/contract";

const ENTRY_FEE = parseUnits("300", 18); // 300 BTT

/**
 * useJoinDAO
 * Handles the full flow for joining the Genesis DAO:
 * 1. Approve 300 BTT allowance
 * 2. Call joinDAO(sponsor)
 */
export function useJoinDAO() {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.BTitanDAO;
  const tokenContract = contracts?.BTitanToken;

  const [step, setStep] = useState<"idle" | "approving" | "joining" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { writeContractAsync: approveToken } = useWriteContract();
  const { writeContractAsync: joinDAOWrite } = useWriteContract();

  const join = async (sponsorAddress?: string) => {
    if (!daoContract?.address || !tokenContract?.address) {
      notification.error("Contracts not deployed. Run yarn deploy first.");
      return;
    }

    try {
      // Step 1: Approve 300 BTT
      setStep("approving");
      const approvingToast = notification.loading("Step 1/2: Approving 300 BTT...");

      const approveTx = await approveToken({
        address: tokenContract.address as `0x${string}`,
        abi: tokenContract.abi,
        functionName: "approve",
        args: [daoContract.address as `0x${string}`, ENTRY_FEE],
      });

      notification.dismiss(approvingToast);
      notification.txSent(approveTx);

      // Step 2: Join DAO
      setStep("joining");
      const joiningToast = notification.loading("Step 2/2: Joining Genesis DAO...");

      const validSponsor =
        sponsorAddress && /^0x[0-9a-fA-F]{40}$/.test(sponsorAddress)
          ? sponsorAddress
          : "0x0000000000000000000000000000000000000000";

      const joinTx = await joinDAOWrite({
        address: daoContract.address as `0x${string}`,
        abi: daoContract.abi,
        functionName: "joinDAO",
        args: [validSponsor as `0x${string}`],
      });

      notification.dismiss(joiningToast);
      notification.txSuccess(joinTx);
      setStep("success");
    } catch (err: any) {
      setStep("error");
      const msg = err?.shortMessage || err?.message || "Transaction failed";
      setErrorMessage(msg);
      notification.error(msg);
    }
  };

  const reset = () => {
    setStep("idle");
    setErrorMessage("");
  };

  return { join, step, errorMessage, reset };
}



