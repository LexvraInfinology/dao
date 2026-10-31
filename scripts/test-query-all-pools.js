const { ethers } = require("ethers");

const RPC_URL = "https://fullnode-one-testnet.trobchain.com";
const coder = new ethers.AbiCoder();

const CONTRACTS = {
  vault: "TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX",
  salaryPool: "TQG1KagMZRXYPbvgvpLVES68Ht4eazZKo7",
  rewardPool: "TBufkRiqngeRwJpWQkaySUm2dioqxLCuDf",
  magicBox: "TPo6c2gjhX6DWPQcCf4TUF3NnzxAmCC8cb",
  matrix: "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY",
  token: "TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit",
};

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decode58(string) {
  const bytes = [0];
  for (let i = 0; i < string.length; i++) {
    const c = string[i];
    const value = B58_ALPHABET.indexOf(c);
    if (value === -1) return null;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += value;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < string.length && string[i] === "1"; i++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

function toHexAddress(input) {
  if (!input) return "0x0000000000000000000000000000000000000000";
  const str = input.trim();
  if (str.startsWith("0x")) return str.toLowerCase();
  if (str.startsWith("41") && str.length === 42) return `0x${str.slice(2)}`.toLowerCase();
  if (str.startsWith("T") && str.length === 34) {
    const decoded = decode58(str);
    if (decoded && decoded.length >= 21) {
      return (
        "0x" +
        Array.from(decoded.slice(1, 21))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toLowerCase()
      );
    }
  }
  return str.toLowerCase();
}

function toTronHex(input) {
  const hex = toHexAddress(input);
  return "41" + hex.slice(2);
}

async function queryConstant(contractAddress, functionSelector, parameterHex = "") {
  const contractHex = toTronHex(contractAddress);
  const payload = {
    owner_address: contractHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    visible: false,
  };
  const res = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.result && data.result.result && data.constant_result?.length > 0) {
    return data.constant_result[0];
  }
  return null;
}

async function main() {
  console.log("=================================================");
  console.log("🔍 QUERYING LIVE ON-CHAIN PROTOCOL POOL STATUS");
  console.log("=================================================");

  // 1. Vault
  const vMatrixHex = await queryConstant(CONTRACTS.vault, "totalRoutedFromMatrix()");
  const vUsersHex = await queryConstant(CONTRACTS.vault, "totalRoutedFromUsers()");
  const vMatrixRouted = vMatrixHex ? coder.decode(["uint256"], "0x" + vMatrixHex)[0] : 0n;
  const vUsersRouted = vUsersHex ? coder.decode(["uint256"], "0x" + vUsersHex)[0] : 0n;
  console.log(`Vault totalRoutedFromMatrix: ${ethers.formatUnits(vMatrixRouted, 6)} TROB`);
  console.log(`Vault totalRoutedFromUsers:  ${ethers.formatUnits(vUsersRouted, 6)} TROB`);

  // 2. Salary Pool
  const sStatsHex = await queryConstant(CONTRACTS.salaryPool, "getPoolStats()");
  if (sStatsHex) {
    const [pending, totalDist, settlements, lastSettlement] = coder.decode(
      ["uint256", "uint256", "uint256", "uint256"],
      "0x" + sStatsHex
    );
    console.log(`\nSalary Pool:`);
    console.log(`  Pending Balance:   ${ethers.formatUnits(pending, 6)} TROB`);
    console.log(`  Total Distributed: ${ethers.formatUnits(totalDist, 6)} TROB`);
    console.log(`  Settlements:       ${settlements.toString()}`);
    console.log(`  Last Settlement:   ${lastSettlement.toString()}`);
  }

  const sCountsHex = await queryConstant(CONTRACTS.salaryPool, "getPoolCounts()");
  if (sCountsHex) {
    const [alpha, prime, elite, crown] = coder.decode(
      ["uint256", "uint256", "uint256", "uint256"],
      "0x" + sCountsHex
    );
    console.log(`  Members: Alpha: ${alpha}, Prime: ${prime}, Elite: ${elite}, Crown: ${crown}`);
  }

  // 3. Reward Pool
  const rStatsHex = await queryConstant(CONTRACTS.rewardPool, "getPoolStats()");
  if (rStatsHex) {
    const [balance, totalDist] = coder.decode(["uint256", "uint256"], "0x" + rStatsHex);
    console.log(`\nReward Pool:`);
    console.log(`  Balance:           ${ethers.formatUnits(balance, 6)} TROB`);
    console.log(`  Total Distributed: ${ethers.formatUnits(totalDist, 6)} TROB`);
  }

  // 4. Magic Box Pool
  const mStatsHex = await queryConstant(CONTRACTS.magicBox, "getGlobalStats()");
  if (mStatsHex) {
    const [balance, totalDist, rounds, users, lastDist] = coder.decode(
      ["uint256", "uint256", "uint256", "uint256", "uint256"],
      "0x" + mStatsHex
    );
    console.log(`\nMagic Box Pool:`);
    console.log(`  Balance:           ${ethers.formatUnits(balance, 6)} TROB`);
    console.log(`  Total Distributed: ${ethers.formatUnits(totalDist, 6)} TROB`);
    console.log(`  Rounds:            ${rounds.toString()}`);
    console.log(`  Eligible Users:    ${users.toString()}`);
  }

  const mDrawHex = await queryConstant(CONTRACTS.magicBox, "getTimeUntilNextDraw()");
  if (mDrawHex) {
    const timeUntil = coder.decode(["uint256"], "0x" + mDrawHex)[0];
    console.log(`  Time Until Next Draw: ${timeUntil.toString()} seconds`);
  }

  // 5. Query user rewards for Seat 1
  const seat1Hex = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02";
  const seat1Param = coder.encode(["address"], [seat1Hex]).slice(2);
  const sClaimable = await queryConstant(CONTRACTS.salaryPool, "getClaimable(address)", seat1Param);
  const rClaimable = await queryConstant(CONTRACTS.rewardPool, "getPendingReward(address)", seat1Param);
  const mClaimable = await queryConstant(CONTRACTS.magicBox, "getPendingReward(address)", seat1Param);

  console.log(`\nSeat 1 User Claimable Rewards:`);
  console.log(`  Salary Claimable:   ${sClaimable ? ethers.formatUnits(coder.decode(["uint256"], "0x" + sClaimable)[0], 6) : 0} TROB`);
  console.log(`  Reward Claimable:   ${rClaimable ? ethers.formatUnits(coder.decode(["uint256"], "0x" + rClaimable)[0], 6) : 0} TROB`);
  console.log(`  Magic Box Claimable: ${mClaimable ? ethers.formatUnits(coder.decode(["uint256"], "0x" + mClaimable)[0], 6) : 0} TROB`);
}

main().catch(console.error);
