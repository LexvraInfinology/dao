const fs = require('fs');
const path = require('path');

const TESTNET_VARS = {
  IS_MAINNET: "false",
  NEXT_PUBLIC_IS_MAINNET: "false",
  TARGET_NETWORK: "testnet",
  NEXT_PUBLIC_TARGET_NETWORK: "testnet",
  CHAIN_ID: "1001",
  NEXT_PUBLIC_CHAIN_ID: "1001",
  RPC_URL: "https://fullnode-one-testnet.trobchain.com",
  FULLNODE_URL: "https://fullnode-one-testnet.trobchain.com",
  NEXT_PUBLIC_RPC_URL: "https://fullnode-one-testnet.trobchain.com",
  NEXT_PUBLIC_EXPLORER_URL: "https://testnet.trobchain.com",
  NEXT_PUBLIC_EXPLORER_API_URL: "https://testnet-backend.trobchain.com/v1",

  NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS: "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5",
  NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS: "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY",

  NEXT_PUBLIC_TOKEN_ADDRESS: "TMg7ZffXNkopbA5KWsq8vUFW5oL5ZqKPbx",
  NEXT_PUBLIC_TOKEN_HEX: "418065e61914497415e464cbc7b67eadb10d13f569",

  NEXT_PUBLIC_COIN_ADDRESS: "TFBF5ZXnTgcs3gvXeBBh6zP3xmpujjBDpA",
  NEXT_PUBLIC_COIN_HEX: "41391f5ad2e90bd4a0e5751a67917717543b6e7071",

  NEXT_PUBLIC_REGISTRY_ADDRESS: "TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1",
  NEXT_PUBLIC_REGISTRY_HEX: "412854e95c847472bb7130baf5f3d9363dcee5fe18",

  NEXT_PUBLIC_VAULT_ADDRESS: "TXn5f6qg8egX1fww3aUAfrpoM3K91Lpq3Q",
  NEXT_PUBLIC_VAULT_HEX: "41ef380fa5abfba8a057e1df49c0f6b3d6b24280ee",

  NEXT_PUBLIC_DAO_ADDRESS: "TVBLDggu9VULMQnxucjftLgg6QfAKN5rUW",
  NEXT_PUBLIC_DAO_HEX: "41d2b5680da9913bdc7ebe8a00ed419ecb60b669c5",

  NEXT_PUBLIC_NFT_ADDRESS: "TYKwGFyJLnRt9QSh2RuvM2FzeeyxLNz42J",
  NEXT_PUBLIC_NFT_HEX: "41f53e5d75a6d93e2a0c441c562dbf3332c41bfc0c",

  NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS: "TFAs4xubenayrT81TRQQ15Mw6Rb2WQ5R4d",
  NEXT_PUBLIC_DAO_MEMBERSHIP_HEX: "41390cfb447dca0af27478deb342390716ae6c3a03",

  NEXT_PUBLIC_SALARY_POOL_ADDRESS: "TQuoEwp5s6G62CYRuQsvziynUQnGsvtucM",
  NEXT_PUBLIC_SALARY_POOL_HEX: "41a3e4cdf6a90b3b3a57ce716c1882bd20eb1aa830",

  NEXT_PUBLIC_REWARD_POOL_ADDRESS: "TMAiUnfvgchovZ4ffq7BuEPidCd1SxVJBf",
  NEXT_PUBLIC_REWARD_POOL_HEX: "417ad690f733b9f8a83aba72b4fd4b86ce0c4ba76c",

  NEXT_PUBLIC_MAGIC_BOX_ADDRESS: "TAoMXsB2Em1iK9tSqwGaPDL3A7hLHrR8Ue",
  NEXT_PUBLIC_MAGIC_BOX_HEX: "41091b166dd91ead929d45f0125942382cc59bb250",

  NEXT_PUBLIC_MATRIX_ADDRESS: "TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o",
  NEXT_PUBLIC_MATRIX_HEX: "418919e11e219e81d9f510947f9d4f9e9ac04f4cc6",

  NEXT_PUBLIC_LEGACY_V1_DAO_ADDRESS: "TRoF5D41yYtbjRdxatK38GDjxb2sGnkNFd",
  NEXT_PUBLIC_LEGACY_V1_DAO_HEX: "41ad9f950884df26767a7d3aec255f53839f955080",

  NEXT_PUBLIC_LEGACY_V2_DAO_ADDRESS: "TKVdXdghjfPh8jH6Ek6UmWcnaafVkYcyfy",
  NEXT_PUBLIC_LEGACY_V2_DAO_HEX: "41687a15cb759d8ab57a2e3a2c141b728ef9d5cb74",
};

function updateEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  for (const [key, value] of Object.entries(TESTNET_VARS)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const quotedRegex = new RegExp(`^${key}=".*"$`, 'm');
    const newline = `${key}="${value}"`;

    if (regex.test(content)) {
      content = content.replace(regex, newline);
    } else if (quotedRegex.test(content)) {
      content = content.replace(quotedRegex, newline);
    } else {
      content += `\n${newline}`;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

updateEnvFile(path.resolve(__dirname, '../apps/web-matrix/.env.local'));
updateEnvFile(path.resolve(__dirname, '../apps/web-dao/.env.local'));
updateEnvFile(path.resolve(__dirname, '../.env'));
updateEnvFile(path.resolve(__dirname, '../packages/hardhat/.env'));

console.log('ALL ENVS SYNCED WITH 100% COMPLETE TESTNET ECOSYSTEM!');

