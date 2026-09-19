import prisma from "@btitan/database";
import { formatUnits } from "viem";

export async function handleDepositRouted(event: {
  user: string;
  totalAmount: bigint;
  daoAmount: bigint;
  salaryAmount: bigint;
  magicBoxAmount: bigint;
  rewardsAmount: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}) {
  const user = event.user.toLowerCase();
  const routedDate = new Date(Number(event.timestamp) * 1000);

  const total = parseFloat(formatUnits(event.totalAmount, 18));
  const dao = parseFloat(formatUnits(event.daoAmount, 18));
  const salary = parseFloat(formatUnits(event.salaryAmount, 18));
  const magicBox = parseFloat(formatUnits(event.magicBoxAmount, 18));
  const rewards = parseFloat(formatUnits(event.rewardsAmount, 18));

  await prisma.vaultDepositSplit.create({
    data: {
      userAddress: user,
      totalAmount: total,
      daoAmount: dao,
      salaryAmount: salary,
      magicBoxAmount: magicBox,
      rewardsAmount: rewards,
      timestamp: routedDate,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
    },
  });

  console.log(
    `[Vault] Deposit split: Total ${total} BTT (DAO: ${dao}, Salary: ${salary}, MagicBox: ${magicBox}, Rewards: ${rewards}) for ${user}`
  );
}
