/**
 * Utility functions for Trobchain / TRON address conversions.
 * Fully browser-safe and server-safe using ethers.sha256.
 */

import { sha256, getBytes } from 'ethers';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const DEPLOYED_CONTRACTS = {
  EquoraDAO: {
    base58: process.env.NEXT_PUBLIC_DAO_ADDRESS || 'TPiYzJQhBD44xCFNYVrVD4Ur1gaF13nxup',
    hex: (process.env.NEXT_PUBLIC_DAO_HEX || '0x96cc34af00df982ef8260849f1d0747a0de3366e').replace(/^0x/, '41'),
  },
  EquoraToken: {
    base58: 'TFUBj9wdogDvS212LwqMcw5AjxaBcaYjaR',
    hex: '413c53a0ced96d38906e5d8f4e6cd8c8c04b31e7a4',
  },
  EquoraRegistry: {
    base58: 'TVZjYU4M5qUmQMQpx59bNSaKzowUNXG8u5',
    hex: '41d6f20701da8518fadc9d31f6dd9f1dd26cdb0e70',
  },
  EquoraVault: {
    base58: 'TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB',
    hex: '41d1c52987ccd9528457cb81a8b9685d2f15889dbb',
  },
  EquoraMatrix: {
    base58: 'TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE',
    hex: '41e50ec6ce93b6a7f91099ebc7d08c510c7dd3e0b7',
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
  if (clean.startsWith('0x') || clean.startsWith('0X')) {
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
