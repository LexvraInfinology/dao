import { FULLNODE_RPC_URL } from '@/config/env';
import { getActiveDaoAddress, toTronHex } from './trobAddress';

const KNOWN_ERROR_SELECTORS: Record<string, string> = {
  fb8f41b2: 'PaymentFailed: The deposit amount is invalid or contract rejected the payment value.',
  '291fc442': 'NotCapped: This seat has not reached the 5X earnings cap yet ($1,500 USD). Re-topup is only accepted after reaching the 5X limit.',
  e2832811: 'AlreadyMember: This wallet already owns an active Genesis Council seat. Limit: 1 seat per wallet.',
  ca7105b4: 'QueueFull: All 100 Genesis Council seats are currently filled.',
  b99335a0: 'RetopupWindowExpired: The 48-hour re-topup window has expired.',
  '4c995576': 'NotMember: This wallet does not own an active council seat.',
  f7c46006: 'Unauthorized: Caller is not authorized for this operation.',
};

export interface SimulationResult {
  canProceed: boolean;
  errorReason?: string;
  energyEstimated?: number;
}

/**
 * Pre-flight EVM dry-run simulation for joinDAO() and retopup().
 * Evaluates execution against the live smart contract state before prompting user to sign in TrobSafe.
 */
export async function simulateContractCall(params: {
  functionName: 'joinDAO()' | 'retopup()';
  ownerAddress: string;
  contractAddress?: string;
  callValueSun?: number;
}): Promise<SimulationResult> {
  const { functionName, ownerAddress, contractAddress, callValueSun } = params;

  if (!ownerAddress) {
    return { canProceed: false, errorReason: 'Wallet address is required for simulation.' };
  }

  const hexOwner = toTronHex(ownerAddress);
  const targetContract = contractAddress || getActiveDaoAddress();
  const hexContract = toTronHex(targetContract);

  try {
    const res = await fetch(`${FULLNODE_RPC_URL}/wallet/triggerconstantcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: hexOwner,
        contract_address: hexContract,
        function_selector: functionName,
        parameter: '',
        call_value: callValueSun || 0,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[Simulation] RPC node returned HTTP', res.status);
      // If node query fails due to network, let wallet popup handle confirmation
      return { canProceed: true };
    }

    const data = await res.json();

    // Check for CONTRACT_VALIDATE_ERROR
    if (data.result?.code === 'CONTRACT_VALIDATE_ERROR') {
      let rawMsg = data.result.message || '';
      try {
        if (/^[0-9a-fA-F]+$/.test(rawMsg)) {
          const ascii = Buffer.from(rawMsg, 'hex').toString('utf8');
          if (ascii) rawMsg = ascii;
        }
      } catch {}
      return {
        canProceed: false,
        errorReason: `Node Pre-flight Validation: ${rawMsg}`,
      };
    }

    // Check for EVM REVERT
    const isFailed = data.transaction?.ret?.[0]?.ret === 'FAILED';
    const isRevert =
      data.result?.message &&
      (data.result.message.includes('524556455254') || data.result.message.includes('REVERT'));

    if (isFailed || isRevert) {
      const rawHex = data.constant_result?.[0] || '';
      const selector = rawHex.slice(0, 8).toLowerCase();

      if (selector && KNOWN_ERROR_SELECTORS[selector]) {
        // Special case: PaymentFailed with call_value: 0 is expected in a zero-value dry run
        // If testing joinDAO with call_value: 0, PaymentFailed means all state checks (not already member, queue not full) passed!
        if (selector === 'fb8f41b2' && (!callValueSun || callValueSun === 0) && functionName === 'joinDAO()') {
          return { canProceed: true, energyEstimated: data.energy_used };
        }

        return {
          canProceed: false,
          errorReason: KNOWN_ERROR_SELECTORS[selector],
        };
      }

      // Try decoding standard Error(string) selector 08c379a0
      if (rawHex.startsWith('08c379a0') && rawHex.length >= 136) {
        try {
          const strBytes = Buffer.from(rawHex.slice(136), 'hex').toString('utf8').replace(/\0/g, '');
          if (strBytes.trim()) {
            return {
              canProceed: false,
              errorReason: `Contract Reverted: ${strBytes.trim()}`,
            };
          }
        } catch {}
      }

      return {
        canProceed: false,
        errorReason: `Smart contract pre-flight simulation failed (${selector || 'Unknown revert'}). Transaction would revert on-chain.`,
      };
    }

    return {
      canProceed: true,
      energyEstimated: data.energy_used,
    };
  } catch (err: unknown) {
    console.warn('[Simulation] Error executing pre-flight simulation:', err);
    // Non-blocking fallback
    return { canProceed: true };
  }
}
