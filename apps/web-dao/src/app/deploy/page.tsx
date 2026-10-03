'use client';

import React, { useState } from 'react';
import { useTrobWallet } from '@/hooks/useTrobWallet';
import {
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  AlertTriangle,
  Rocket,
  Shield,
  FileCode2,
  RefreshCw,
} from 'lucide-react';

interface DeployedContractInfo {
  contractName: string;
  contractAddressBase58: string;
  contractAddressHex: string;
  txHash: string;
  verifyUrl: string;
  flattenedSolFile: string;
  solcVersion: string;
  optimizationRuns: number;
  license: string;
}

export default function DeployPage() {
  const { address, isConnected, connect, base58Address } = useTrobWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [loadingContract, setLoadingContract] = useState<string | null>(null);
  const [deployedContracts, setDeployedContracts] = useState<Record<string, DeployedContractInfo>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const deploySingle = async (name: string, extraParams: Record<string, string> = {}) => {
    if (!privateKey.trim()) {
      setErrorMsg('Please enter your TrobSafe private key to sign the deployment transaction.');
      return;
    }
    setErrorMsg(null);
    setLoadingContract(name);

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName: name,
          privateKey: privateKey.trim(),
          network: 'mainnet',
          extraParams,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Deployment failed');
      }

      setDeployedContracts((prev) => ({
        ...prev,
        [name]: data,
      }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Deployment error');
    } finally {
      setLoadingContract(null);
    }
  };

  const deployAllSequence = async () => {
    if (!privateKey.trim()) {
      setErrorMsg('Please enter your TrobSafe private key to sign the deployment.');
      return;
    }
    setErrorMsg(null);

    try {
      // 1. EquoraToken
      setLoadingContract('EquoraToken');
      const res1 = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractName: 'EquoraToken', privateKey: privateKey.trim(), network: 'mainnet' }),
      });
      const data1 = await res1.json();
      if (!res1.ok || data1.error) throw new Error(`EquoraToken failed: ${data1.error}`);
      setDeployedContracts((prev) => ({ ...prev, EquoraToken: data1 }));

      // 2. EquoraRegistry
      setLoadingContract('EquoraRegistry');
      const res2 = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractName: 'EquoraRegistry', privateKey: privateKey.trim(), network: 'mainnet' }),
      });
      const data2 = await res2.json();
      if (!res2.ok || data2.error) throw new Error(`EquoraRegistry failed: ${data2.error}`);
      setDeployedContracts((prev) => ({ ...prev, EquoraRegistry: data2 }));

      // 3. EquoraDAO
      setLoadingContract('EquoraDAO');
      const res3 = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName: 'EquoraDAO',
          privateKey: privateKey.trim(),
          network: 'mainnet',
          extraParams: {
            tokenAddress: data1.contractAddressHex,
            registryAddress: data2.contractAddressHex,
          },
        }),
      });
      const data3 = await res3.json();
      if (!res3.ok || data3.error) throw new Error(`EquoraDAO failed: ${data3.error}`);
      setDeployedContracts((prev) => ({ ...prev, EquoraDAO: data3 }));

      // 4. EquoraVault
      setLoadingContract('EquoraVault');
      const res4 = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName: 'EquoraVault',
          privateKey: privateKey.trim(),
          network: 'mainnet',
          extraParams: {
            tokenAddress: data1.contractAddressHex,
            registryAddress: data2.contractAddressHex,
          },
        }),
      });
      const data4 = await res4.json();
      if (!res4.ok || data4.error) throw new Error(`EquoraVault failed: ${data4.error}`);
      setDeployedContracts((prev) => ({ ...prev, EquoraVault: data4 }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Sequence deployment error');
    } finally {
      setLoadingContract(null);
    }
  };

  const contractsList = [
    {
      name: 'EquoraToken',
      symbol: 'EQR',
      desc: 'Platform utility token ($300 DAO, $30 Matrix entries, 10M initial supply).',
      fileName: 'EquoraToken.sol',
    },
    {
      name: 'EquoraRegistry',
      symbol: 'REGISTRY',
      desc: 'Member directory, sponsor uplines, rank tracking, and address resolution.',
      fileName: 'EquoraRegistry.sol',
    },
    {
      name: 'EquoraDAO',
      symbol: 'DAO',
      desc: 'Seat governance, voting cycles, and treasury pool execution.',
      fileName: 'EquoraDAO.sol',
    },
    {
      name: 'EquoraVault',
      symbol: 'VAULT',
      desc: 'Locked treasury vault, multi-signature release schedules, and rewards safety.',
      fileName: 'EquoraVault.sol',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070E28] text-white p-6 sm:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Trobchain Testnet Fullnode Connected
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Contract Deployer & Explorer Verifier
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Deploy authentic on-chain smart contracts to Trobchain and verify them on Trobium Explorer with one click.
            </p>
          </div>

          <div>
            {!isConnected ? (
              <button
                onClick={connect}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Connect TrobSafe
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                Wallet: <span className="text-emerald-400 font-semibold">{base58Address || address?.hex}</span>
              </div>
            )}
          </div>
        </div>

        {/* Why Explorer verification failed explanation alert */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            Why did &quot;Verification Failed: Contract not found&quot; happen on Trobium Explorer?
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            The web page at <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">testnet.trobchain.com/contracts/deploy</code> is a client-side mock demo that generates fake placeholder addresses (like <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">T6FE5XBMOabcdefghijklmnopqrstuvwxy</code>) without actually broadcasting any transaction.
          </p>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Because that address was never written to the blockchain, the verification backend rejects it. Deploying here writes the bytecode directly to the real Trobchain testnet node so the explorer can verify it immediately!
          </p>
        </div>

        {/* Private Key Input */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              TrobSafe Deployer Private Key
            </label>
            <span className="text-xs text-slate-400">
              Exported from your funded TrobSafe account (20,000 TROB)
            </span>
          </div>

          <div className="flex gap-3">
            <input
              type="password"
              placeholder="Enter your private key (starts with 0x... or 64 hex chars)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={deployAllSequence}
              disabled={loadingContract !== null || !privateKey.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {loadingContract ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deploying {loadingContract}...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  1-Click Deploy All (4 Contracts)
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 gap-6">
          {contractsList.map((contract, idx) => {
            const deployed = deployedContracts[contract.name];
            const isDeploying = loadingContract === contract.name;

            return (
              <div
                key={contract.name}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
                        0{idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-white">{contract.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                        {contract.symbol}
                      </span>
                      {deployed && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Deployed on-chain
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 pl-10">{contract.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 pl-10 sm:pl-0">
                    <a
                      href={`/api/contracts/flattened/${contract.fileName}`}
                      download
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .sol
                    </a>

                    {!deployed && (
                      <button
                        onClick={() => deploySingle(contract.name)}
                        disabled={loadingContract !== null || !privateKey.trim()}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                      >
                        {isDeploying ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Broadcasting...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-3.5 h-3.5" />
                            Deploy {contract.name}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {deployed && (
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Real On-Chain Contract Address (Base58)
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm font-mono text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20">
                            {deployed.contractAddressBase58}
                          </code>
                          <button
                            onClick={() =>
                              handleCopy(deployed.contractAddressBase58, `addr-${contract.name}`)
                            }
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title="Copy Address"
                          >
                            {copiedKey === `addr-${contract.name}` ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Transaction Hash
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono text-slate-300 bg-black/40 px-2.5 py-1 rounded border border-white/5 truncate max-w-[260px]">
                            {deployed.txHash}
                          </code>
                          <button
                            onClick={() => handleCopy(deployed.txHash, `tx-${contract.name}`)}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title="Copy Tx Hash"
                          >
                            {copiedKey === `tx-${contract.name}` ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Verification Box */}
                    <div className="pt-3 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="text-xs text-slate-300 space-y-1">
                        <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                          <FileCode2 className="w-4 h-4" />
                          Verification Parameters on Trobium Explorer:
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Compiler: <strong className="text-slate-200">v0.8.25</strong></span>
                          <span>Optimization: <strong className="text-slate-200">Yes (200)</strong></span>
                          <span>License: <strong className="text-slate-200">MIT</strong></span>
                          <span>Contract: <strong className="text-slate-200">{contract.name}</strong></span>
                        </div>
                      </div>

                      <a
                        href={deployed.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 whitespace-nowrap"
                      >
                        Verify on Trobium Explorer
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
