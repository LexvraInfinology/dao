import { FULLNODE_RPC_URL } from '@/config/env';
import { getActiveDaoAddress, toTronHex } from './trobAddress';

const KNOWN_ERROR_SELECTORS: Record<string, string> = {
  f499da20: 'PaymentFailed: The deposit amount is invalid or contract rejected the payment value.',
  fb8f41b2: 'PaymentFailed: The deposit amount is invalid or contract rejected the payment value.',
  '7d887110': 'NotCapped: This seat has not reached the 5X earnings cap yet ($1,500 USD). Re-topup is only accepted after reaching the 5X limit.',
  '09786b09': 'RetopupWindowExpired: The 48-hour re-topup window has expired.',
  '291fc442': 'NotMember: This wallet does not own an active council seat.',
  '810074be': 'AlreadyMember: This wallet already owns an active Genesis Council seat. Limit: 1 seat per wallet.',
  '8acb5f27': 'QueueFull: All 100 Genesis Council seats are currently filled.',
  ca7105b4: 'QueueFull: All 100 Genesis Council seats are currently filled.',
  b6330810: 'InvalidReservation: No active reservation found for this wallet.',
  '4e487b71': 'InvalidReservation: No active reservation found for this wallet.',
  bcfcdc11: 'NotQualified: Wallet is not qualified or attested.',
  '82b42900': 'Unauthorized: Caller is not authorized for this operation.',
  '012d817c': 'MigrationClosed: Migration setup is finalized.',
  '6e790153': 'SlotNotBlank: Member slot is not blanked.',
  ce0a747e: 'QueueExpired: Genesis queue period has expired.',
};

export interface SimulationResult {
  canProceed: boolean;
  errorReason?: string;
  energyEstimated?: number;
}

/**
 * Pre-flight EVM dry-run simulation for joinDAO(), retopup(), and completeUnderfundedSeat().
 * Evaluates execution against the live smart contract state before prompting user to sign in TrobSafe.
 */
export async function simulateContractCall(params: {
  functionName: 'joinDAO()' | 'retopup()' | 'completeUnderfundedSeat()' | string;
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
    // Perform dry-run state simulation (without call_value first to avoid balance pre-check failure on read-only node)
    const res = await fetch(`${FULLNODE_RPC_URL}/wallet/triggerconstantcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: hexOwner,
        contract_address: hexContract,
        function_selector: functionName,
        parameter: '',
        call_value: 0,
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
      if (rawMsg.includes('Validate InternalTransfer error') || rawMsg.includes('balance is not sufficient')) {
        return {
          canProceed: false,
          errorReason: 'Insufficient TROB Balance: Your wallet does not have enough TROB tokens to complete this transaction. Please add TROB and try again.',
        };
      }
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

      // Special case: PaymentFailed in a zero-value/simulated dry run is expected because native value is signed by wallet
      // PaymentFailed means all state checks (membership/not full/retopup window/reservation) passed!
      if (selector === 'f499da20' || selector === 'fb8f41b2') {
        return { canProceed: true, energyEstimated: data.energy_used };
      }

      if (selector && KNOWN_ERROR_SELECTORS[selector]) {
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
