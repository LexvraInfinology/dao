const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../apps/web-dao/src/utils/trobAddress.ts');
let content = fs.readFileSync(file, 'utf8');

const oldBlock = `export const DEPLOYED_CONTRACTS = {
  EquoraDAO: {
    base58: getActiveDaoAddress(),
    hex: getActiveDaoHex(),
  },
  EquoraToken: {
    base58: process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || 'TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn',
    hex: process.env.NEXT_PUBLIC_MAINNET_TOKEN_HEX || process.env.NEXT_PUBLIC_TOKEN_HEX || '4190b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9',
  },
  EquoraRegistry: {
    base58: process.env.NEXT_PUBLIC_MAINNET_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || 'TCPJuV7134EpeaBrqkUAWa2uiMa38EJTpN',
    hex: process.env.NEXT_PUBLIC_MAINNET_REGISTRY_HEX || process.env.NEXT_PUBLIC_REGISTRY_HEX || '411a7f29b91424fd6715c5048b458dcf7beeeaeebc',
  },
  EquoraVault: {
    base58: process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS || process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'TUZjyaLc1TghdoccJWTKhoBcEU12AG327J',
    hex: process.env.NEXT_PUBLIC_MAINNET_VAULT_HEX || process.env.NEXT_PUBLIC_VAULT_HEX || '4155f1f42bc35374f5eefda01a4cfa083c21f34f12',
  },
  EquoraMatrix: {
    base58: process.env.NEXT_PUBLIC_MAINNET_MATRIX_ADDRESS || process.env.NEXT_PUBLIC_MATRIX_ADDRESS || 'TCNeVcVAA3H22QxxRsmG2NsXCsk1q3JpFz',
    hex: process.env.NEXT_PUBLIC_MAINNET_MATRIX_HEX || process.env.NEXT_PUBLIC_MATRIX_HEX || '411a5f193d5b9654282fed67931d9123c00da9c879',
  },
  EquoraNFT: {
    base58: process.env.NEXT_PUBLIC_MAINNET_NFT_ADDRESS || process.env.NEXT_PUBLIC_NFT_ADDRESS || 'TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9',
    hex: process.env.NEXT_PUBLIC_MAINNET_NFT_HEX || process.env.NEXT_PUBLIC_NFT_HEX || '41b19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d',
  },
  EquoraSalaryPool: {
    base58: process.env.NEXT_PUBLIC_MAINNET_SALARY_POOL_ADDRESS || process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS || 'TEC2wDpRSbPutaP3URY8m3UieE74Muo5T9',
    hex: process.env.NEXT_PUBLIC_MAINNET_SALARY_POOL_HEX || process.env.NEXT_PUBLIC_SALARY_POOL_HEX || '412e4d82014f04221a30ebabbd40afb0ea00083216',
  },
  EquoraRewardPool: {
    base58: process.env.NEXT_PUBLIC_MAINNET_REWARD_POOL_ADDRESS || process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS || 'TF6dsLSRY1G9idqpTEM9Xowvdyp7EgFJWh',
    hex: process.env.NEXT_PUBLIC_MAINNET_REWARD_POOL_HEX || process.env.NEXT_PUBLIC_REWARD_POOL_HEX || '4138404c670f1d63a059277c71d51781c8e95aa25a',
  },
  EquoraMagicBox: {
    base58: process.env.NEXT_PUBLIC_MAINNET_MAGIC_BOX_ADDRESS || process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS || 'TStE36Pqa72f8hUdemSjtoi1SxpWmrjaYg',
    hex: process.env.NEXT_PUBLIC_MAINNET_MAGIC_BOX_HEX || process.env.NEXT_PUBLIC_MAGIC_BOX_HEX || '41b988ec2cd42c59af8bf358bee611f432e354513d',
  },
} as const;`;

const newBlock = `const isMainnetMode = process.env.NEXT_PUBLIC_IS_MAINNET === 'true' || process.env.IS_MAINNET === 'true';

export const DEPLOYED_CONTRACTS = {
  EquoraDAO: {
    base58: getActiveDaoAddress(),
    hex: getActiveDaoHex(),
  },
  EquoraToken: {
    base58: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || (isMainnetMode ? 'TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn' : 'TMg7ZffXNkopbA5KWsq8vUFW5oL5ZqKPbx'),
    hex: process.env.NEXT_PUBLIC_TOKEN_HEX || (isMainnetMode ? '4190b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9' : '418065e61914497415e464cbc7b67eadb10d13f569'),
  },
  EquoraRegistry: {
    base58: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || (isMainnetMode ? 'TCPJuV7134EpeaBrqkUAWa2uiMa38EJTpN' : 'TDeTkVTHDv8i9aHi1eZBMUPSvuReypxAw1'),
    hex: process.env.NEXT_PUBLIC_REGISTRY_HEX || (isMainnetMode ? '411a7f29b91424fd6715c5048b458dcf7beeeaeebc' : '412854e95c847472bb7130baf5f3d9363dcee5fe18'),
  },
  EquoraVault: {
    base58: process.env.NEXT_PUBLIC_VAULT_ADDRESS || (isMainnetMode ? 'TUZjyaLc1TghdoccJWTKhoBcEU12AG327J' : 'TXn5f6qg8egX1fww3aUAfrpoM3K91Lpq3Q'),
    hex: process.env.NEXT_PUBLIC_VAULT_HEX || (isMainnetMode ? '4155f1f42bc35374f5eefda01a4cfa083c21f34f12' : '41ef380fa5abfba8a057e1df49c0f6b3d6b24280ee'),
  },
  EquoraMatrix: {
    base58: process.env.NEXT_PUBLIC_MATRIX_ADDRESS || (isMainnetMode ? 'TCNeVcVAA3H22QxxRsmG2NsXCsk1q3JpFz' : 'TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o'),
    hex: process.env.NEXT_PUBLIC_MATRIX_HEX || (isMainnetMode ? '411a5f193d5b9654282fed67931d9123c00da9c879' : '418919e11e219e81d9f510947f9d4f9e9ac04f4cc6'),
  },
  EquoraNFT: {
    base58: process.env.NEXT_PUBLIC_NFT_ADDRESS || (isMainnetMode ? 'TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9' : 'TYKwGFyJLnRt9QSh2RuvM2FzeeyxLNz42J'),
    hex: process.env.NEXT_PUBLIC_NFT_HEX || (isMainnetMode ? '41b19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d' : '41f53e5d75a6d93e2a0c441c562dbf3332c41bfc0c'),
  },
  EquoraSalaryPool: {
    base58: process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS || (isMainnetMode ? 'TEC2wDpRSbPutaP3URY8m3UieE74Muo5T9' : 'TQuoEwp5s6G62CYRuQsvziynUQnGsvtucM'),
    hex: process.env.NEXT_PUBLIC_SALARY_POOL_HEX || (isMainnetMode ? '412e4d82014f04221a30ebabbd40afb0ea00083216' : '41a3e4cdf6a90b3b3a57ce716c1882bd20eb1aa830'),
  },
  EquoraRewardPool: {
    base58: process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS || (isMainnetMode ? 'TF6dsLSRY1G9idqpTEM9Xowvdyp7EgFJWh' : 'TMAiUnfvgchovZ4ffq7BuEPidCd1SxVJBf'),
    hex: process.env.NEXT_PUBLIC_REWARD_POOL_HEX || (isMainnetMode ? '4138404c670f1d63a059277c71d51781c8e95aa25a' : '417ad690f733b9f8a83aba72b4fd4b86ce0c4ba76c'),
  },
  EquoraMagicBox: {
    base58: process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS || (isMainnetMode ? 'TStE36Pqa72f8hUdemSjtoi1SxpWmrjaYg' : 'TAoMXsB2Em1iK9tSqwGaPDL3A7hLHrR8Ue'),
    hex: process.env.NEXT_PUBLIC_MAGIC_BOX_HEX || (isMainnetMode ? '41b988ec2cd42c59af8bf358bee611f432e354513d' : '41091b166dd91ead929d45f0125942382cc59bb250'),
  },
} as const;`;

content = content.replace(/\r\n/g, '\n');
const normalizedOld = oldBlock.replace(/\r\n/g, '\n');
if (content.includes(normalizedOld)) {
  content = content.replace(normalizedOld, newBlock.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully patched apps/web-dao/src/utils/trobAddress.ts');
} else {
  console.error('Target block not found in trobAddress.ts');
}

