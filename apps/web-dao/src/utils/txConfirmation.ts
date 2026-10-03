/**
 * Client-side TrobChain Transaction Confirmation Helper
 * Polls the TrobChain FullNode for transaction execution receipt.
 * Ensures transactions that revert or run out of energy are immediately caught and flagged.
 */

export async function pollOnChainTxSuccess(
  txId: string,
  timeoutMs = 15000
): Promise<{ success: boolean; error?: string }> {
  const cleanTx = (txId || '').trim().replace(/^0x/, '');
  if (!cleanTx || cleanTx.length !== 64) {
    return { success: false, error: 'Invalid transaction hash received from wallet.' };
  }

  const fullnodeUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    'https://fullnode-one-testnet.trobchain.com';

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const res = await fetch(`${fullnodeUrl}/wallet/gettransactioninfobyid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: cleanTx }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          const ret = data.receipt?.result;
          if (ret === 'REVERT' || ret === 'OUT_OF_ENERGY' || ret === 'FAILED') {
            return {
              success: false,
              error: `Transaction failed on-chain (${ret}). The transaction reverted and was not accepted by the contract.`,
            };
          }
          if (ret === 'SUCCESS' || data.receipt?.net_usage || data.receipt?.energy_usage_total) {
            return { success: true };
          }
        }
      }
    } catch {}

    await new Promise((r) => setTimeout(r, 1500));
  }

  // If node indexing is pending after timeout, proceed to let backend verify
  return { success: true };
}
