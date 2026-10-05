declare module 'ethers' {
  export namespace ethers {
    export type AbiCoder = any;
    export type Interface = any;
    export type Contract = any;
    export type Wallet = any;
    export type JsonRpcProvider = any;
    export type BrowserProvider = any;
  }
  export const ethers: any;
  export const version: string;
  export function sha256(data: any): string;
  export function getBytes(value: any, name?: string, copy?: boolean): Uint8Array;
  export function formatUnits(value: any, unit?: string | number): string;
  export function parseUnits(value: string, unit?: string | number): bigint;
  export class Interface {
    constructor(fragments: any);
    decodeFunctionResult(fragment: any, data: any): any;
    encodeFunctionData(fragment: any, values?: any): string;
    [key: string]: any;
  }
  export class AbiCoder {
    encode(types: any[], values: any[]): string;
    decode(types: any[], data: string): any;
    [key: string]: any;
  }
  export class Contract {
    [key: string]: any;
  }
  export class Wallet {
    [key: string]: any;
  }
  export class JsonRpcProvider {
    [key: string]: any;
  }
  export class BrowserProvider {
    [key: string]: any;
  }
  const defaultExport: any;
  export default defaultExport;
}
