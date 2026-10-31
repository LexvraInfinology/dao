const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const RPC_URL = "https://fullnode-one-testnet.trobchain.com";
const coder = new ethers.AbiCoder();

const CONTRACTS = {
  matrix: "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY",
  vault: "TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX",
  salaryPool: "TQG1KagMZRXYPbvgvpLVES68Ht4eazZKo7",
  rewardPool: "TBufkRiqngeRwJpWQkaySUm2dioqxLCuDf",
  magicBoxPool: "TPo6c2gjhX6DWPQcCf4TUF3NnzxAmCC8cb",
  dao: "TPw1MNKr2QcU3CizievsskdSRtuY18Zvvr",
  registry: "TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN",
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
  throw new Error(`Call ${functionSelector} failed: ${JSON.stringify(data)}`);
}

async function getAccountBalance(tronHex) {
  const res = await fetch(`${RPC_URL}/wallet/getaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: tronHex }),
  });
  const data = await res.json();
  return (data.balance || 0) / 1e6;
}

async function main() {
  console.log("================================================================");
  console.log("🔍 LIVE ON-CHAIN STATUS & PROTOCOL POOLS AUDIT (TROBCHAIN TESTNET)");
  console.log("================================================================\n");

  const seat1Evm = "0x67b282b09c3aac1b9fbff6b4ec14ea2b72573c02";
  const seat1Hex = toHexAddress(seat1Evm);
  const seat1Param = coder.encode(["address"], [seat1Hex]).slice(2);

  // 1. Check Matrix Open
  try {
    const openRaw = await queryConstant(CONTRACTS.matrix, "isMatrixOpen()");
    const isOpen = Boolean(coder.decode(["bool"], "0x" + openRaw)[0]);
    console.log(`1. EquoraMatrix isMatrixOpen(): ${isOpen}`);
  } catch (err) {
    console.log(`1. EquoraMatrix isMatrixOpen() error:`, err.message);
  }

  // 2. Check Seat 1 Slot 1
  try {
    const s1Param = coder.encode(["address", "uint256"], [seat1Hex, 1]).slice(2);
    const s1Raw = await queryConstant(CONTRACTS.matrix, "getSlotData(address,uint256)", s1Param);
    const [isUnlocked, currentCycle, filledNodes, nodes, slotEarned] = coder.decode(
      ["bool", "uint256", "uint256", "address[14]", "uint256"],
      "0x" + s1Raw
    );
    console.log(`2. Seat 1 Slot 1 Status:`, {
      isUnlocked,
      currentCycle: currentCycle.toString(),
      filledNodes: filledNodes.toString(),
      slotEarnedTrob: (Number(slotEarned) / 1e6).toFixed(4),
      activeOccupants: nodes.filter(n => n !== "0x0000000000000000000000000000000000000000").length
    });
  } catch (err) {
    console.log(`2. Seat 1 Slot 1 error:`, err.message);
  }

  // 3. Check Seat 1 Financials
  try {
    const finRaw = await queryConstant(CONTRACTS.matrix, "getUserFinancials(address)", seat1Param);
    const fin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finRaw);
    console.log(`3. Seat 1 Financials:`, {
      availableBalanceTrob: (Number(fin[0]) / 1e6).toFixed(4),
      totalEarnedTrob: (Number(fin[1]) / 1e6).toFixed(4),
      withdrawnTotalTrob: (Number(fin[2]) / 1e6).toFixed(4),
      highestUnlockedSlot: fin[3].toString()
    });
  } catch (err) {
    console.log(`3. Seat 1 Financials error:`, err.message);
  }

  // 4. Check Seat 1 Direct Referrals & Qualification
  try {
    const directsRaw = await queryConstant(CONTRACTS.matrix, "getActiveDirectReferralsCount(address)", seat1Param);
    const activeDirects = coder.decode(["uint256"], "0x" + directsRaw)[0];
    const qualRaw = await queryConstant(CONTRACTS.matrix, "isMatrixQualified(address)", seat1Param);
    const isQual = coder.decode(["bool"], "0x" + qualRaw)[0];
    console.log(`4. Seat 1 Directs & Qualification:`, {
      activeDirects: activeDirects.toString(),
      isQualified: isQual
    });
  } catch (err) {
    console.log(`4. Directs error:`, err.message);
  }

  // 5. Check Protocol Pools Balances & Distribution
  console.log(`\n----------------------------------------------------------------`);
  console.log(`🏊 PROTOCOL POOLS AUDIT`);
  console.log(`----------------------------------------------------------------`);

  for (const [name, addr] of Object.entries({
    "Pool 1 - DAOv2 (35%)": CONTRACTS.dao,
    "Pool 2 - SalaryPool (35%)": CONTRACTS.salaryPool,
    "Pool 3 - MagicBox (10%)": CONTRACTS.magicBoxPool,
    "Pool 4 - RewardPool (20%)": CONTRACTS.rewardPool,
    "Vault Router": CONTRACTS.vault
  })) {
    const tronHex = toTronHex(addr);
    const balanceTrob = await getAccountBalance(tronHex);
    let extra = "";
    try {
      if (name.includes("MagicBox")) {
        const pBalRaw = await queryConstant(addr, "poolBalance()");
        const pBal = coder.decode(["uint256"], "0x" + pBalRaw)[0];
        const elRaw = await queryConstant(addr, "getEligibleCount()");
        const elCount = coder.decode(["uint256"], "0x" + elRaw)[0];
        extra = ` | poolBalance(): ${(Number(pBal) / 1e6).toFixed(4)} TROB | Eligible Users: ${elCount}`;
      } else if (name.includes("SalaryPool")) {
        const pBalRaw = await queryConstant(addr, "poolBalance()");
        const pBal = coder.decode(["uint256"], "0x" + pBalRaw)[0];
        extra = ` | poolBalance(): ${(Number(pBal) / 1e6).toFixed(4)} TROB`;
      } else if (name.includes("RewardPool")) {
        const pBalRaw = await queryConstant(addr, "poolBalance()");
        const pBal = coder.decode(["uint256"], "0x" + pBalRaw)[0];
        extra = ` | poolBalance(): ${(Number(pBal) / 1e6).toFixed(4)} TROB`;
      }
    } catch (e) {
      extra = ` | call error: ${e.message.slice(0, 40)}`;
    }
    console.log(`   ${name.padEnd(26)} [${addr}]: Native ${balanceTrob.toFixed(4)} TROB${extra}`);
  }
}

main().catch(console.error);
