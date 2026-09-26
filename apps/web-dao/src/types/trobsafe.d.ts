/**
 * TrobSafe Wallet — browser window injection type definitions.
 * The extension injects `window.trob` (also aliased as window.trobkit / window.trobLink)
 * via trobsafe-inpage.js loaded as a content script.
 */

export interface TrobAddress {
  /** Trobium native base58 address (e.g. TXkxxxxxxxxxxx) */
  base58: string;
  /** EVM-compatible hex address (0x…) */
  hex: string;
}

export interface TrobDetails {
  address: TrobAddress;
  balance?: string;
  network?: string;
}

export interface TrobRequestParams {
  method: string;
  params?: unknown[];
}

export interface TrobSmartContractPayload {
  contract_address: string;
  function_selector: string;
  parameter?: string;
  call_value?: number;
  fee_limit?: number;
  owner_address?: string;
}

export interface TrobEventListeners {
  [event: string]: Array<(data: unknown) => void>;
}

export interface TrobWalletAPI {
  /** true when the extension is installed and the inpage script has run */
  ready: boolean;
  installed: boolean;
  /** Current default address (populated after connect) */
  defaultAddress: TrobAddress;
  /** trx alias for TronLink-shaped dApps */
  trx: { signMessageV2: (message: string) => Promise<string> };

  /** Request wallet account details (triggers permission dialog if first time) */
  getDetails(): Promise<TrobDetails>;

  /** Generic JSON-RPC style request */
  request(params: TrobRequestParams): Promise<unknown>;

  /** Sign arbitrary transaction data */
  signdata(transaction: unknown): Promise<[boolean, string]>;

  /**
   * Sign a plain-text message (used for SIWE login).
   * Returns the 0x… hex signature string.
   */
  signMessageV2(message: string): Promise<string>;

  /**
   * Send native TROB tokens.
   * @param to  - recipient base58 address
   * @param amount - amount in SUN (1 TROB = 1_000_000 SUN)
   */
  sendTrob(to: string, amount: number): Promise<unknown>;

  /**
   * Build, sign, and broadcast a smart-contract call.
   * Used for: seat minting (EquoraDAO), withdrawals (EquoraVault).
   */
  triggersmartcontract(
    payload: TrobSmartContractPayload | TrobSmartContractPayload[]
  ): Promise<{ txid: string; result: boolean }>;

  /** Legacy typo alias */
  triggersmartContact(
    payload: TrobSmartContractPayload | TrobSmartContractPayload[]
  ): Promise<{ txid: string; result: boolean }>;

  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback: (data: unknown) => void): void;
  emit(event: string, data: unknown): void;
  _eventListeners: TrobEventListeners;
}

declare global {
  interface Window {
    trob?: TrobWalletAPI;
    trobkit?: TrobWalletAPI;
    trobLink?: TrobWalletAPI;
    __trobsafeBridge?: boolean;
  }
}
