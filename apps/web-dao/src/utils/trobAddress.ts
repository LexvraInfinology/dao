/**
 * Utility functions for Trobchain / TRON address conversions.
 * Fully browser-safe and server-safe using ethers.sha256.
 */

import { sha256, getBytes } from 'ethers';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const DEPLOYED_CONTRACTS = {
  EquoraDAO: {
    base58: 'TLrAb4JDCwoPRd5sd3rvvqRnup99i1e5qn',
    hex: '41775474f9cda2509e1887f029f5e9ee6ac15e1f23',
  },
  EquoraToken: {
    base58: 'TBeK724evPPgx5gASBuLPvJVpwzQiq3w8S',
    hex: '41125d714facc00d824dfcd50cc48872353f54c791',
  },
  EquoraRegistry: {
    base58: 'TMjsweQf3Nch5edNNRHv1Y6oB3AvDZQdox',
    hex: '41811c313f952ed77609b71094a7966994c3889cb9',
  },
  EquoraVault: {
    base58: 'TPdrgna9oJLohys2hjtK4s9YLpMXSbcRL4',
    hex: '4195e8e6494358c1e861d52fd2bee2a5ff0001cfbb',
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
