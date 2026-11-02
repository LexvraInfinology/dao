const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../apps/web-matrix/lib/contracts.ts');
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `export const MAINNET_DEFAULT_ADDRESSES = {
  matrix: "TCNeVcVAA3H22QxxRsmG2NsXCsk1q3JpFz",
  token: "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
  registry: "TCPJuV7134EpeaBrqkUAWa2uiMa38EJTpN",
  vault: "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J",
  salaryPool: "TQMDkXunFuXDiTqL1HCRgdx47i3AsincjS",
  rewardPool: "TDq8iJSeomNxEJyUAVxvf4iGH2q5f67kJq",
  magicBoxPool: "TCDL237GcsDQ3eP4phaG1iXzc2SMPcXaPG",
  dao: "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2",
  nft: "TYhsf65YRD64Dz5b8CpRsjGzb22ZYtacZj",
  legacyDaoV1: "TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto",
  legacyDaoV2: "TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT",
};

// Verified TrobChain Mainnet Contract Addresses
// Genesis Root Matrix Member (#0001) on TrobChain Mainnet
export const GENESIS_ROOT_MEMBER_BASE58 = "TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa";
export const GENESIS_ROOT_MEMBER_HEX = "0x7124b32b48786a13177f3bdc9620e7a48eb9c902";

export const CONTRACT_ADDRESSES = {
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

const newBlock = `export const TESTNET_DEFAULT_ADDRESSES = {
  matrix: "TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o",
  token: "TMg7ZffXNkopbA5KWsq8vUFW5oL5ZqKPbx",
  registry: "TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1",
  vault: "TXn5f6qg8egX1fww3aUAfrpoM3K91Lpq3Q",
  salaryPool: "TQuoEwp5s6G62CYRuQsvziynUQnGsvtucM",
  rewardPool: "TMAiUnfvgchovZ4ffq7BuEPidCd1SxVJBf",
  magicBoxPool: "TAoMXsB2Em1iK9tSqwGaPDL3A7hLHrR8Ue",
  dao: "TVBLDggu9VULMQnxucjftLgg6QfAKN5rUW",
  nft: "TYKwGFyJLnRt9QSh2RuvM2FzeeyxLNz42J",
  legacyDaoV1: "TRoF5D41yYtbjRdxatK38GDjxb2sGnkNFd",
  legacyDaoV2: "TKVdXdghjfPh8jH6Ek6UmWcnaafVkYcyfy",
};

export const MAINNET_DEFAULT_ADDRESSES = {
  matrix: "TCNeVcVAA3H22QxxRsmG2NsXCsk1q3JpFz",
  token: "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
  registry: "TCPJuV7134EpeaBrqkUAWa2uiMa38EJTpN",
  vault: "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J",
  salaryPool: "TQMDkXunFuXDiTqL1HCRgdx47i3AsincjS",
  rewardPool: "TDq8iJSeomNxEJyUAVxvf4iGH2q5f67kJq",
  magicBoxPool: "TCDL237GcsDQ3eP4phaG1iXzc2SMPcXaPG",
  dao: "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2",
  nft: "TYhsf65YRD64Dz5b8CpRsjGzb22ZYtacZj",
  legacyDaoV1: "TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto",
  legacyDaoV2: "TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT",
};

const DEFAULT_ADDRESSES = IS_MAINNET ? MAINNET_DEFAULT_ADDRESSES : TESTNET_DEFAULT_ADDRESSES;

// Genesis Root Matrix Member (#0001) on TrobChain
export const GENESIS_ROOT_MEMBER_BASE58 = "TLHTKgsBRUWfYV8Mo6b4Z3RrJ1k1WLwZWa";
export const GENESIS_ROOT_MEMBER_HEX = "0x7124b32b48786a13177f3bdc9620e7a48eb9c902";

export const CONTRACT_ADDRESSES = {
  matrix: process.env.NEXT_PUBLIC_MATRIX_ADDRESS || DEFAULT_ADDRESSES.matrix,
  token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || DEFAULT_ADDRESSES.token,
  registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || DEFAULT_ADDRESSES.registry,
  vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || DEFAULT_ADDRESSES.vault,
  salaryPool: process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS || DEFAULT_ADDRESSES.salaryPool,
  rewardPool: process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS || DEFAULT_ADDRESSES.rewardPool,
  magicBoxPool: process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS || DEFAULT_ADDRESSES.magicBoxPool,
  dao: process.env.NEXT_PUBLIC_DAO_ADDRESS || DEFAULT_ADDRESSES.dao,
  nft: process.env.NEXT_PUBLIC_NFT_ADDRESS || DEFAULT_ADDRESSES.nft,
};`;

content = content.replace(/\r\n/g, '\n');
const target = oldBlock.replace(/\r\n/g, '\n');
if (content.includes(target)) {
  content = content.replace(target, newBlock.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated CONTRACT_ADDRESSES in apps/web-matrix/lib/contracts.ts');
} else {
  console.log('Target not found in contracts.ts');
}

