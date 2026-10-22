// ==============================================================================
// EQUORA MATRIX PROTOCOL — ON-CHAIN CONTRACT CLIENT (apps/web-matrix/lib/contracts.ts)
// ==============================================================================

import { ethers } from "ethers";

// ── Network & Contract Addresses ─────────────────────────────────────────────

export const TARGET_NETWORK = (
  process.env.NEXT_PUBLIC_TARGET_NETWORK || "testnet"
).toLowerCase();

export const IS_MAINNET = TARGET_NETWORK === "mainnet";
export const NETWORK_NAME = IS_MAINNET ? "TrobChain Mainnet" : "TrobChain Testnet";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1000);

export const MAINNET_DEFAULT_ADDRESSES = {
  matrix: "TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE",
  token: "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
  registry: "TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy",
  vault: "TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB",
  dao: "TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto",
  nft: "TRhqfaRNRPeNTNoewLdamZ9W9Rz5erdHjz",
};

export const TESTNET_DEFAULT_ADDRESSES = {
  matrix: "TXdUXMtLawCBdkhDCAVCAaLEimzaiGkjz2",
  token: "TDJNzzyMvJ9xbB7TXgR7TTXDY47aAiLHit",
  registry: "TCcHDFibnBsSwZhCRyvevXQfoAQ6NMyYWN",
  vault: "TDMZ2y9xpqtuZRm4QbEDctuaWQR4KY4Gnq",
  dao: "TLXYmgeyBpUQJaSh5LuumrufaQs6GmrGqz",
  nft: "TQDJwbuFQEXDsSaeGVcU1iRF3WPjRfeLdi",
};

const DEFAULT_ADDRESSES = IS_MAINNET ? MAINNET_DEFAULT_ADDRESSES : TESTNET_DEFAULT_ADDRESSES;

export const CONTRACT_ADDRESSES = {
  matrix:
    process.env.NEXT_PUBLIC_MATRIX_ADDRESS || DEFAULT_ADDRESSES.matrix,
  token:
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS || DEFAULT_ADDRESSES.token,
  registry:
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || DEFAULT_ADDRESSES.registry,
  vault:
    process.env.NEXT_PUBLIC_VAULT_ADDRESS || DEFAULT_ADDRESSES.vault,
  dao:
    process.env.NEXT_PUBLIC_DAO_ADDRESS || DEFAULT_ADDRESSES.dao,
  nft:
    process.env.NEXT_PUBLIC_NFT_ADDRESS || DEFAULT_ADDRESSES.nft,
};

export const ACTIVE_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (IS_MAINNET
    ? "https://fullnode-one.trobchain.com"
    : "https://fullnode-one-testnet.trobchain.com");

export const TROBCHAIN_TESTNET_RPC = ACTIVE_RPC_URL; // Backward-compatible alias

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ||
  (IS_MAINNET ? "https://trobchain.com" : "https://testnet.trobchain.com");

export const EXPLORER_API_URL =
  process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
  (IS_MAINNET
    ? "https://backend.trobchain.com/v1"
    : "https://testnet-backend.trobchain.com/v1");

// ── Base58 / Hex Converter ────────────────────────────────────────────────────

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function toHexAddress(input: string): string {
  if (!input) return "0x0000000000000000000000000000000000000000";
  const str = input.trim();
  if (str.startsWith("0x") || str.startsWith("0X")) return str.toLowerCase();
  if (str.startsWith("41") && str.length === 42) return `0x${str.slice(2)}`.toLowerCase();

  if (str.startsWith("T") && str.length === 34) {
    let num = BigInt(0);
    for (const c of str) {
      const idx = B58_ALPHABET.indexOf(c);
      if (idx === -1) throw new Error("Invalid Base58 character");
      num = num * BigInt(58) + BigInt(idx);
    }
    let hex = num.toString(16);
    if (hex.length % 2 !== 0) hex = "0" + hex;
    hex = hex.padStart(50, "0");
    return `0x${hex.slice(2, 42)}`.toLowerCase();
  }
  return str.toLowerCase();
}

export function toTronHex(input: string): string {
  const hex = toHexAddress(input);
  return "41" + hex.slice(2);
}

// ── ABIs ──────────────────────────────────────────────────────────────────────

export const MATRIX_ABI = [
  "function isMatrixOpen() external view returns (bool)",
  "function BASE_SLOT_COST() external view returns (uint256)",
  "function slotCosts(uint256) external view returns (uint256)",
  "function joinSlot(uint256 slot, address sponsor) external",
  "function isMatrixQualified(address user) external view returns (bool)",
  "function getSlotData(address user, uint256 slot) external view returns (bool isUnlocked, uint256 currentCycle, uint256 filledNodes, address[14] nodes, uint256 slotEarned)",
  "function withdraw(uint256 amount) external",
  "function userBalance(address user) external view returns (uint256)",
  "function totalEarned(address user) external view returns (uint256)",
];

export const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
];

export const REGISTRY_ABI = [
  "function isRegistered(address user) external view returns (bool)",
  "function getSponsor(address user) external view returns (address)",
  "function getUserId(address user) external view returns (uint256)",
  "function getCodeByUser(address user) external view returns (uint32)",
];

// ── Read-Only Query Helpers ───────────────────────────────────────────────────

export async function queryTrobConstant(
  contractAddress: string,
  functionSelector: string,
  parameterHex = ""
): Promise<string> {
  const contractHex = toTronHex(contractAddress);
  const payload = {
    owner_address: contractHex,
    contract_address: contractHex,
    function_selector: functionSelector,
    parameter: parameterHex,
    visible: false,
  };

  const res = await fetch(`${ACTIVE_RPC_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (data.result && data.result.result && data.constant_result?.length > 0) {
    return data.constant_result[0];
  }
  throw new Error(
    data.result?.message
      ? Buffer.from(data.result.message, "hex").toString()
      : "Failed to read contract"
  );
}

/** Check user's on-chain EquoraToken balance */
export async function getOnChainTokenBalance(userAddress: string): Promise<number> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);
    const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "balanceOf(address)", param);
    const bal = coder.decode(["uint256"], "0x" + raw)[0];
    return Number(ethers.formatUnits(bal, 18));
  } catch (err) {
    console.warn("[OnChain] Balance check error:", err);
    return 0;
  }
}

/** Check user's on-chain allowance for EquoraMatrix */
export async function getOnChainTokenAllowance(
  userAddress: string,
  spenderAddress = CONTRACT_ADDRESSES.matrix
): Promise<number> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const spenderHex = toHexAddress(spenderAddress);
    const param = coder.encode(["address", "address"], [userHex, spenderHex]).slice(2);
    const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "allowance(address,address)", param);
    const allowance = coder.decode(["uint256"], "0x" + raw)[0];
    return Number(ethers.formatUnits(allowance, 18));
  } catch (err) {
    console.warn("[OnChain] Allowance check error:", err);
    return 0;
  }
}

/** Check user's on-chain slot unlock status */
export async function getOnChainSlotStatus(
  userAddress: string,
  slotNumber: number
): Promise<{ isUnlocked: boolean; currentCycle: number; filledNodes: number; slotEarned: number }> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address", "uint256"], [userHex, slotNumber]).slice(2);
    const raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getSlotData(address,uint256)",
      param
    );
    const [isUnlocked, currentCycle, filledNodes, , slotEarned] = coder.decode(
      ["bool", "uint256", "uint256", "address[14]", "uint256"],
      "0x" + raw
    );
    return {
      isUnlocked,
      currentCycle: Number(currentCycle),
      filledNodes: Number(filledNodes),
      slotEarned: Number(ethers.formatUnits(slotEarned, 18)),
    };
  } catch (err) {
    console.warn("[OnChain] Slot status error:", err);
    return { isUnlocked: false, currentCycle: 1, filledNodes: 0, slotEarned: 0 };
  }
}

/** Fetch full 14-node placement data directly on-chain */
export async function getOnChainSlotDetails(
  userAddress: string,
  slotNumber: number
): Promise<any> {
  const coder = new ethers.AbiCoder();
  const userHex = toHexAddress(userAddress);
  const param = coder.encode(["address", "uint256"], [userHex, slotNumber]).slice(2);

  const raw = await queryTrobConstant(
    CONTRACT_ADDRESSES.matrix,
    "getSlotData(address,uint256)",
    param
  );

  const [isUnlocked, currentCycle, filledNodes, nodes, slotEarned] = coder.decode(
    ["bool", "uint256", "uint256", "address[14]", "uint256"],
    "0x" + raw
  );

  const formattedNodes = [];
  for (let pos = 1; pos <= 14; pos++) {
    const occupant = nodes[pos - 1];
    const isFilled =
      occupant &&
      occupant !== "0x0000000000000000000000000000000000000000" &&
      occupant !== "0x0";

    let payoutType = "OWNER_CASHFLOW";
    if (pos <= 2) payoutType = "UPLINE_SPONSOR";
    else if (pos === 4 || pos === 5) payoutType = "AUTO_UPGRADE_RESERVE";
    else if (pos === 7 || pos === 10) payoutType = "DOWNLINE_MERITOCRATIC";
    else if (pos === 13) payoutType = "DOWNLINE_WATERFALL";
    else if (pos === 14) payoutType = "CYCLE_RECYCLE";

    formattedNodes.push({
      position: pos,
      level: pos <= 2 ? 1 : pos <= 6 ? 2 : 3,
      filled: Boolean(isFilled),
      placedUser: isFilled ? occupant.toLowerCase() : null,
      userId: isFilled ? parseInt(occupant.slice(2, 6), 16) || pos : null,
      payoutType,
      recipientAddress: isFilled ? userHex : null,
      wasFallback: false,
      amount: 30,
      timestamp: isFilled ? new Date().toISOString() : null,
      isDirect: pos <= 2,
      isSpillover: pos >= 7,
    });
  }

  const cycleNum = Number(currentCycle) || (isUnlocked ? 1 : 0);

  return {
    slotNumber,
    cost: 30, // Pegged $30 unit entry according to Master Whitepaper
    isUnlocked: Boolean(isUnlocked),
    currentCycle: cycleNum,
    recyclesCount: Math.max(0, cycleNum - 1),
    filledNodes: Number(filledNodes),
    upgradeReserve: 0,
    totalEarned: Number(ethers.formatUnits(slotEarned, 18)),
    nodes: formattedNodes,
  };
}

/** Fetch all 12 slots summary status directly from on-chain smart contract */
export async function getOnChainAllSlots(userAddress: string): Promise<any[]> {
  const coder = new ethers.AbiCoder();
  const userHex = toHexAddress(userAddress);
  const param = coder.encode(["address"], [userHex]).slice(2);

  const raw = await queryTrobConstant(
    CONTRACT_ADDRESSES.matrix,
    "getAllSlotsStatus(address)",
    param
  );

  const [unlockedArr, cyclesArr, filledArr] = coder.decode(
    ["bool[12]", "uint256[12]", "uint256[12]"],
    "0x" + raw
  );

  const result = [];
  for (let i = 1; i <= 12; i++) {
    const isUnlocked = Boolean(unlockedArr[i - 1]);
    const cycle = Number(cyclesArr[i - 1]) || (isUnlocked ? 1 : 0);
    const filled = Number(filledArr[i - 1]) || 0;

    result.push({
      slotNumber: i,
      cost: 30, // $30 fixed unit value per Master Whitepaper
      isUnlocked,
      currentCycle: cycle,
      recyclesCount: Math.max(0, cycle - 1),
      filledNodes: filled,
      upgradeReserve: 0,
      totalEarned: 0,
      unlockedAt: isUnlocked ? "On-Chain Active" : null,
    });
  }

  // Populate actual slot 1 earned
  try {
    const slot1Param = coder.encode(["address", "uint256"], [userHex, 1]).slice(2);
    const slot1Raw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getSlotData(address,uint256)",
      slot1Param
    );
    if (slot1Raw) {
      const [, , , , slot1Earned] = coder.decode(
        ["bool", "uint256", "uint256", "address[14]", "uint256"],
        "0x" + slot1Raw
      );
      result[0].totalEarned = Number(ethers.formatUnits(slot1Earned, 18));
    }
  } catch {}

  return result;
}

/** Fetch user financials and rank details directly from on-chain smart contract */
export async function getOnChainUserProfile(userAddress: string): Promise<any> {
  const coder = new ethers.AbiCoder();
  const userHex = toHexAddress(userAddress);
  const param = coder.encode(["address"], [userHex]).slice(2);

  const [finRaw, directsCountRaw, qualRaw, sponsorRaw, isRegRaw] = await Promise.all([
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "getUserFinancials(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "getActiveDirectReferralsCount(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.matrix, "isMatrixQualified(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.registry, "getSponsor(address)", param).catch(() => null),
    queryTrobConstant(CONTRACT_ADDRESSES.registry, "isRegistered(address)", param).catch(() => null),
  ]);

  let availableBalance = 0;
  let totalEarned = 0;
  let withdrawnTotal = 0;
  let highestUnlockedSlot = 0;

  if (finRaw) {
    const fin = coder.decode(["uint256", "uint256", "uint256", "uint256"], "0x" + finRaw);
    availableBalance = Number(ethers.formatUnits(fin[0], 18));
    totalEarned = Number(ethers.formatUnits(fin[1], 18));
    withdrawnTotal = Number(ethers.formatUnits(fin[2], 18));
    highestUnlockedSlot = Number(fin[3]);
  }

  let directReferralsCount = 0;
  if (directsCountRaw) {
    directReferralsCount = Number(coder.decode(["uint256"], "0x" + directsCountRaw)[0]);
  }

  let isQualified = false;
  if (qualRaw) {
    isQualified = Boolean(coder.decode(["bool"], "0x" + qualRaw)[0]);
  }

  let sponsorAddress: string | null = null;
  if (sponsorRaw) {
    const sp = coder.decode(["address"], "0x" + sponsorRaw)[0];
    if (sp && sp !== "0x0000000000000000000000000000000000000000") {
      sponsorAddress = sp.toLowerCase();
    }
  }

  const isRegistered = isRegRaw ? Boolean(coder.decode(["bool"], "0x" + isRegRaw)[0]) : false;

  const rankTier =
    highestUnlockedSlot >= 12
      ? 4
      : highestUnlockedSlot >= 9
      ? 3
      : highestUnlockedSlot >= 6
      ? 2
      : highestUnlockedSlot >= 3
      ? 1
      : 0;
  const rankNames = ["NONE", "ALPHA", "PRIME", "ELITE", "CROWN"];

  return {
    address: userHex,
    userId: parseInt(userHex.slice(2, 6), 16) || 1,
    username: `Operative ${userHex.slice(2, 6).toUpperCase()}`,
    avatarUrl: null,
    bio: isQualified ? "Qualified Matrix Leader (2+ Directs)" : "Matrix Member",
    telegram: null,
    twitter: null,
    sponsorAddress,
    sponsorUserId: null,
    directReferralsCount,
    teamCount: directReferralsCount,
    rankTier,
    rankName: rankNames[rankTier],
    totalEarnings: totalEarned,
    directEarnings: totalEarned,
    matrixEarnings: totalEarned,
    poolEarnings: 0,
    availableBalance,
    withdrawnTotal,
    recyclesCount: 0,
    highestUnlockedSlot: Math.max(highestUnlockedSlot, 1),
    joinedAt: isRegistered ? "On-Chain Active" : "New Member",
  };
}

/** Fetch real active direct referrals from on-chain smart contract */
export async function getOnChainDirectMembers(userAddress: string): Promise<any[]> {
  try {
    const coder = new ethers.AbiCoder();
    const userHex = toHexAddress(userAddress);
    const param = coder.encode(["address"], [userHex]).slice(2);

    const directsRaw = await queryTrobConstant(
      CONTRACT_ADDRESSES.matrix,
      "getActiveDirectReferrals(address)",
      param
    );

    if (!directsRaw) return [];
    const directs = coder.decode(["address[]"], "0x" + directsRaw)[0];

    return directs.map((addr: string, idx: number) => ({
      address: addr.toLowerCase(),
      userId: parseInt(addr.slice(2, 6), 16) || idx + 1,
      username: `Operative ${addr.slice(2, 6).toUpperCase()}`,
      joinedAt: new Date().toISOString(),
      activeSlots: 1,
      totalContributed: 30, // $30 deposit per whitepaper
    }));
  } catch (err) {
    console.warn("[OnChain] Directs fetch error:", err);
    return [];
  }
}

// ── Interactive Wallet Transaction Execution ─────────────────────────────────

/**
 * Executes token approval on-chain using the connected Web3 wallet.
 * Supports window.tronWeb (TronLink/TrobSafe) and window.ethereum.
 */
export async function approveTokenOnChain(
  amount: number,
  spenderAddress = CONTRACT_ADDRESSES.matrix
): Promise<string> {
  const amountWei = ethers.parseUnits(String(amount), 18).toString();
  const tokenContractHex = toHexAddress(CONTRACT_ADDRESSES.token);
  const spenderHex = toHexAddress(spenderAddress);

  if (typeof window !== "undefined") {
    const w = window as any;
    // 1. TronWeb / TronLink / TrobSafe
    const tw = w.trobSafe || w.trobWeb || w.tronWeb || (w.trob?.trx ? w.trob : null);
    if (tw && tw.ready && tw.contract) {
      try {
        const contract = await tw.contract().at(CONTRACT_ADDRESSES.token);
        const tx = await contract.approve(spenderAddress, amountWei).send({
          feeLimit: 50_000_000,
        });
        return typeof tx === "string" ? tx : tx?.txid || String(tx);
      } catch (err: any) {
        throw new Error(err.message || "Token approval rejected by wallet");
      }
    }

    // 2. Ethereum / EIP-1193 / MetaMask
    if (w.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(w.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(tokenContractHex, TOKEN_ABI, signer);
        const tx = await contract.approve(spenderHex, amountWei);
        const receipt = await tx.wait();
        return receipt.hash;
      } catch (err: any) {
        throw new Error(err.message || "Approval rejected or failed");
      }
    }
  }

  throw new Error("No compatible Web3 wallet detected. Please connect MetaMask or TrobSafe.");
}

/**
 * Executes joinSlot on-chain using the connected Web3 wallet.
 */
export async function joinSlotOnChain(
  slotNumber: number,
  sponsorAddress = "0xE5d1e6b17525e18649F78c54e132Ff1e1Efdd90C"
): Promise<string> {
  const matrixContractHex = toHexAddress(CONTRACT_ADDRESSES.matrix);
  const sponsorHex = toHexAddress(sponsorAddress);

  if (typeof window !== "undefined") {
    const w = window as any;
    // 1. TronWeb / TronLink / TrobSafe
    const tw = w.trobSafe || w.trobWeb || w.tronWeb || (w.trob?.trx ? w.trob : null);
    if (tw && tw.ready && tw.contract) {
      try {
        const contract = await tw.contract().at(CONTRACT_ADDRESSES.matrix);
        const tx = await contract.joinSlot(slotNumber, sponsorAddress).send({
          feeLimit: 100_000_000,
        });
        return typeof tx === "string" ? tx : tx?.txid || String(tx);
      } catch (err: any) {
        throw new Error(err.message || "joinSlot transaction rejected by wallet");
      }
    }

    // 2. Ethereum / EIP-1193 / MetaMask
    if (w.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(w.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(matrixContractHex, MATRIX_ABI, signer);
        const tx = await contract.joinSlot(slotNumber, sponsorHex);
        const receipt = await tx.wait();
        return receipt.hash;
      } catch (err: any) {
        throw new Error(err.message || "joinSlot failed on-chain");
      }
    }
  }

  throw new Error("No compatible Web3 wallet detected. Please connect MetaMask or TrobSafe.");
}
