import { FULLNODE_RPC_URL, EXPLORER_API_URL } from '@/config/env';
import { getActiveDaoAddress, getActiveDaoHex, isDaoAddressDeprecated } from '@/utils/trobAddress';
import { base58ToHexAddress } from './payoutRelayer';

export interface TxVerificationResult {
  valid: boolean;
  error?: string;
  fromAddr?: string;
  toAddr?: string;
  contractRet?: string;
  blockNumber?: number;
}

/**
 * Validates a transaction receipt strictly against the TrobChain blockchain.
 * Rejects unmined, reverted, out-of-energy, or mismatched contract transactions.
 */
export async function verifyOnChainTransaction(
  txHash: string,
  options?: {
    expectedSender?: string;
    expectedContract?: string;
    maxRetries?: number;
    retryDelayMs?: number;
  }
): Promise<TxVerificationResult> {
  const cleanTx = (txHash || '').trim().replace(/^0x/, '').toLowerCase();
  if (!cleanTx || cleanTx.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(cleanTx)) {
    return {
      valid: false,
      error: 'Invalid transaction hash format. Must be a 64-character hex transaction ID.',
    };
  }

  const activeDaoBase58 = (options?.expectedContract || getActiveDaoAddress()).toLowerCase();
  const activeDaoHex = getActiveDaoHex().toLowerCase();
  const maxRetries = options?.maxRetries ?? 5;
  const retryDelayMs = options?.retryDelayMs ?? 1500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 1. Check FullNode /wallet/gettransactioninfobyid (Real-time mined receipt)
    try {
      const infoRes = await fetch(`${FULLNODE_RPC_URL}/wallet/gettransactioninfobyid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: cleanTx }),
        cache: 'no-store',
      });

      if (infoRes.ok) {
        const info = await infoRes.json();
        if (info && info.id) {
          const receiptResult = info.receipt?.result || (info.result ? 'SUCCESS' : null);
          if (receiptResult === 'REVERT' || receiptResult === 'OUT_OF_ENERGY' || receiptResult === 'FAILED') {
            return {
              valid: false,
              contractRet: receiptResult,
              error: `Transaction reverted on blockchain with status: ${receiptResult}.`,
            };
          }

          // If receipt explicitly succeeded
          if (receiptResult === 'SUCCESS' || info.receipt?.net_usage || info.receipt?.energy_usage_total) {
            // Also fetch transaction body to verify contract target & sender
            const bodyRes = await fetch(`${FULLNODE_RPC_URL}/wallet/gettransactionbyid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value: cleanTx }),
              cache: 'no-store',
            });

            if (bodyRes.ok) {
              const bodyJson = await bodyRes.json();
              const contractParam = bodyJson?.raw_data?.contract?.[0]?.parameter?.value;
              const toAddress = (contractParam?.contract_address || contractParam?.to_address || info.contract_address || '').toLowerCase();
              const fromAddress = (contractParam?.owner_address || '').toLowerCase();

              // Verify target contract
              if (toAddress) {
                if (isDaoAddressDeprecated(toAddress)) {
                  return {
                    valid: false,
                    error: `Transaction was sent to deprecated contract (${toAddress}). Must use active contract (${activeDaoBase58}).`,
                  };
                }
                const toHex = toAddress.startsWith('41') ? toAddress : base58ToHexAddress(toAddress) || toAddress;
                if (toHex !== activeDaoHex && toAddress !== activeDaoBase58) {
                  return {
                    valid: false,
                    error: `Transaction recipient (${toAddress}) does not match active DAO contract (${activeDaoBase58}).`,
                  };
                }
              }

              // Verify sender wallet if required
              if (options?.expectedSender && fromAddress) {
                const expectedClean = options.expectedSender.trim().toLowerCase();
                const expectedHex = (base58ToHexAddress(expectedClean) || expectedClean).toLowerCase();
                if (fromAddress !== expectedClean && fromAddress !== expectedHex) {
                  return {
                    valid: false,
                    error: `Transaction sender does not match connected wallet.`,
                  };
                }
              }

              return {
                valid: true,
                contractRet: 'SUCCESS',
                fromAddr: fromAddress,
                toAddr: toAddress,
                blockNumber: info.blockNumber,
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[TxVerifier] FullNode query attempt ${attempt} notice:`, e);
    }

    // 2. Secondary check via Explorer Backend REST API
    try {
      const expRes = await fetch(`${EXPLORER_API_URL}/transactions/${cleanTx}`, {
        cache: 'no-store',
      });
      if (expRes.ok) {
        const expJson = await expRes.json();
        const tx = expJson?.data;
        if (tx) {
          const retStatus = tx.raw?.ret?.[0]?.contractRet || tx.result;
          if (retStatus === 'REVERT' || tx.result === 'FAILED' || retStatus === 'OUT_OF_ENERGY') {
            return {
              valid: false,
              contractRet: retStatus,
              error: `Transaction reverted on blockchain with status: ${retStatus}.`,
            };
          }

          const toAddr = (tx.to_addr || '').trim().toLowerCase();
          if (toAddr) {
            if (isDaoAddressDeprecated(toAddr)) {
              return {
                valid: false,
                error: `Transaction was sent to deprecated contract (${toAddr}).`,
              };
            }
            if (toAddr !== activeDaoBase58 && toAddr !== activeDaoHex) {
              return {
                valid: false,
                error: `Transaction target does not match active DAO contract.`,
              };
            }
          }

          if (retStatus === 'SUCCESS' || tx.result === 'SUCCESS') {
            return {
              valid: true,
              contractRet: 'SUCCESS',
              fromAddr: tx.from_addr,
              toAddr: tx.to_addr,
              blockNumber: tx.block_number,
            };
          }
        }
      }
    } catch {}

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  return {
    valid: false,
    error: 'Transaction hash could not be verified on the TrobChain blockchain. Please verify the transaction succeeded in TrobSafe.',
  };
}

/**
 * Queries memberPosition(address) directly from the EquoraDAO smart contract on TrobChain.
 * Returns 1 to 100 if the wallet is a verified member on-chain, or 0 if not a member.
 */
export async function getOnChainMemberPosition(
  walletAddress: string,
  contractAddress?: string
): Promise<number> {
  const cleanAddr = (walletAddress || '').trim();
  if (!cleanAddr) return 0;

  const hexOwner = cleanAddr.startsWith('41') ? cleanAddr : (base58ToHexAddress(cleanAddr) || cleanAddr);
  const targetContract = contractAddress || getActiveDaoAddress();
  const hexContract = targetContract.startsWith('41') ? targetContract : (base58ToHexAddress(targetContract) || getActiveDaoHex());

  try {
    const res = await fetch(`${FULLNODE_RPC_URL}/wallet/triggerconstantcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: hexOwner,
        contract_address: hexContract,
        function_selector: 'memberPosition(address)',
        parameter: hexOwner.replace(/^41/, '').padStart(64, '0'),
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.constant_result?.[0]) {
        const pos = parseInt(data.constant_result[0], 16);
        if (Number.isFinite(pos) && pos > 0 && pos <= 100) {
          return pos;
        }
      }
    }
  } catch (err) {
    console.warn('[txVerifier] Failed to query on-chain memberPosition:', err);
  }

  return 0;
}

/**
 * Checks whether an address has joined the DAO contract on-chain.
 */
export async function isMemberOnChain(
  walletAddress: string,
  contractAddress?: string
): Promise<boolean> {
  const pos = await getOnChainMemberPosition(walletAddress, contractAddress);
  return pos > 0;
}

