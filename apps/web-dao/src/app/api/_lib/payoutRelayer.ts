import { ethers } from 'ethers';
import crypto from 'crypto';
import { FULLNODE_RPC_URL } from '@/config/env';

const FULLNODE_URL = FULLNODE_RPC_URL;

function getDeployerWallet(): { key: string; hexAddress: string } | null {
  let rawKey = (process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY)?.trim();
  if (!rawKey && typeof process !== 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const candidates = [
        path.resolve(process.cwd(), '.env.local'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
        path.resolve(process.cwd(), '../.env'),
        path.resolve(__dirname, '../../../../.env'),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          const lines = fs.readFileSync(cand, 'utf8').split('\n');
          for (const line of lines) {
            const match = line.match(/^DEPLOYER_PRIVATE_KEY\s*=\s*(.+)$/);
            if (match) {
              rawKey = match[1].trim().replace(/^["']|["']$/g, '');
              break;
            }
          }
          if (rawKey) break;
        }
      }
    } catch {}
  }
  if (!rawKey) return null;
  const cleanKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
  try {
    const wallet = new ethers.Wallet(cleanKey);
    return {
      key: cleanKey,
      hexAddress: '41' + wallet.address.slice(2).toLowerCase(),
    };
  } catch {
    return null;
  }
}

export function base58ToHexAddress(base58: string): string | null {
  const clean = base58.trim();
  if (/^41[0-9a-fA-F]{40}$/.test(clean)) {
    return clean.toLowerCase();
  }
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(clean)) {
    return null;
  }
  try {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const bytes: number[] = [0];
    for (const c of clean) {
      let val = ALPHABET.indexOf(c);
      if (val === -1) break;
      for (let i = 0; i < bytes.length; i++) {
        val += bytes[i] * 58;
        bytes[i] = val & 0xff;
        val >>= 8;
      }
      while (val > 0) {
        bytes.push(val & 0xff);
        val >>= 8;
      }
    }
    for (const c of clean) {
      if (c === '1') bytes.push(0);
      else break;
    }
    const raw = Buffer.from(bytes.reverse().slice(0, 21)).toString('hex');
    return raw.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Broadcasts a native TROB transfer on TrobChain testnet from deployer treasury
 */
export async function broadcastNativePayout(
  recipientAddress: string,
  amountTrob: number
): Promise<string | null> {
  try {
    if (!amountTrob || amountTrob <= 0) return null;

    const recipientHex = base58ToHexAddress(recipientAddress);
    if (!recipientHex) {
      console.error('[Payout Relayer] Failed to convert recipient to hex:', recipientAddress);
      return null;
    }

    const amountSun = Math.round(amountTrob * 1_000_000);
    if (amountSun <= 0) return null;

    const deployer = getDeployerWallet();
    if (!deployer) {
      console.warn('[Payout Relayer] DEPLOYER_PRIVATE_KEY not configured. Payout relayer inactive.');
      return null;
    }

    const payload = {
      to_address: recipientHex,
      owner_address: deployer.hexAddress,
      amount: amountSun,
    };

    const res = await fetch(`${FULLNODE_URL}/wallet/createtransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const tx = (await res.json()) as any;
    if (!tx || !tx.txID) {
      console.error('[Payout Relayer] Createtransaction failed:', tx);
      return null;
    }

    const signingKey = new ethers.SigningKey(deployer.key);
    const sig = signingKey.sign(`0x${tx.txID}`);
    const vHex = sig.v.toString(16).padStart(2, '0');
    const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

    const bRes = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txID: tx.txID,
        raw_data: tx.raw_data,
        raw_data_hex: tx.raw_data_hex,
        signature: [signatureHex],
      }),
    });
    const bData = (await bRes.json()) as any;
    console.log(
      `[Payout Relayer] Transfer payout broadcasted (${amountTrob} TROB -> ${recipientAddress}):`,
      bData
    );
    return tx.txID as string;
  } catch (err: unknown) {
    console.error('[Payout Relayer] Failed to broadcast native payout:', err);
    return null;
  }
}
