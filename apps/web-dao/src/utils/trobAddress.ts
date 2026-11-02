/**
 * Utility functions for Trobchain / TRON address conversions.
 * Fully browser-safe and server-safe using ethers.sha256.
 */

import { sha256, getBytes } from 'ethers';
import { ACTIVE_DAO_CONTRACT_ADDRESS, ACTIVE_DAO_CONTRACT_HEX } from '@/config/env';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const ACTIVE_DAO_BASE58 = ACTIVE_DAO_CONTRACT_ADDRESS;
export const ACTIVE_DAO_HEX = toTronHex(ACTIVE_DAO_CONTRACT_ADDRESS);

export const DEPRECATED_DAO_ADDRESSES = new Set([
  'TP7e2uoSrazAewXUgYnE6EmrtHhhSHWxPT',
  '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4',
  'TPdBQLEny7KYJomg8AqTyU2AtRAKA2PFYf',
  '4195c81b704bcdb7a7196e3707a025265a196d25eb',
  '0x95c81b704bcdb7a7196e3707a025265a196d25eb',
  'TBc5bYAMTSNYDR1NfzdfsKp1S4sBTUdoFs',
  '4111f155a48fd33ebb843ab209e80a96e6a8f49f40',
  '0x11f155a48fd33ebb843ab209e80a96e6a8f49f40',
  'TKabZWeHCVyvVchBY6ESuqEULAj5ptpKJx',
  '41696a85c0583b94e4bec79228b12f726a74f781c3',
  '0x696a85c0583b94e4bec79228b12f726a74f781c3',
  'TPiYzJQhBD44xCFNYVrVD4Ur1gaF13nxup',
  '4196cc34af00df982ef8260849f1d0747a0de3366e',
  '0x96cc34af00df982ef8260849f1d0747a0de3366e',
  'THfWLrRy139LHhfxPLHFuiEqMeiw81FiQD',
  '415467fea66ec96d1d9d0f5063cee941a24eb7e5cf',
  '0x5467fea66ec96d1d9d0f5063cee941a24eb7e5cf',
  'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto',
  '410a59d6a2dcd3b18687c1efe1625642ad85679377',
  '0x0a59d6a2dcd3b18687c1efe1625642ad85679377',
  '0x4b6aB5F819A515382B0dEB6935D793817bB4af28',
  '0x0000000000000000000000000000000000000000',
  '',
]);

export function isDaoAddressDeprecated(addr?: string | null): boolean {
  if (!addr) return true;
  const clean = addr.trim();
  if (DEPRECATED_DAO_ADDRESSES.has(clean)) return true;
  const hex = toTronHex(clean);
  if (DEPRECATED_DAO_ADDRESSES.has(hex)) return true;
  return false;
}

export function getActiveDaoAddress(): string {
  return ACTIVE_DAO_CONTRACT_ADDRESS;
}

export function getActiveDaoHex(): string {
  return toTronHex(ACTIVE_DAO_CONTRACT_ADDRESS);
}

const isMainnetMode = process.env.NEXT_PUBLIC_IS_MAINNET === 'true' || process.env.IS_MAINNET === 'true';

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
    base58: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || (isMainnetMode ? 'TCPJuV7134EpeaBrqkUAWa2uiMa38EJTpN' : 'TG1Jm7BC37CiUm9WKGSM7r57k3BVo5Z5ND'),
    hex: process.env.NEXT_PUBLIC_REGISTRY_HEX || (isMainnetMode ? '411a7f29b91424fd6715c5048b458dcf7beeeaeebc' : '41423664f5cfd3c235777f182b9c88f87d2f32c6bb'),
  },
  EquoraVault: {
    base58: process.env.NEXT_PUBLIC_VAULT_ADDRESS || (isMainnetMode ? 'TUZjyaLc1TghdoccJWTKhoBcEU12AG327J' : 'TTbKnsxHwGiG9u5cvq5TKZMd56TqEtpLCJ'),
    hex: process.env.NEXT_PUBLIC_VAULT_HEX || (isMainnetMode ? '4155f1f42bc35374f5eefda01a4cfa083c21f34f12' : '41c14ec7ecfbe1c04de27ab0f42874c833cad0b066'),
  },
  EquoraMatrix: {
    base58: process.env.NEXT_PUBLIC_MATRIX_ADDRESS || (isMainnetMode ? 'TCNeVcVAA3H22QxxRsmG2NsXCsk1q3JpFz' : 'TB4V7VuvkB3mavbLBkEXPmm9pooX5eKJfA'),
    hex: process.env.NEXT_PUBLIC_MATRIX_HEX || (isMainnetMode ? '411a5f193d5b9654282fed67931d9123c00da9c879' : '410bf7a78782c7e99e6737b833f834ff0762ab2896'),
  },
  EquoraNFT: {
    base58: process.env.NEXT_PUBLIC_NFT_ADDRESS || (isMainnetMode ? 'TSANycxN3mgwxAXLNj7XdhvMvWaXT3WxL9' : 'TRmtmYSpWbgdrHG3n8AufTXnPWvgCwZHGK'),
    hex: process.env.NEXT_PUBLIC_NFT_HEX || (isMainnetMode ? '41b19eea3d6882c5f078b6b4ea54c8286dcd8a1a8d' : '41ad5e377f87994d98fc835c7310e7d9bf1929ad3a'),
  },
  EquoraSalaryPool: {
    base58: process.env.NEXT_PUBLIC_SALARY_POOL_ADDRESS || (isMainnetMode ? 'TEC2wDpRSbPutaP3URY8m3UieE74Muo5T9' : 'TRsbvWsmta6ab9qhjDTohvu5P2xoQy4pLD'),
    hex: process.env.NEXT_PUBLIC_SALARY_POOL_HEX || (isMainnetMode ? '412e4d82014f04221a30ebabbd40afb0ea00083216' : '41ae72a69bf0d302c8891b5eabe20f98fa115e87fc'),
  },
  EquoraRewardPool: {
    base58: process.env.NEXT_PUBLIC_REWARD_POOL_ADDRESS || (isMainnetMode ? 'TF6dsLSRY1G9idqpTEM9Xowvdyp7EgFJWh' : 'TNQirwDJRn9yGS34L5p2nDqF2ctWrQcwJs'),
    hex: process.env.NEXT_PUBLIC_REWARD_POOL_HEX || (isMainnetMode ? '4138404c670f1d63a059277c71d51781c8e95aa25a' : '418874d592e2c7be347232c80ddbb8f8611e29c415'),
  },
  EquoraMagicBox: {
    base58: process.env.NEXT_PUBLIC_MAGIC_BOX_ADDRESS || (isMainnetMode ? 'TStE36Pqa72f8hUdemSjtoi1SxpWmrjaYg' : 'THjcRLiSqxKRhgRVwoZzCTgfrc99qB1qvF'),
    hex: process.env.NEXT_PUBLIC_MAGIC_BOX_HEX || (isMainnetMode ? '41b988ec2cd42c59af8bf358bee611f432e354513d' : '41552ebb5159b039479171057f97656c89c30cd0f1'),
  },
} as const;

function encode58(buffer: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => ALPHABET[d]).join('');
}

function decode58(string: string): Uint8Array | null {
  const bytes = [0];
  for (let i = 0; i < string.length; i++) {
    const c = string[i];
    const value = ALPHABET.indexOf(c);
    if (value === -1) return null;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += value;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < string.length && string[i] === '1'; i++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

/**
 * Normalizes any address (Base58 T..., 0x..., or 41-hex) to clean 41-hex format.
 * Required for TrobSafe RPC triggersmartcontract payloads.
 */
export function toTronHex(addr?: string | null): string {
  if (!addr) return '';
  const trimmed = addr.trim();

  // If already Base58 (T...), decode to 41-hex
  if (trimmed.startsWith('T') && trimmed.length === 34) {
    const decoded = decode58(trimmed);
    if (decoded && decoded.length >= 21) {
      return Array.from(decoded.slice(0, 21))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toLowerCase();
    }
  }

  let clean = trimmed;
  if (clean.startsWith('0x41') || clean.startsWith('0X41')) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0x') || clean.startsWith('0X')) {
    clean = '41' + clean.slice(2);
  } else if (!clean.startsWith('41') && clean.length === 40) {
    clean = '41' + clean;
  }
  return clean.toLowerCase();
}

/**
 * Normalizes any address (0x, 41-hex, or Base58) to TrobSafe-native Base58.
 * Fully compatible with browser runtime.
 */
export function toTrobBase58(addr?: string | null): string {
  if (!addr) return '';
  const trimmed = addr.trim();
  if (trimmed.startsWith('T') && trimmed.length === 34) {
    return trimmed;
  }

  const hex = toTronHex(trimmed);
  if (!hex || hex.length !== 42) return trimmed;

  try {
    const bytes = getBytes('0x' + hex);
    const h1 = sha256(bytes);
    const h2 = sha256(h1);
    const checksum = getBytes(h2).slice(0, 4);
    const total = new Uint8Array(bytes.length + 4);
    total.set(bytes);
    total.set(checksum, bytes.length);
    return encode58(total);
  } catch {
    return trimmed;
  }
}

/**
 * Synchronous hex string to Base58Check conversion.
 */
export function hexToBase58Sync(hexStr: string): string {
  return toTrobBase58(hexStr);
}
