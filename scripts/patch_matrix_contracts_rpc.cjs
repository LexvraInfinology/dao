const fs = require('fs');

let contracts = fs.readFileSync('apps/web-matrix/lib/contracts.ts', 'utf8');

const targetRpcBlock = `export const ACTIVE_RPC_URL =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
  (process.env.NEXT_PUBLIC_RPC_URL && !process.env.NEXT_PUBLIC_RPC_URL.includes("testnet")
    ? process.env.NEXT_PUBLIC_RPC_URL
    : "https://fullnode-one.trobchain.com");

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_MAINNET_EXPLORER_URL ||
  (process.env.NEXT_PUBLIC_EXPLORER_URL && !process.env.NEXT_PUBLIC_EXPLORER_URL.includes("testnet")
    ? process.env.NEXT_PUBLIC_EXPLORER_URL
    : "https://trobchain.com");`;

const replacementRpcBlock = `export const ACTIVE_RPC_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://fullnode-one.trobchain.com")
  : (process.env.NEXT_PUBLIC_TESTNET_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://fullnode-one-testnet.trobchain.com");

export const EXPLORER_URL = IS_MAINNET
  ? (process.env.NEXT_PUBLIC_MAINNET_EXPLORER_URL || process.env.NEXT_PUBLIC_EXPLORER_URL || "https://trobchain.com")
  : (process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL || process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.trobchain.com");`;

if (contracts.includes(targetRpcBlock)) {
  contracts = contracts.replace(targetRpcBlock, replacementRpcBlock);
  fs.writeFileSync('apps/web-matrix/lib/contracts.ts', contracts, 'utf8');
  console.log('Successfully updated ACTIVE_RPC_URL and EXPLORER_URL in apps/web-matrix/lib/contracts.ts');
} else {
  // Try CRLF normalize
  const normalized = contracts.replace(/\r\n/g, '\n');
  if (normalized.includes(targetRpcBlock)) {
    const updated = normalized.replace(targetRpcBlock, replacementRpcBlock);
    fs.writeFileSync('apps/web-matrix/lib/contracts.ts', updated, 'utf8');
    console.log('Successfully updated (normalized) in apps/web-matrix/lib/contracts.ts');
  } else {
    console.log('Could not find targetRpcBlock in contracts.ts');
  }
}

