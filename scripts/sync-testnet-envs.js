const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../deployed-trobchain-testnet.json');
if (!fs.existsSync(manifestPath)) {
  console.error('deployed-trobchain-testnet.json not found!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const c = manifest.contracts;

const NEW_TESTNET = {
  TOKEN_ADDRESS: c.EquoraToken.addressBase58,
  TOKEN_HEX: c.EquoraToken.addressHex,
  REGISTRY_ADDRESS: c.EquoraRegistry.addressBase58,
  REGISTRY_HEX: c.EquoraRegistry.addressHex,
  NFT_ADDRESS: c.EquoraNFT.addressBase58,
  NFT_HEX: c.EquoraNFT.addressHex,
  VAULT_ADDRESS: c.EquoraVault.addressBase58,
  VAULT_HEX: c.EquoraVault.addressHex,
  DAO_ADDRESS: c.EquoraDAOv3.addressBase58,
  DAO_HEX: c.EquoraDAOv3.addressHex,
  ROYALTY_POOL_ADDRESS: c.EquoraRoyaltyPool.addressBase58,
  ROYALTY_POOL_HEX: c.EquoraRoyaltyPool.addressHex,
  SALARY_POOL_ADDRESS: c.EquoraRoyaltyPool.addressBase58,
  SALARY_POOL_HEX: c.EquoraRoyaltyPool.addressHex,
  REWARD_POOL_ADDRESS: c.EquoraRewardPool.addressBase58,
  REWARD_POOL_HEX: c.EquoraRewardPool.addressHex,
  MAGIC_BOX_ADDRESS: c.EquoraMagicBox.addressBase58,
  MAGIC_BOX_HEX: c.EquoraMagicBox.addressHex,
  MATRIX_ADDRESS: c.EquoraMatrix.addressBase58,
  MATRIX_HEX: c.EquoraMatrix.addressHex,

  RPC_URL: "https://fullnode-one-testnet.trobchain.com",
  EXPLORER_URL: "https://testnet.trobchain.com",
  EXPLORER_API_URL: "https://testnet-backend.trobchain.com/v1",
  CHAIN_ID: "1001",
  TARGET_NETWORK: "testnet",
  IS_MAINNET: "false"
};

const envFiles = [
  path.resolve(__dirname, '../apps/web-dao/.env.local'),
  path.resolve(__dirname, '../apps/web-matrix/.env.local'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../packages/hardhat/.env')
];

for (const envPath of envFiles) {
  if (!fs.existsSync(envPath)) continue;
  let content = fs.readFileSync(envPath, 'utf8');

  // Network and Chain Toggles
  content = content.replace(/^IS_MAINNET=.*$/gm, `IS_MAINNET=${NEW_TESTNET.IS_MAINNET}`);
  content = content.replace(/^NEXT_PUBLIC_IS_MAINNET=.*$/gm, `NEXT_PUBLIC_IS_MAINNET=${NEW_TESTNET.IS_MAINNET}`);
  content = content.replace(/^TARGET_NETWORK=.*$/gm, `TARGET_NETWORK=${NEW_TESTNET.TARGET_NETWORK}`);
  content = content.replace(/^NEXT_PUBLIC_TARGET_NETWORK=.*$/gm, `NEXT_PUBLIC_TARGET_NETWORK=${NEW_TESTNET.TARGET_NETWORK}`);
  content = content.replace(/^CHAIN_ID=.*$/gm, `CHAIN_ID=${NEW_TESTNET.CHAIN_ID}`);
  content = content.replace(/^NEXT_PUBLIC_CHAIN_ID=.*$/gm, `NEXT_PUBLIC_CHAIN_ID=${NEW_TESTNET.CHAIN_ID}`);
  content = content.replace(/^RPC_URL=.*$/gm, `RPC_URL=${NEW_TESTNET.RPC_URL}`);
  content = content.replace(/^FULLNODE_URL=.*$/gm, `FULLNODE_URL=${NEW_TESTNET.RPC_URL}`);
  content = content.replace(/^NEXT_PUBLIC_RPC_URL=.*$/gm, `NEXT_PUBLIC_RPC_URL=${NEW_TESTNET.RPC_URL}`);
  content = content.replace(/^NEXT_PUBLIC_EXPLORER_URL=.*$/gm, `NEXT_PUBLIC_EXPLORER_URL=${NEW_TESTNET.EXPLORER_URL}`);
  content = content.replace(/^NEXT_PUBLIC_EXPLORER_API_URL=.*$/gm, `NEXT_PUBLIC_EXPLORER_API_URL=${NEW_TESTNET.EXPLORER_API_URL}`);

  // Contract Addresses
  content = content.replace(/^NEXT_PUBLIC_TOKEN_ADDRESS=.*$/gm, `NEXT_PUBLIC_TOKEN_ADDRESS="${NEW_TESTNET.TOKEN_ADDRESS}"`);
  content = content.replace(/^NEXT_PUBLIC_TOKEN_HEX=.*$/gm, `NEXT_PUBLIC_TOKEN_HEX="${NEW_TESTNET.TOKEN_HEX}"`);

  content = content.replace(/^NEXT_PUBLIC_REGISTRY_ADDRESS=.*$/gm, `NEXT_PUBLIC_REGISTRY_ADDRESS=${NEW_TESTNET.REGISTRY_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_REGISTRY_HEX=.*$/gm, `NEXT_PUBLIC_REGISTRY_HEX=${NEW_TESTNET.REGISTRY_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_NFT_ADDRESS=.*$/gm, `NEXT_PUBLIC_NFT_ADDRESS=${NEW_TESTNET.NFT_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_NFT_HEX=.*$/gm, `NEXT_PUBLIC_NFT_HEX=${NEW_TESTNET.NFT_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_VAULT_ADDRESS=.*$/gm, `NEXT_PUBLIC_VAULT_ADDRESS=${NEW_TESTNET.VAULT_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_VAULT_HEX=.*$/gm, `NEXT_PUBLIC_VAULT_HEX=${NEW_TESTNET.VAULT_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_DAO_ADDRESS=.*$/gm, `NEXT_PUBLIC_DAO_ADDRESS=${NEW_TESTNET.DAO_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_DAO_HEX=.*$/gm, `NEXT_PUBLIC_DAO_HEX=${NEW_TESTNET.DAO_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_SALARY_POOL_ADDRESS=.*$/gm, `NEXT_PUBLIC_SALARY_POOL_ADDRESS=${NEW_TESTNET.SALARY_POOL_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_SALARY_POOL_HEX=.*$/gm, `NEXT_PUBLIC_SALARY_POOL_HEX=${NEW_TESTNET.SALARY_POOL_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_REWARD_POOL_ADDRESS=.*$/gm, `NEXT_PUBLIC_REWARD_POOL_ADDRESS=${NEW_TESTNET.REWARD_POOL_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_REWARD_POOL_HEX=.*$/gm, `NEXT_PUBLIC_REWARD_POOL_HEX=${NEW_TESTNET.REWARD_POOL_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_MAGIC_BOX_ADDRESS=.*$/gm, `NEXT_PUBLIC_MAGIC_BOX_ADDRESS=${NEW_TESTNET.MAGIC_BOX_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_MAGIC_BOX_HEX=.*$/gm, `NEXT_PUBLIC_MAGIC_BOX_HEX=${NEW_TESTNET.MAGIC_BOX_HEX}`);

  content = content.replace(/^NEXT_PUBLIC_MATRIX_ADDRESS=.*$/gm, `NEXT_PUBLIC_MATRIX_ADDRESS=${NEW_TESTNET.MATRIX_ADDRESS}`);
  content = content.replace(/^NEXT_PUBLIC_MATRIX_HEX=.*$/gm, `NEXT_PUBLIC_MATRIX_HEX=${NEW_TESTNET.MATRIX_HEX}`);

  // Deployer key if in packages/hardhat/.env
  if (envPath.includes('hardhat')) {
    content = content.replace(/^DEPLOYER_PRIVATE_KEY=.*$/gm, `DEPLOYER_PRIVATE_KEY=11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca`);
  }

  fs.writeFileSync(envPath, content);
  console.log(`✅ Synced testnet contracts into ${path.relative(path.resolve(__dirname, '..'), envPath)}`);
}

console.log('\nAll .env files updated successfully with new Testnet contracts!');

