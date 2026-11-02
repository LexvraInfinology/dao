const fs = require('fs');
const path = require('path');

// 1. Patch apps/web-matrix/lib/contracts.ts
const contractsPath = path.resolve(__dirname, '../apps/web-matrix/lib/contracts.ts');
let contractsContent = fs.readFileSync(contractsPath, 'utf8');

// Replace Network & Contract Addresses block
const networkOld = `export const IS_MAINNET = true;
export const TARGET_NETWORK = "mainnet";
export const NETWORK_NAME = "TrobChain Mainnet";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1000);`;

const networkNew = `export const IS_MAINNET = process.env.NEXT_PUBLIC_IS_MAINNET === "true";
export const TARGET_NETWORK = process.env.NEXT_PUBLIC_TARGET_NETWORK || (IS_MAINNET ? "mainnet" : "testnet");
export const NETWORK_NAME = IS_MAINNET ? "TrobChain Mainnet" : "TrobChain Testnet";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || (IS_MAINNET ? 1000 : 1001));

export const TESTNET_DEFAULT_ADDRESSES = {
  matrix: "TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o",
  token: "TMg7ZffXNkopbA5KWsq8vUFW5oL5ZqKPbx",
  coin: "TFBF5ZXnTgcs3gvXeBBh6zP3xmpujjBDpA",
  registry: "TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1",
  vault: "TXn5f6qg8egX1fww3aUAfrpoM3K91Lpq3Q",
  salaryPool: "TQuoEwp5s6G62CYRuQsvziynUQnGsvtucM",
  rewardPool: "TMAiUnfvgchovZ4ffq7BuEPidCd1SxVJBf",
  magicBoxPool: "TAoMXsB2Em1iK9tSqwGaPDL3A7hLHrR8Ue",
  dao: "TVBLDggu9VULMQnxucjftLgg6QfAKN5rUW",
  nft: "TYKwGFyJLnRt9QSh2RuvM2FzeeyxLNz42J",
  membership: "TFAs4xubenayrT81TRQQ15Mw6Rb2WQ5R4d",
  legacyDaoV1: "TRoF5D41yYtbjRdxatK38GDjxb2sGnkNFd",
  legacyDaoV2: "TKVdXdghjfPh8jH6Ek6UmWcnaafVkYcyfy",
};`;

if (contractsContent.includes(networkOld)) {
  contractsContent = contractsContent.replace(networkOld, networkNew);
}

// Replace CONTRACT_ADDRESSES initialization
const contractAddrsOld = `export const CONTRACT_ADDRESSES = {
  matrix: process.env.NEXT_PUBLIC_MATRIX_ADDRESS || MAINNET_DEFAULT_ADDRESSES.matrix,
  token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || MAINNET_DEFAULT_ADDRESSES.token,
  registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || MAINNET_DEFAULT_ADDRESSES.registry,
  vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || MAINNET_DEFAULT_ADDRESSES.vault,
  salaryPool: process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS || MAINNET_DEFAULT_ADDRESSES.salaryPool,
  rewardPool: process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS || MAINNET_DEFAULT_ADDRESSES.rewardPool,
  magicBoxPool: process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS || MAINNET_DEFAULT_ADDRESSES.magicBoxPool,
  dao: process.env.NEXT_PUBLIC_DAO_ADDRESS || MAINNET_DEFAULT_ADDRESSES.dao,
  nft: process.env.NEXT_PUBLIC_NFT_ADDRESS || MAINNET_DEFAULT_ADDRESSES.nft,
};`;

const contractAddrsNew = `const DEFAULT_ADDRESSES = IS_MAINNET ? MAINNET_DEFAULT_ADDRESSES : TESTNET_DEFAULT_ADDRESSES;

export const CONTRACT_ADDRESSES = {
  matrix: process.env.NEXT_PUBLIC_MATRIX_ADDRESS || DEFAULT_ADDRESSES.matrix,
  token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || DEFAULT_ADDRESSES.token,
  coin: process.env.NEXT_PUBLIC_COIN_ADDRESS || (DEFAULT_ADDRESSES as any).coin || "TFBF5ZXnTgcs3gvXeBBh6zP3xmpujjBDpA",
  registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || DEFAULT_ADDRESSES.registry,
  vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || DEFAULT_ADDRESSES.vault,
  salaryPool: process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS || DEFAULT_ADDRESSES.salaryPool,
  rewardPool: process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS || DEFAULT_ADDRESSES.rewardPool,
  magicBoxPool: process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS || DEFAULT_ADDRESSES.magicBoxPool,
  dao: process.env.NEXT_PUBLIC_DAO_ADDRESS || DEFAULT_ADDRESSES.dao,
  nft: process.env.NEXT_PUBLIC_NFT_ADDRESS || DEFAULT_ADDRESSES.nft,
  membership: process.env.NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS || (DEFAULT_ADDRESSES as any).membership || "TFAs4xubenayrT81TRQQ15Mw6Rb2WQ5R4d",
  legacyDaoV1: process.env.NEXT_PUBLIC_LEGACY_V1_DAO_ADDRESS || DEFAULT_ADDRESSES.legacyDaoV1,
  legacyDaoV2: process.env.NEXT_PUBLIC_LEGACY_V2_DAO_ADDRESS || DEFAULT_ADDRESSES.legacyDaoV2,
};

export const OFFICIAL_SR_ADDRESS = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY")
  : (process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5");`;

if (contractsContent.includes(contractAddrsOld)) {
  contractsContent = contractsContent.replace(contractAddrsOld, contractAddrsNew);
}

// Replace RPC & Explorer URLs
const rpcOld = `export const ACTIVE_RPC_URL =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
  (process.env.NEXT_PUBLIC_RPC_URL && !process.env.NEXT_PUBLIC_RPC_URL.includes("testnet")
    ? process.env.NEXT_PUBLIC_RPC_URL
    : "https://fullnode-one.trobchain.com");

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_MAINNET_EXPLORER_URL ||
  (process.env.NEXT_PUBLIC_EXPLORER_URL && !process.env.NEXT_PUBLIC_EXPLORER_URL.includes("testnet")
    ? process.env.NEXT_PUBLIC_EXPLORER_URL
    : "https://trobchain.com");

export const EXPLORER_API_URL =
  process.env.NEXT_PUBLIC_MAINNET_EXPLORER_API_URL ||
  (process.env.NEXT_PUBLIC_EXPLORER_API_URL && !process.env.NEXT_PUBLIC_EXPLORER_API_URL.includes("testnet")
    ? process.env.NEXT_PUBLIC_EXPLORER_API_URL
    : "https://backend.trobchain.com/v1");`;

const rpcNew = `export const ACTIVE_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  (IS_MAINNET ? "https://fullnode-one.trobchain.com" : "https://fullnode-one-testnet.trobchain.com");

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ||
  (IS_MAINNET ? "https://trobchain.com" : "https://testnet.trobchain.com");

export const EXPLORER_API_URL =
  process.env.NEXT_PUBLIC_EXPLORER_API_URL ||
  (IS_MAINNET ? "https://backend.trobchain.com/v1" : "https://testnet-backend.trobchain.com/v1");`;

if (contractsContent.includes(rpcOld)) {
  contractsContent = contractsContent.replace(rpcOld, rpcNew);
}

// Guard getOnChainTokenBalance
contractsContent = contractsContent.replace(
  `const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "balanceOf(address)", param);\n    const bal = coder.decode(["uint256"], "0x" + raw)[0];`,
  `const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "balanceOf(address)", param);\n    if (!raw || raw.length < 64) return 0;\n    const bal = coder.decode(["uint256"], "0x" + raw)[0];`
);

// Guard getOnChainTokenAllowance
contractsContent = contractsContent.replace(
  `const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "allowance(address,address)", param);\n    const allowance = coder.decode(["uint256"], "0x" + raw)[0];`,
  `const raw = await queryTrobConstant(CONTRACT_ADDRESSES.token, "allowance(address,address)", param);\n    if (!raw || raw.length < 64) return 0;\n    const allowance = coder.decode(["uint256"], "0x" + raw)[0];`
);

// Guard getOnChainSlotStatus
contractsContent = contractsContent.replace(
  `if (!raw) {\n      return { isUnlocked: false, currentCycle: 1, filledNodes: 0, slotEarned: 0 };\n    }\n    const [isUnlocked, currentCycle, filledNodes, , slotEarned] = coder.decode(`,
  `if (!raw || raw.length < 64) {\n      return { isUnlocked: false, currentCycle: 1, filledNodes: 0, slotEarned: 0 };\n    }\n    const [isUnlocked, currentCycle, filledNodes, , slotEarned] = coder.decode(`
);

// Guard getOnChainAllSlots
contractsContent = contractsContent.replace(
  `    param\n  );\n\n  const [unlockedArr, cyclesArr, filledArr] = coder.decode(`,
  `    param\n  );\n  if (!raw || raw.length < 64) return [];\n\n  const [unlockedArr, cyclesArr, filledArr] = coder.decode(`
);

// Patch isUserRegisteredInMatrix
const regOld = `  // Authoritative on-chain Slot 1 status in EquoraMatrix contract
  try {
    const slot1 = await getOnChainSlotStatus(userAddress, 1);
    if (slot1 && slot1.isUnlocked) {
      if (typeof window !== "undefined") {
        localStorage.setItem(\`equora_matrix_registered_\${clean}\`, "true");
        localStorage.setItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`, "true");
        localStorage.setItem(\`equora_matrix_registered_\${hex}\`, "true");
      }
      return true;
    }
  } catch (err) {
    console.warn("[isUserRegisteredInMatrix] Slot 1 check notice:", err);
  }

  // Fallback: check localStorage cache
  if (typeof window !== "undefined") {
    const cached =
      localStorage.getItem(\`equora_matrix_registered_\${clean}\`) === "true" ||
      localStorage.getItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`) === "true" ||
      localStorage.getItem(\`equora_matrix_registered_\${hex}\`) === "true";
    if (cached) {
      return true;
    }
  }

  return false;`;

const regNew = `  // Authoritative on-chain Slot 1 status in EquoraMatrix contract
  try {
    const slot1 = await getOnChainSlotStatus(userAddress, 1);
    if (slot1) {
      if (slot1.isUnlocked) {
        if (typeof window !== "undefined") {
          localStorage.setItem(\`equora_matrix_registered_\${clean}\`, "true");
          localStorage.setItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`, "true");
          localStorage.setItem(\`equora_matrix_registered_\${hex}\`, "true");
        }
        return true;
      } else {
        // Explicitly NOT unlocked on active contract: clear stale cache
        if (typeof window !== "undefined") {
          localStorage.removeItem(\`equora_matrix_registered_\${clean}\`);
          localStorage.removeItem(\`equora_matrix_registered_\${b58.toLowerCase()}\`);
          localStorage.removeItem(\`equora_matrix_registered_\${hex}\`);
        }
        return false;
      }
    }
  } catch (err) {
    console.warn("[isUserRegisteredInMatrix] Slot 1 check notice:", err);
  }

  return false;`;

if (contractsContent.includes(regOld)) {
  contractsContent = contractsContent.replace(regOld, regNew);
}

fs.writeFileSync(contractsPath, contractsContent, 'utf8');
console.log('Patched: apps/web-matrix/lib/contracts.ts');

// 2. Patch apps/web-matrix/app/api/eligibility/[address]/route.ts
const eligPath = path.resolve(__dirname, '../apps/web-matrix/app/api/eligibility/[address]/route.ts');
let eligContent = fs.readFileSync(eligPath, 'utf8');

const srOldBlock = `const CANONICAL_OFFICIAL_SR_MAINNET_B58 = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
const CANONICAL_OFFICIAL_SR_MAINNET_HEX = "411779966a94d43d2c03ee4b15c4a86b599491f052";

const rawSrFromEnv = (process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "").trim();
const OFFICIAL_SR_MAINNET_B58 =
  rawSrFromEnv && !rawSrFromEnv.includes("K7S")
    ? rawSrFromEnv
    : CANONICAL_OFFICIAL_SR_MAINNET_B58;
const OFFICIAL_SR_MAINNET_HEX = toTronHex(OFFICIAL_SR_MAINNET_B58);`;

const srNewBlock = `const IS_MAINNET_ENV = process.env.NEXT_PUBLIC_IS_MAINNET === "true";
const CANONICAL_OFFICIAL_SR_MAINNET_B58 = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
const CANONICAL_OFFICIAL_SR_MAINNET_HEX = "411779966a94d43d2c03ee4b15c4a86b599491f052";
const CANONICAL_OFFICIAL_SR_TESTNET_B58 = "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5";
const CANONICAL_OFFICIAL_SR_TESTNET_HEX = toTronHex(CANONICAL_OFFICIAL_SR_TESTNET_B58);

const rawMainnetSr = (process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "").trim();
const OFFICIAL_SR_MAINNET_B58 = rawMainnetSr && !rawMainnetSr.includes("K7S") ? rawMainnetSr : CANONICAL_OFFICIAL_SR_MAINNET_B58;
const OFFICIAL_SR_MAINNET_HEX = toTronHex(OFFICIAL_SR_MAINNET_B58);

const rawTestnetSr = (process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "").trim();
const OFFICIAL_SR_TESTNET_B58 = rawTestnetSr || CANONICAL_OFFICIAL_SR_TESTNET_B58;
const OFFICIAL_SR_TESTNET_HEX = toTronHex(OFFICIAL_SR_TESTNET_B58);

const OFFICIAL_SR_B58 = IS_MAINNET_ENV ? OFFICIAL_SR_MAINNET_B58 : OFFICIAL_SR_TESTNET_B58;
const OFFICIAL_SR_HEX = IS_MAINNET_ENV ? OFFICIAL_SR_MAINNET_HEX : OFFICIAL_SR_TESTNET_HEX;

function isSrVoteAddressMatch(addr: string): boolean {
  if (!addr) return false;
  const raw = addr.trim().toLowerCase();
  const hex = toTronHex(addr).toLowerCase();
  return (
    raw === OFFICIAL_SR_TESTNET_HEX.toLowerCase() ||
    raw === CANONICAL_OFFICIAL_SR_TESTNET_HEX.toLowerCase() ||
    raw === OFFICIAL_SR_TESTNET_B58.toLowerCase() ||
    raw === CANONICAL_OFFICIAL_SR_TESTNET_B58.toLowerCase() ||
    raw === OFFICIAL_SR_MAINNET_HEX.toLowerCase() ||
    raw === CANONICAL_OFFICIAL_SR_MAINNET_HEX.toLowerCase() ||
    raw === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
    raw === CANONICAL_OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
    hex === OFFICIAL_SR_TESTNET_HEX.toLowerCase() ||
    hex === CANONICAL_OFFICIAL_SR_TESTNET_HEX.toLowerCase() ||
    hex === OFFICIAL_SR_MAINNET_HEX.toLowerCase() ||
    hex === CANONICAL_OFFICIAL_SR_MAINNET_HEX.toLowerCase()
  );
}`;

if (eligContent.includes(srOldBlock)) {
  eligContent = eligContent.replace(srOldBlock, srNewBlock);
}

// Replace vote checks in route.ts
const voteCheckOld1 = `              return (
                rawV === OFFICIAL_SR_MAINNET_HEX ||
                rawV === CANONICAL_OFFICIAL_SR_MAINNET_HEX ||
                rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                rawV === CANONICAL_OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                hexV === OFFICIAL_SR_MAINNET_HEX ||
                hexV === CANONICAL_OFFICIAL_SR_MAINNET_HEX
              );`;
const voteCheckNew1 = `              return isSrVoteAddressMatch(v.vote_address);`;

while (eligContent.includes(voteCheckOld1)) {
  eligContent = eligContent.replace(voteCheckOld1, voteCheckNew1);
}

// Replace const officialSrB58 = OFFICIAL_SR_MAINNET_B58;
eligContent = eligContent.replace(
  `const officialSrB58 = OFFICIAL_SR_MAINNET_B58;\n    const officialSrHex = OFFICIAL_SR_MAINNET_HEX;`,
  `const officialSrB58 = OFFICIAL_SR_B58;\n    const officialSrHex = OFFICIAL_SR_HEX;`
);

fs.writeFileSync(eligPath, eligContent, 'utf8');
console.log('Patched: apps/web-matrix/app/api/eligibility/[address]/route.ts');

// 3. Patch apps/web-matrix/components/matrix/MatrixAccessGate.tsx
const gatePath = path.resolve(__dirname, '../apps/web-matrix/components/matrix/MatrixAccessGate.tsx');
let gateContent = fs.readFileSync(gatePath, 'utf8');

gateContent = gateContent.replace(
  `import {
  CONTRACT_ADDRESSES,`,
  `import {
  CONTRACT_ADDRESSES,
  OFFICIAL_SR_ADDRESS,`
);

gateContent = gateContent.replace(
  `const rawSr = eligibility?.condition2?.srVote?.officialSrAddress || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";\n          const officialSr = rawSr.includes("K7S") ? "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY" : rawSr;`,
  `const officialSr = eligibility?.condition2?.srVote?.officialSrAddress || OFFICIAL_SR_ADDRESS || "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5";`
);

fs.writeFileSync(gatePath, gateContent, 'utf8');
console.log('Patched: apps/web-matrix/components/matrix/MatrixAccessGate.tsx');

// 4. Patch packages/services/src/matrix/index.ts for timeout & contract addresses
const servicesPath = path.resolve(__dirname, '../packages/services/src/matrix/index.ts');
let servicesContent = fs.readFileSync(servicesPath, 'utf8');

// Replace triggersmartcontract without timeout in syncUserFromChain
servicesContent = servicesContent.replace(
  `        const res = await fetch(\`\${TROB_TESTNET_RPC}/wallet/triggersmartcontract\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner_address: MATRIX_CONTRACT_HEX,
            contract_address: MATRIX_CONTRACT_HEX,
            function_selector: "getSlotData(address,uint256)",
            parameter: param,
            visible: false,
          }),
        });`,
  `        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(\`\${TROB_TESTNET_RPC}/wallet/triggersmartcontract\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner_address: MATRIX_CONTRACT_HEX,
            contract_address: MATRIX_CONTRACT_HEX,
            function_selector: "getSlotData(address,uint256)",
            parameter: param,
            visible: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);`
);

fs.writeFileSync(servicesPath, servicesContent, 'utf8');
console.log('Patched: packages/services/src/matrix/index.ts');

