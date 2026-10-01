/**
 * Utility functions for Trobchain / TRON address conversions.
 */

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Browser-safe and Node-safe SHA256 helper
async function sha256Browser(buf: Uint8Array): Promise<Uint8Array> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hash = await window.crypto.subtle.digest('SHA-256', buf as unknown as BufferSource);
    return new Uint8Array(hash);
  }
  // Node.js fallback
  try {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(Buffer.from(buf)).digest();
    return new Uint8Array(hash);
  } catch {
    throw new Error('No crypto implementation available');
  }
}

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

/**
 * Synchronous hex string to Base58Check conversion.
 * Uses SHA-256 fallback if available.
 */
export function hexToBase58Sync(hexStr: string): string {
  if (!hexStr) return '';
  const trimmed = hexStr.trim();
  if (trimmed.startsWith('T') && trimmed.length === 34) {
    return trimmed; // Already Base58
  }

  let clean = trimmed;
  if (clean.startsWith('0x') || clean.startsWith('0X')) {
    clean = '41' + clean.slice(2);
  } else if (!clean.startsWith('41') && clean.length === 40) {
    clean = '41' + clean;
  }

  try {
    const crypto = require('crypto');
    const buf = Buffer.from(clean, 'hex');
    const hash1 = crypto.createHash('sha256').update(buf).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    const checksum = hash2.subarray(0, 4);
    const total = Buffer.concat([buf, checksum]);
    return encode58(new Uint8Array(total));
  } catch {
    // If running purely in client where require is not available, return 41 hex
    return clean;
  }
}

/**
 * Normalizes any address (0x, 41-hex, or Base58) to TrobSafe-native Base58.
 */
export function toTrobBase58(addr?: string): string {
  if (!addr) return '';
  const trimmed = addr.trim();
  if (trimmed.startsWith('T') && trimmed.length === 34) {
    return trimmed;
  }
  return hexToBase58Sync(trimmed);
}

/**
 * Normalizes any address to 41-hex.
 */
export function toTronHex(addr?: string): string {
  if (!addr) return '';
  const trimmed = addr.trim();
  if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
    return '41' + trimmed.slice(2).toLowerCase();
  }
  return trimmed;
}
