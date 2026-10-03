import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { FULLNODE_RPC_URL, EXPLORER_BASE_URL } from '@/config/env';

// ─── Base58Check Helpers ───────────────────────────────────────────────────────
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encode58(buffer: Buffer): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      digits[j] += carry;
      carry = (digits[j] / 58) | 0;
      digits[j] %= 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => ALPHABET[d]).join('');
}

function hexToBase58(hexStr: string): string {
  const clean = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
  const buf = Buffer.from(clean, 'hex');
  const hash1 = crypto.createHash('sha256').update(buf).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

function privateKeyToAddress(privKeyHex: string) {
  const clean = privKeyHex.startsWith('0x') ? privKeyHex : '0x' + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = '41' + evmAddress.slice(2);
  const tronBase58 = hexToBase58(tronHex);
  return { evmAddress, tronHex, tronBase58 };
}

const FULLNODE_URL = FULLNODE_RPC_URL;

const CONTRACT_CONFIGS: Record<
  string,
  {
    artifactSubpath: string;
    flattenedPath: string;
    buildParams: (coder: ethers.AbiCoder, deployerEvm: string, extra: Record<string, string>) => string;
  }
> = {
  EquoraToken: {
    artifactSubpath: 'token/EquoraToken.sol/EquoraToken.json',
    flattenedPath: 'EquoraToken.sol',
    buildParams: (coder, deployerEvm) => {
      return coder.encode(['address'], [deployerEvm]).replace(/^0x/, '');
    },
  },
  EquoraRegistry: {
    artifactSubpath: 'core/EquoraRegistry.sol/EquoraRegistry.json',
    flattenedPath: 'EquoraRegistry.sol',
    buildParams: (coder, deployerEvm) => {
      return coder.encode(['address'], [deployerEvm]).replace(/^0x/, '');
    },
  },
  EquoraDAO: {
    artifactSubpath: 'core/EquoraDAO.sol/EquoraDAO.json',
    flattenedPath: 'EquoraDAO.sol',
    buildParams: (coder, _, extra) => {
      const token = extra.tokenAddress?.startsWith('0x') ? extra.tokenAddress : '0x' + extra.tokenAddress?.slice(2);
      const registry = extra.registryAddress?.startsWith('0x') ? extra.registryAddress : '0x' + extra.registryAddress?.slice(2);
      return coder.encode(['address', 'address'], [token, registry]).replace(/^0x/, '');
    },
  },
  EquoraVault: {
    artifactSubpath: 'core/EquoraVault.sol/EquoraVault.json',
    flattenedPath: 'EquoraVault.sol',
    buildParams: (coder, _, extra) => {
      const token = extra.tokenAddress?.startsWith('0x') ? extra.tokenAddress : '0x' + extra.tokenAddress?.slice(2);
      const registry = extra.registryAddress?.startsWith('0x') ? extra.registryAddress : '0x' + extra.registryAddress?.slice(2);
      return coder.encode(['address', 'address'], [token, registry]).replace(/^0x/, '');
    },
  },
  EquoraMatrix: {
    artifactSubpath: 'core/EquoraMatrix.sol/EquoraMatrix.json',
    flattenedPath: 'EquoraMatrix.sol',
    buildParams: (coder, _, extra) => {
      const token = extra.tokenAddress?.startsWith('0x') ? extra.tokenAddress : '0x' + extra.tokenAddress?.slice(2);
      const registry = extra.registryAddress?.startsWith('0x') ? extra.registryAddress : '0x' + extra.registryAddress?.slice(2);
      const dao = extra.daoAddress?.startsWith('0x') ? extra.daoAddress : '0x' + extra.daoAddress?.slice(2);
      return coder.encode(['address', 'address', 'address'], [token, registry, dao]).replace(/^0x/, '');
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractName, privateKey, extraParams = {} } = body;

    if (!contractName || !CONTRACT_CONFIGS[contractName]) {
      return NextResponse.json({ error: `Invalid contract name: ${contractName}` }, { status: 400 });
    }

    if (!privateKey || privateKey.length < 60) {
      return NextResponse.json({ error: 'Valid private key is required to sign the on-chain deployment' }, { status: 400 });
    }

    const { evmAddress, tronHex, tronBase58 } = privateKeyToAddress(privateKey);
    const config = CONTRACT_CONFIGS[contractName];

    // Find artifact
    const artifactPath = path.resolve(
      process.cwd(),
      '..',
      '..',
      'packages',
      'hardhat',
      'artifacts',
      'contracts',
      config.artifactSubpath
    );

    if (!fs.existsSync(artifactPath)) {
      return NextResponse.json(
        { error: `Artifact not found at ${artifactPath}. Please run npx hardhat compile first.` },
        { status: 500 }
      );
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const coder = new ethers.AbiCoder();
    const encodedParams = config.buildParams(coder, evmAddress, extraParams);

    const payload = {
      owner_address: tronHex,
      fee_limit: 1000000000, // 1000 TROB
      call_value: 0,
      consume_user_resource_percent: 100,
      origin_energy_limit: 10000000,
      abi: JSON.stringify(artifact.abi),
      bytecode: artifact.bytecode.replace(/^0x/, ''),
      parameter: encodedParams,
      name: contractName,
    };

    // 1. Call fullnode deploycontract
    const createRes = await fetch(`${FULLNODE_URL}/wallet/deploycontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const createData = await createRes.json();
    if (createData.Error) {
      return NextResponse.json({ error: `DeployContract API error: ${createData.Error}` }, { status: 400 });
    }

    const txID = createData.txID;
    const contractAddressHex = createData.contract_address;
    const contractAddressBase58 = hexToBase58(contractAddressHex);

    // 2. Sign the transaction
    const cleanPrivKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
    const signingKey = new ethers.SigningKey(cleanPrivKey);
    const sig = signingKey.sign('0x' + txID);
    const vHex = sig.v.toString(16).padStart(2, '0');
    const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

    const broadcastPayload = {
      txID: txID,
      raw_data: createData.raw_data,
      raw_data_hex: createData.raw_data_hex,
      signature: [signatureHex],
    };

    // 3. Broadcast to Trobchain node
    const isMainnet = body.network === 'mainnet' || process.env.NEXT_PUBLIC_TARGET_NETWORK === 'mainnet';
    const targetRpc = isMainnet ? 'https://fullnode-one.trobchain.com' : FULLNODE_URL;
    const targetBackend = isMainnet ? 'https://backend.trobchain.com' : 'https://testnet-backend.trobchain.com';
    const targetExplorer = isMainnet ? 'https://trobchain.com' : EXPLORER_BASE_URL;

    const broadcastRes = await fetch(`${targetRpc}/wallet/broadcasttransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcastPayload),
    });

    const broadcastData = await broadcastRes.json();
    if (!broadcastData.result) {
      const errMsg = broadcastData.message
        ? Buffer.from(broadcastData.message, 'hex').toString('utf8')
        : JSON.stringify(broadcastData);
      return NextResponse.json({ error: `Broadcast failed: ${errMsg}` }, { status: 400 });
    }

    // 4. Automatic Verification on Trobium Explorer
    let isVerified = false;
    try {
      const flattenedPath = path.resolve(
        process.cwd(),
        '..',
        '..',
        'packages',
        'hardhat',
        'contracts-flattened',
        config.flattenedPath
      );
      if (fs.existsSync(flattenedPath)) {
        const sourceCode = fs.readFileSync(flattenedPath, 'utf8');
        const verifyRes = await fetch(`${targetBackend}/v1/contracts/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: contractAddressBase58,
            sourceCode: sourceCode,
            contractName: contractName,
            compilerVersion: 'v0.8.26+commit.8a97fa7a',
            optimizer: {
              enabled: true,
              runs: 200,
            },
          }),
        });
        const vData = await verifyRes.json();
        isVerified = !!(vData?.data?.verified);
      }
    } catch (vErr) {
      console.warn('Auto-verify error:', vErr);
    }

    const verifyUrl = `${targetExplorer}/contracts/verify?address=${contractAddressBase58}`;

    return NextResponse.json({
      success: true,
      contractName,
      contractAddressBase58,
      contractAddressHex,
      txHash: '0x' + txID,
      deployer: tronBase58,
      verifyUrl,
      verified: isVerified,
      flattenedSolFile: config.flattenedPath,
      solcVersion: 'v0.8.26+commit.8a97fa7a',
      optimizationRuns: 200,
      license: 'MIT',
    });
  } catch (err: any) {
    console.error('Deploy error:', err);
    return NextResponse.json({ error: err.message || 'Deployment failed' }, { status: 500 });
  }
}
