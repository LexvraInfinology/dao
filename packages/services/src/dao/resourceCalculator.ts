/**
 * Resource Calculation Service for EQUORA_Fi DAO & User Matrix
 *
 * Implements the Dynamic Calculation Formula specified in "EQUORA_Fi — Deposit Logics":
 * - DAO Target: 50 free eligible transactions/day
 * - User Matrix Target: 5 free eligible transactions/day
 * - Energy & Bandwidth are calculated independently
 * - Outputs are dynamic outputs of the formula, not hardcoded protocol constants.
 */

export interface NetworkResourceParams {
  energyPerTx: number;        // e.g. 46,009
  bandwidthPerTx: number;     // e.g. 378
  energyPerTrob: number;      // e.g. 2,150 Energy generated per staked TROB
  bandwidthPerTrob: number;   // e.g. 80 Bandwidth generated per staked TROB
  updatedAt: string;
}

export interface ResourceRequirement {
  targetTxPerDay: number;
  dailyEnergyRequired: number;
  dailyBandwidthRequired: number;
  energyStakeTrob: number;
  bandwidthStakeTrob: number;
  totalStakeTrob: number;
}

export interface DynamicFormulaResult {
  params: NetworkResourceParams;
  dao: ResourceRequirement;
  matrix: ResourceRequirement;
  officialSrAddress: string;
  minWalletCreationDate: string; // '2026-10-01T00:00:00.000Z'
}

// Default baseline parameters from PDF
export const DEFAULT_NETWORK_PARAMS: NetworkResourceParams = {
  energyPerTx: 46_009,
  bandwidthPerTx: 378,
  energyPerTrob: 2_150,
  bandwidthPerTrob: 80,
  updatedAt: new Date().toISOString(),
};

export const OFFICIAL_EQUORA_SR = 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY';
export const MIN_WALLET_CREATION_DATE = '2026-10-01T00:00:00.000Z';
export const MIN_WALLET_CREATION_TIMESTAMP = new Date(MIN_WALLET_CREATION_DATE).getTime();

// In-memory modifiable parameters (management can update dynamically)
let activeParams: NetworkResourceParams = { ...DEFAULT_NETWORK_PARAMS };

export function updateNetworkParams(newParams: Partial<NetworkResourceParams>): NetworkResourceParams {
  activeParams = {
    ...activeParams,
    ...newParams,
    updatedAt: new Date().toISOString(),
  };
  return activeParams;
}

export function getNetworkParams(): NetworkResourceParams {
  return activeParams;
}

/**
 * Calculates dynamic resource requirements for a given transaction target.
 * Formula:
 * Daily Energy = Target × Energy/Tx
 * Daily Bandwidth = Target × Bandwidth/Tx
 * Energy Stake TROB = CEIL(Daily Energy / Energy/TROB)
 * Bandwidth Stake TROB = CEIL(Daily Bandwidth / Bandwidth/TROB)
 */
export function calculateResourceRequirement(targetTxPerDay: number, params = activeParams): ResourceRequirement {
  const dailyEnergyRequired = targetTxPerDay * params.energyPerTx;
  const dailyBandwidthRequired = targetTxPerDay * params.bandwidthPerTx;

  const energyStakeTrob = Math.ceil(dailyEnergyRequired / params.energyPerTrob);
  const bandwidthStakeTrob = Math.ceil(dailyBandwidthRequired / params.bandwidthPerTrob);

  return {
    targetTxPerDay,
    dailyEnergyRequired,
    dailyBandwidthRequired,
    energyStakeTrob,
    bandwidthStakeTrob,
    totalStakeTrob: energyStakeTrob + bandwidthStakeTrob,
  };
}

/**
 * Returns complete dynamic formula evaluation for both DAO (50 tx) and User Matrix (5 tx).
 */
export function getDynamicFormulaEvaluation(): DynamicFormulaResult {
  const dao = calculateResourceRequirement(50, activeParams);
  const matrix = calculateResourceRequirement(5, activeParams);

  return {
    params: activeParams,
    dao,
    matrix,
    officialSrAddress: OFFICIAL_EQUORA_SR,
    minWalletCreationDate: MIN_WALLET_CREATION_DATE,
  };
}
