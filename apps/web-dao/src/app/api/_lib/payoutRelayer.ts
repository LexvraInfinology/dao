import { ethers } from 'ethers';
import crypto from 'crypto';

const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY || '11555126483d8f687eb1c721788730c65b3e986b302d68fe04eece7dc9382eca';
const FULLNODE_URL = process.env.FULLNODE_URL || 'https://fullnode-one-testnet.trobchain.com';
const DEPLOYER_HEX = '41f3e68b5fb76382683baf1e8512c4c0ab39490717';

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

    const payload = {
      to_address: recipientHex,
      owner_address: DEPLOYER_HEX,
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

    const cleanKey = DEPLOYER_PRIVATE_KEY.startsWith('0x')
      ? DEPLOYER_PRIVATE_KEY
      : `0x${DEPLOYER_PRIVATE_KEY}`;
    const signingKey = new ethers.SigningKey(cleanKey);
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
