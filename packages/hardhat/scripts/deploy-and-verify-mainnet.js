/**
 * EQUORA DAO: MAINNET AUTOMATED DEPLOYMENT & VERIFICATION SCRIPT (DAO EXCLUSIVE)
 *
 * Deploys ONLY the DAO Core Stack:
 * 1. EquoraRegistry (Root Referrer: TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8)
 * 2. EquoraToken (Platform TRB-20 Token)
 * 3. EquoraDAO (Sovereign Governance, 100 Seats, $300 Entry, 5X Cap, Auto-NFT)
 * 4. Permanently Renounces Admin -> 0x0000000000000000000000000000000000000000 (Null Key)
 * 5. Automatically Verifies and Publishes all contracts on Trobium Explorer (https://backend.trobchain.com/v1/contracts/verify)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../apps/web-dao/.env.local') });
require('dotenv').config();

const MAINNET_RPC_URL = process.env.TROB_MAINNET_RPC || 'https://fullnode-one.trobchain.com';
const MAINNET_BACKEND_URL = process.env.TROB_MAINNET_BACKEND || 'https://backend.trobchain.com';
const SOLC_VERSION = 'v0.8.26+commit.8a97fa7a';
const OPTIMIZER_RUNS = 200;

// Base58Check Helpers
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encode58(buffer) {
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

function hexToBase58(hexStr) {
  const clean = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
  const buf = Buffer.from(clean, 'hex');
  const h1 = crypto.createHash('sha256').update(buf).digest();
  const h2 = crypto.createHash('sha256').update(h1).digest();
  const checksum = h2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

function privateKeyToAddress(privKeyHex) {
  const clean = privKeyHex.startsWith('0x') ? privKeyHex : '0x' + privKeyHex;
  const wallet = new ethers.Wallet(clean);
  const evmAddress = wallet.address.toLowerCase();
  const tronHex = '41' + evmAddress.slice(2);
  const tronBase58 = hexToBase58(tronHex);
  return { evmAddress, tronHex, tronBase58, signingKey: new ethers.SigningKey(clean) };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function broadcastTransaction(deployer, createData) {
  const txID = createData.txID;
  const sig = deployer.signingKey.sign('0x' + txID);
  const vHex = sig.v.toString(16).padStart(2, '0');
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetch(`${MAINNET_RPC_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...createData,
      signature: [signatureHex],
    }),
  });
  const data = await res.json();
  if (!data.result) {
    const errMsg = data.message ? Buffer.from(data.message, 'hex').toString('utf8') : JSON.stringify(data);
    throw new Error(`Broadcast failed: ${errMsg}`);
  }
  return data;
}

async function deployContract(deployer, contractName, artifactSubpath, encodedParams) {
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`🚀 Deploying: ${contractName}...`);
  const artifactPath = path.resolve(__dirname, '../artifacts/contracts', artifactSubpath);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}. Please run hardhat compile.`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const deployPayload = {
    owner_address: deployer.tronHex,
    fee_limit: 1000000000, // 1000 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ''),
    parameter: encodedParams.replace(/^0x/, ''),
    name: contractName,
  };

  const createRes = await fetch(`${MAINNET_RPC_URL}/wallet/deploycontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deployPayload),
  });
  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`deploycontract failed for ${contractName}: ${createData.Error}`);
  }

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log(`   TxID:            ${txID}`);
  console.log(`   Address (Base58): ${contractAddressBase58}`);
  console.log(`   Address (Hex):    ${contractAddressHex}`);

  await broadcastTransaction(deployer, createData);
  console.log(`   Waiting for block inclusion (10s)...`);
  await sleep(10000);

  return {
    contractName,
    contractAddressBase58,
    contractAddressHex,
    txHash: '0x' + txID,
  };
}

async function verifyContractOnExplorer(contractName, addressBase58, flattenedFilename) {
  console.log(`   Verifying on Trobium Explorer: ${contractName} (${addressBase58})...`);
  const flattenedPath = path.resolve(__dirname, '../contracts-flattened', flattenedFilename);
  if (!fs.existsSync(flattenedPath)) {
    console.warn(`   Warning: Flattened file not found at ${flattenedPath}`);
    return false;
  }
  const sourceCode = fs.readFileSync(flattenedPath, 'utf8');

  try {
    const res = await fetch(`${MAINNET_BACKEND_URL}/v1/contracts/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: addressBase58,
        sourceCode: sourceCode,
        contractName: contractName,
        compilerVersion: SOLC_VERSION,
        optimizer: {
          enabled: true,
          runs: OPTIMIZER_RUNS,
        },
      }),
    });

    const data = await res.json();
    if (res.ok && data.data && data.data.verified) {
      console.log(`   ✅ VERIFIED & PUBLISHED on Explorer: https://trobchain.com/contracts/verify?address=${addressBase58}`);
      return true;
    } else {
      console.log(`   Explorer verification status:`, data?.error?.message || data?.message || data);
      return false;
    }
  } catch (err) {
    console.error(`   Verification request error:`, err.message);
    return false;
  }
}

async function main() {
  console.log('======================================================================');
  console.log('EQUORA DAO: MAINNET SOVEREIGN ZERO-ADMIN DEPLOYMENT');
  console.log('======================================================================');
  console.log('Mainnet Fullnode RPC:', MAINNET_RPC_URL);
  console.log('Explorer Backend:    ', MAINNET_BACKEND_URL);

  const privKey = process.env.MAINNET_DEPLOYER_KEY || process.argv[2];
  if (!privKey) {
    console.error('\n❌ ERROR: Private Key required!');
    process.exit(1);
  }

  const deployer = privateKeyToAddress(privKey);
  console.log('\nDeployer Wallet:');
  console.log('  Base58 Address:', deployer.tronBase58);
  console.log('  Hex Address:   ', deployer.tronHex);

  // Check balance on Mainnet RPC
  const acctRes = await fetch(`${MAINNET_RPC_URL}/wallet/getaccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: deployer.tronHex }),
  });
  const acctData = await acctRes.json();
  const balanceTrob = (acctData.balance || 0) / 1_000_000;
  console.log(`  Live Balance:  ${balanceTrob.toLocaleString()} TROB`);

  if (balanceTrob < 50) {
    throw new Error(`Insufficient TROB balance (${balanceTrob} TROB). Need at least 50 TROB.`);
  }

  const coder = new ethers.AbiCoder();
  const deployed = {};

  // 1. Deploy EquoraRegistry (_root = deployer address)
  const registryParams = coder.encode(['address'], [deployer.evmAddress]);
  deployed.EquoraRegistry = await deployContract(
    deployer,
    'EquoraRegistry',
    'core/EquoraRegistry.sol/EquoraRegistry.json',
    registryParams
  );
  await verifyContractOnExplorer('EquoraRegistry', deployed.EquoraRegistry.contractAddressBase58, 'EquoraRegistry.sol');

  // 2. Deploy EquoraToken (_treasury = deployer address)
  const tokenParams = coder.encode(['address'], [deployer.evmAddress]);
  deployed.EquoraToken = await deployContract(
    deployer,
    'EquoraToken',
    'token/EquoraToken.sol/EquoraToken.json',
    tokenParams
  );
  await verifyContractOnExplorer('EquoraToken', deployed.EquoraToken.contractAddressBase58, 'EquoraToken.sol');

  // 3. Deploy EquoraDAO (takes PaymentToken + Registry)
  const daoParams = coder.encode(
    ['address', 'address'],
    [deployed.EquoraToken.contractAddressHex.replace(/^41/, '0x'), deployed.EquoraRegistry.contractAddressHex.replace(/^41/, '0x')]
  );
  deployed.EquoraDAO = await deployContract(
    deployer,
    'EquoraDAO',
    'core/EquoraDAO.sol/EquoraDAO.json',
    daoParams
  );
  await verifyContractOnExplorer('EquoraDAO', deployed.EquoraDAO.contractAddressBase58, 'EquoraDAO.sol');

  // 4. Renounce Admin to 0x0000000000000000000000000000000000000000 (Zero Admin / Autonomous)
  console.log(`\nRenouncing DAO Admin Privileges to address(0)...`);
  const renounceRes = await fetch(`${MAINNET_RPC_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: deployed.EquoraDAO.contractAddressHex,
      function_selector: 'renounceAdmin()',
      parameter: '',
      fee_limit: 100000000,
      call_value: 0,
    }),
  });
  const renounceData = await renounceRes.json();
  if (renounceData.result && renounceData.transaction) {
    await broadcastTransaction(deployer, renounceData.transaction);
    console.log('  ✅ renounceAdmin() executed! DAO is now completely autonomous (admin = 0x0000000000000000000000000000000000000000)');
    await sleep(6000);
  }

  // 5. Query on-chain admin to confirm
  const adminCheckRes = await fetch(`${MAINNET_RPC_URL}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: deployed.EquoraDAO.contractAddressHex,
      function_selector: 'admin()',
      parameter: '',
    }),
  });
  const adminCheckData = await adminCheckRes.json();
  const returnedAdmin = adminCheckData.constant_result?.[0] || '';
  const isZeroAdmin = returnedAdmin.endsWith('0000000000000000000000000000000000000000');
  console.log('  On-chain admin verification:', isZeroAdmin ? 'SUCCESS (0x0000...0000)' : returnedAdmin);

  // 6. Save deployed addresses
  const outPath = path.resolve(__dirname, '../deployed-trobchain-mainnet.json');
  const summary = {
    network: 'trobchain-mainnet',
    deployer: deployer.tronBase58,
    deployedAt: new Date().toISOString(),
    contracts: deployed,
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));

  console.log('\n======================================================================');
  console.log('🎉 DAO MAINNET DEPLOYMENT & VERIFICATION COMPLETE!');
  console.log('Summary:');
  console.log(`  EquoraRegistry: ${deployed.EquoraRegistry.contractAddressBase58}`);
  console.log(`  EquoraToken:    ${deployed.EquoraToken.contractAddressBase58}`);
  console.log(`  EquoraDAO:      ${deployed.EquoraDAO.contractAddressBase58}`);
  console.log(`  Zero-Admin:     ${isZeroAdmin ? 'VERIFIED (NULL KEY)' : 'CHECK NEEDED'}`);
  console.log('Saved to: packages/hardhat/deployed-trobchain-mainnet.json');
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('\n❌ Deployment Script Error:', err);
  process.exit(1);
});
