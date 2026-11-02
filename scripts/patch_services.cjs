const fs = require('fs');
const path = require('path');

const p = path.resolve(__dirname, '../packages/services/src/matrix/index.ts');
let content = fs.readFileSync(p, 'utf8');

const target = `const MATRIX_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_MAINNET_MATRIX_HEX ||
  process.env.NEXT_PUBLIC_MATRIX_HEX ||
  process.env.MATRIX_HEX ||
  "411a5f193d5b9654282fed67931d9123c00da9c879";
const REGISTRY_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_MAINNET_REGISTRY_HEX ||
  process.env.NEXT_PUBLIC_REGISTRY_HEX ||
  process.env.REGISTRY_HEX ||
  "411a7f29b91424fd6715c5048b458dcf7beeeaeebc";
const TROB_RPC_ENDPOINT =
  process.env.RPC_URL ||
  process.env.FULLNODE_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://fullnode-one.trobchain.com";
const TROB_TESTNET_RPC = TROB_RPC_ENDPOINT;`;

const replacement = `const IS_MAINNET_SVC = process.env.IS_MAINNET === "true" || process.env.NEXT_PUBLIC_IS_MAINNET === "true";
const MATRIX_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_MATRIX_HEX ||
  process.env.MATRIX_HEX ||
  (IS_MAINNET_SVC ? "411a5f193d5b9654282fed67931d9123c00da9c879" : "418919e11e219e81d9f510947f9d4f9e9ac04f4cc6");
const REGISTRY_CONTRACT_HEX =
  process.env.NEXT_PUBLIC_REGISTRY_HEX ||
  process.env.REGISTRY_HEX ||
  (IS_MAINNET_SVC ? "411a7f29b91424fd6715c5048b458dcf7beeeaeebc" : "412854e95c847472bb7130baf5f3d9363dcee5fe18");
const TROB_RPC_ENDPOINT =
  process.env.RPC_URL ||
  process.env.FULLNODE_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  (IS_MAINNET_SVC ? "https://fullnode-one.trobchain.com" : "https://fullnode-one-testnet.trobchain.com");
const TROB_TESTNET_RPC = TROB_RPC_ENDPOINT;`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  content = normalizedContent.replace(normalizedTarget, replacement);
  fs.writeFileSync(p, content, 'utf8');
  console.log('Successfully updated services constants!');
} else {
  console.log('Target not found in services file');
}

