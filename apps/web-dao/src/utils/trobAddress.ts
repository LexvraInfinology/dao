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

export const DEPLOYED_CONTRACTS = {
  EquoraDAO: {
    base58: getActiveDaoAddress(),
    hex: getActiveDaoHex(),
  },
  EquoraToken: {
    base58: process.env.NEXT_PUBLIC_MAINNET_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || 'TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn',
    hex: process.env.NEXT_PUBLIC_MAINNET_TOKEN_HEX || process.env.NEXT_PUBLIC_TOKEN_HEX || '4190b18ab71b5b2b8df3a10c8e52fbdd3ea8f126b9',
  },
  EquoraRegistry: {
    base58: process.env.NEXT_PUBLIC_MAINNET_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || 'TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB',
    hex: process.env.NEXT_PUBLIC_MAINNET_REGISTRY_HEX || process.env.NEXT_PUBLIC_REGISTRY_HEX || '41d045ad50706313f76b4acbaa370258f6a0da1697',
  },
  EquoraVault: {
    base58: process.env.NEXT_PUBLIC_MAINNET_VAULT_ADDRESS || process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw',
    hex: process.env.NEXT_PUBLIC_MAINNET_VAULT_HEX || process.env.NEXT_PUBLIC_VAULT_HEX || '4155f1f42bc35374f5eefda01a4cfa083c21f34f12',
  },
  EquoraMatrix: {
    base58: process.env.NEXT_PUBLIC_MAINNET_MATRIX_ADDRESS || process.env.NEXT_PUBLIC_MATRIX_ADDRESS || 'TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi',
    hex: process.env.NEXT_PUBLIC_MAINNET_MATRIX_HEX || process.env.NEXT_PUBLIC_MATRIX_HEX || '418c05990021d332e01a68c42ce6a7e783a1752d06',
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
