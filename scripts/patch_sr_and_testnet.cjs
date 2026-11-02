const fs = require('fs');

// 1. packages/services/src/dao/resourceCalculator.ts
let calc = fs.readFileSync('packages/services/src/dao/resourceCalculator.ts', 'utf8');
calc = calc.replace(
  "export const OFFICIAL_EQUORA_SR = 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';",
  `const isMainnet = process.env.IS_MAINNET === 'true' || process.env.NEXT_PUBLIC_IS_MAINNET === 'true' || (process.env.TARGET_NETWORK || '').toLowerCase() === 'mainnet';
export const OFFICIAL_EQUORA_SR = isMainnet
  ? (process.env.OFFICIAL_SR_MAINNET_ADDRESS || process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY')
  : (process.env.OFFICIAL_SR_TESTNET_ADDRESS || process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || 'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5');`
);
fs.writeFileSync('packages/services/src/dao/resourceCalculator.ts', calc, 'utf8');
console.log('1. Updated resourceCalculator.ts');

// 2. packages/services/src/config.ts
let svcCfg = fs.readFileSync('packages/services/src/config.ts', 'utf8');
svcCfg = svcCfg.replace(
  'chainId: parseInt(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || "1000", 10),',
  'chainId: parseInt(process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID || (IS_MAINNET ? "1000" : "1001"), 10),'
);
fs.writeFileSync('packages/services/src/config.ts', svcCfg, 'utf8');
console.log('2. Updated services/src/config.ts');

// 3. apps/api/src/app.ts
let appTs = fs.readFileSync('apps/api/src/app.ts', 'utf8');
// Update lines 493-495
const targetSr = `  // Official Super Representative (SR) Address (Mainnet)
  const OFFICIAL_SR_MAINNET_HEX = "411779966a94d43d2c03ee4b15c4a86b599491f052"; // TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY
  const OFFICIAL_SR_MAINNET_B58 = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";`;

const replacementSr = `  // Official Super Representative (SR) Address (Mainnet vs Testnet)
  const isMainnetEnv =
    process.env.IS_MAINNET === "true" ||
    process.env.NEXT_PUBLIC_IS_MAINNET === "true" ||
    (process.env.TARGET_NETWORK || process.env.NEXT_PUBLIC_TARGET_NETWORK || "").toLowerCase() === "mainnet";

  const OFFICIAL_SR_TESTNET_B58 = process.env.OFFICIAL_SR_TESTNET_ADDRESS || process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5";
  const OFFICIAL_SR_TESTNET_HEX = "415cc58ba778a87ac1ea060d4aa116509691fb0ae0";
  const OFFICIAL_SR_MAINNET_B58 = process.env.OFFICIAL_SR_MAINNET_ADDRESS || process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
  const OFFICIAL_SR_MAINNET_HEX = "411779966a94d43d2c03ee4b15c4a86b599491f052";`;

if (appTs.includes(targetSr)) {
  appTs = appTs.replace(targetSr, replacementSr);
  console.log('3. Updated SR declarations in apps/api/src/app.ts');
}

// Update hasVote check in apps/api/src/app.ts
const targetVoteCheck = `                return (
                  rawV === OFFICIAL_SR_MAINNET_HEX ||
                  rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                  hexV === OFFICIAL_SR_MAINNET_HEX
                );`;

const replacementVoteCheck = `                return (
                  rawV === OFFICIAL_SR_MAINNET_HEX ||
                  rawV === OFFICIAL_SR_TESTNET_HEX ||
                  rawV === OFFICIAL_SR_MAINNET_B58.toLowerCase() ||
                  rawV === OFFICIAL_SR_TESTNET_B58.toLowerCase() ||
                  hexV === OFFICIAL_SR_MAINNET_HEX ||
                  hexV === OFFICIAL_SR_TESTNET_HEX
                );`;

appTs = appTs.split(targetVoteCheck).join(replacementVoteCheck);

// Update fullnode URL in apps/api/src/app.ts
appTs = appTs.replace(
  'const fullnode = process.env.FULLNODE_URL || process.env.RPC_URL || "https://fullnode-one.trobchain.com";',
  'const fullnode = process.env.FULLNODE_URL || process.env.RPC_URL || (isMainnetEnv ? "https://fullnode-one.trobchain.com" : "https://fullnode-one-testnet.trobchain.com");'
);

fs.writeFileSync('apps/api/src/app.ts', appTs, 'utf8');
console.log('3. Updated apps/api/src/app.ts');

// 4. apps/web-matrix/app/api/eligibility/[address]/route.ts
let matrixElig = fs.readFileSync('apps/web-matrix/app/api/eligibility/[address]/route.ts', 'utf8');
const targetEligSr = `// Canonical Official Super Representative (SR) Addresses for Equora Mainnet
const CANONICAL_OFFICIAL_SR_MAINNET_B58 = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
const CANONICAL_OFFICIAL_SR_MAINNET_HEX = "411779966a94d43d2c03ee4b15c4a86b599491f052";

const rawSrFromEnv = (process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "").trim();
const OFFICIAL_SR_MAINNET_B58 =
  rawSrFromEnv && !rawSrFromEnv.includes("K7S")
    ? rawSrFromEnv
    : CANONICAL_OFFICIAL_SR_MAINNET_B58;
const OFFICIAL_SR_MAINNET_HEX = toTronHex(OFFICIAL_SR_MAINNET_B58);`;

const replacementEligSr = `// Canonical Official Super Representative (SR) Addresses
const isMainnet =
  process.env.NEXT_PUBLIC_IS_MAINNET === "true" ||
  process.env.IS_MAINNET === "true" ||
  (process.env.NEXT_PUBLIC_TARGET_NETWORK || "").toLowerCase() === "mainnet";

const CANONICAL_OFFICIAL_SR_MAINNET_B58 = "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
const CANONICAL_OFFICIAL_SR_TESTNET_B58 = "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5";

const defaultSr = isMainnet ? CANONICAL_OFFICIAL_SR_MAINNET_B58 : CANONICAL_OFFICIAL_SR_TESTNET_B58;
const envSr = isMainnet
  ? (process.env.NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS || "").trim()
  : (process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "").trim();

const ACTIVE_SR_B58 = (envSr && !envSr.includes("K7S")) ? envSr : defaultSr;
const ACTIVE_SR_HEX = toTronHex(ACTIVE_SR_B58);`;

if (matrixElig.includes(targetEligSr)) {
  matrixElig = matrixElig.replace(targetEligSr, replacementEligSr);
}

// In GET handler of matrix eligibility route:
matrixElig = matrixElig.replace(
  'const fullnodeRpc =\n      process.env.NEXT_PUBLIC_RPC_URL ||\n      process.env.FULLNODE_URL ||\n      "https://fullnode-one.trobchain.com";',
  'const fullnodeRpc =\n      process.env.NEXT_PUBLIC_RPC_URL ||\n      process.env.FULLNODE_URL ||\n      (isMainnet ? "https://fullnode-one.trobchain.com" : "https://fullnode-one-testnet.trobchain.com");'
);
matrixElig = matrixElig.replace(
  'const officialSrB58 = OFFICIAL_SR_MAINNET_B58;\n    const officialSrHex = OFFICIAL_SR_MAINNET_HEX;',
  'const officialSrB58 = ACTIVE_SR_B58;\n    const officialSrHex = ACTIVE_SR_HEX;'
);
fs.writeFileSync('apps/web-matrix/app/api/eligibility/[address]/route.ts', matrixElig, 'utf8');
console.log('4. Updated web-matrix eligibility route');

// 5. apps/web-matrix/components/matrix/MatrixAccessGate.tsx
let matrixGate = fs.readFileSync('apps/web-matrix/components/matrix/MatrixAccessGate.tsx', 'utf8');
const targetGateSr = 'const rawSr = eligibility?.condition2?.srVote?.officialSrAddress || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";\n          const officialSr = rawSr.includes("K7S") ? "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY" : rawSr;';
const replacementGateSr = `const isMainnet = process.env.NEXT_PUBLIC_IS_MAINNET === 'true';
          const defaultSr = isMainnet ? "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY" : (process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5");
          const rawSr = eligibility?.condition2?.srVote?.officialSrAddress || defaultSr;
          const officialSr = rawSr.includes("K7S") ? defaultSr : rawSr;`;

if (matrixGate.includes(targetGateSr)) {
  matrixGate = matrixGate.replace(targetGateSr, replacementGateSr);
  fs.writeFileSync('apps/web-matrix/components/matrix/MatrixAccessGate.tsx', matrixGate, 'utf8');
  console.log('5. Updated MatrixAccessGate.tsx');
}

// 6. apps/web-dao/src/components/dao/DaoAccessGate.tsx
let daoGate = fs.readFileSync('apps/web-dao/src/components/dao/DaoAccessGate.tsx', 'utf8');
daoGate = daoGate.replace(
  'import {\n  OFFICIAL_SR_MAINNET,\n  FULLNODE_RPC_URL,\n} from \'@/config/env\';',
  'import {\n  OFFICIAL_SR,\n  OFFICIAL_SR_MAINNET,\n  OFFICIAL_SR_TESTNET,\n  FULLNODE_RPC_URL,\n} from \'@/config/env\';'
);
daoGate = daoGate.replace(
  'export const OFFICIAL_EQUORA_SR = OFFICIAL_SR_MAINNET;\nexport const OFFICIAL_EQUORA_TESTNET_SR = OFFICIAL_SR_MAINNET;',
  'export const OFFICIAL_EQUORA_SR = OFFICIAL_SR;\nexport const OFFICIAL_EQUORA_TESTNET_SR = OFFICIAL_SR_TESTNET;'
);
daoGate = daoGate.replace(
  "network:           process.env.NEXT_PUBLIC_TARGET_NETWORK || 'mainnet',",
  "network:           process.env.NEXT_PUBLIC_TARGET_NETWORK || (process.env.NEXT_PUBLIC_IS_MAINNET === 'true' ? 'mainnet' : 'testnet'),"
);
fs.writeFileSync('apps/web-dao/src/components/dao/DaoAccessGate.tsx', daoGate, 'utf8');
console.log('6. Updated DaoAccessGate.tsx');

