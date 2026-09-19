"use client";

import { useState } from "react";
import { useWriteContract, useChainId } from "wagmi";
import deployedContracts from "../../contracts/deployedContracts";
import { notification } from "../../utils/scaffold-eth/notification";

/**
 * useWithdraw
 * Handles withdrawals from both BTitanDAO and BTitanMatrix.
 *
 * DAO withdrawal flow (post D-01 pull-based fix):
 *   Option A (2 TXs): claimDAODistribution() → withdrawFromDAO(amount)
 *   Option B (1 TX):  claimAndWithdrawDAO(amount) ← recommended
 */
export function useWithdraw() {
  const chainId = useChainId();
  const contracts = (deployedContracts as any)[chainId];
  const daoContract = contracts?.EquoraDAO;
  const matrixContract = contracts?.BTitanMatrix;

  const [withdrawing, setWithdrawing] = useState<"dao" | "matrix" | null>(null);

  const { writeContractAsync: daoWithdrawWrite } = useWriteContract();
  const { writeContractAsync: matrixWithdrawWrite } = useWriteContract();

  /**
   * Withdraw uncollected fallback DAO earnings (0 fee).
   */
  const withdrawFromDAO = async (_amount?: bigint) => {
    if (!daoContract?.address) {
      notification.error("DAO contract not deployed.");
      return;
    }
    setWithdrawing("dao");
    const toastId = notification.loading("Claiming DAO fallback balance...");
    try {
      const tx = await daoWithdrawWrite({
        address: daoContract.address as `0x${string}`,
        abi: daoContract.abi,
        functionName: "claimFallback",
        args: [],
      });
      notification.dismiss(toastId);
      notification.txSuccess(tx);
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.shortMessage || "DAO claim failed");
    } finally {
      setWithdrawing(null);
    }
  };

  const claimDAODistribution = async () => {
    return withdrawFromDAO();
  };

  const claimAndWithdrawDAO = async (_amount?: bigint) => {
    return withdrawFromDAO();
  };

  /**
   * Withdraw from Matrix earnings
   * @param amount - BigInt amount in 18-decimal BTT
   */
  const withdrawFromMatrix = async (amount: bigint) => {
    if (!matrixContract?.address) {
      notification.error("Matrix contract not deployed.");
      return;
    }
    setWithdrawing("matrix");
    const toastId = notification.loading("Withdrawing from Matrix...");
    try {
      const tx = await matrixWithdrawWrite({
        address: matrixContract.address as `0x${string}`,
        abi: matrixContract.abi,
        functionName: "withdraw",
        args: [amount],
      });
      notification.dismiss(toastId);
      notification.txSuccess(tx);
    } catch (err: any) {
      notification.dismiss(toastId);
      notification.error(err?.shortMessage || "Matrix withdrawal failed");
    } finally {
      setWithdrawing(null);
    }
  };

  return {
    withdrawFromDAO,
    claimDAODistribution,
    claimAndWithdrawDAO,
    withdrawFromMatrix,
    withdrawing,
  };
}
