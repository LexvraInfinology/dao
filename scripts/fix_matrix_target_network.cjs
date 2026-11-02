const fs = require('fs');

let contracts = fs.readFileSync('apps/web-matrix/lib/contracts.ts', 'utf8');

const targetNetworkBlock = `export const IS_MAINNET = true;
export const TARGET_NETWORK = "mainnet";
export const NETWORK_NAME = "TrobChain Mainnet";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 1000);`;

const replacementNetworkBlock = `export const IS_MAINNET =
  process.env.NEXT_PUBLIC_IS_MAINNET !== undefined
    ? (process.env.NEXT_PUBLIC_IS_MAINNET === "true" || process.env.NEXT_PUBLIC_IS_MAINNET === "1")
    : (process.env.NEXT_PUBLIC_TARGET_NETWORK || process.env.TARGET_NETWORK || "").toLowerCase() === "mainnet";

export const TARGET_NETWORK = IS_MAINNET ? "mainnet" : "testnet";
export const NETWORK_NAME = IS_MAINNET ? "TrobChain Mainnet" : "TrobChain Testnet";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || (IS_MAINNET ? 1000 : 1001));`;

if (contracts.includes(targetNetworkBlock)) {
  contracts = contracts.replace(targetNetworkBlock, replacementNetworkBlock);
  fs.writeFileSync('apps/web-matrix/lib/contracts.ts', contracts, 'utf8');
  console.log('Successfully updated TARGET_NETWORK in apps/web-matrix/lib/contracts.ts');
} else {
  // Try CRLF normalize
  const normalized = contracts.replace(/\r\n/g, '\n');
  if (normalized.includes(targetNetworkBlock)) {
    const updated = normalized.replace(targetNetworkBlock, replacementNetworkBlock);
    fs.writeFileSync('apps/web-matrix/lib/contracts.ts', updated, 'utf8');
    console.log('Successfully updated (normalized CRLF) in apps/web-matrix/lib/contracts.ts');
  } else {
    console.log('Target block not found, checking with regex');
    const regex = /export const IS_MAINNET = true;\r?\nexport const TARGET_NETWORK = "mainnet";\r?\nexport const NETWORK_NAME = "TrobChain Mainnet";\r?\nexport const CHAIN_ID = Number\(process\.env\.NEXT_PUBLIC_CHAIN_ID \|\| 1000\);/;
    if (regex.test(contracts)) {
      contracts = contracts.replace(regex, replacementNetworkBlock);
      fs.writeFileSync('apps/web-matrix/lib/contracts.ts', contracts, 'utf8');
      console.log('Successfully updated via regex');
    } else {
      console.error('Failed to match target network block');
    }
  }
}

