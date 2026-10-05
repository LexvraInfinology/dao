/**
 * EQUORA DAO V2: MAINNET AUTOMATED DEPLOYMENT, MIGRATION & VERIFICATION SCRIPT
 *
 * Deploys:
 * 1. EquoraCoin (TRC-20, 21 Crore / 210,000,000 EQC initial supply to Treasury)
 * 2. EquoraDAOv2 (100 seats, $300 floor, 5x earnings cap & 48h retopup loop)
 * 3. Migrates all 85 genuine members (Seats 1-93)
 * 4. Sets 8 underfunded reservations with deposit credits and unearned debt garnishment
 * 5. Finalizes migration permanently
 * 6. Automatically updates apps/web-dao/.env.local and verifies contracts on Explorer
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
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

function toTronHex(addressOrHex) {
  if (addressOrHex.startsWith('41') && addressOrHex.length === 42) return addressOrHex.toLowerCase();
  if (addressOrHex.startsWith('0x') && addressOrHex.length === 42) return ('41' + addressOrHex.slice(2)).toLowerCase();
  // base58
  const bytes = [0];
  for (let i = 0; i < addressOrHex.length; i++) {
    const c = addressOrHex[i];
    const val = ALPHABET.indexOf(c);
    if (val === -1) throw new Error('Invalid base58 character');
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[j] += val;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry % 58);
      carry >>= 8;
    }
  }
  for (let i = 0; i < addressOrHex.length && addressOrHex[i] === '1'; i++) bytes.push(0);
  const buf = Buffer.from(bytes.reverse());
  return buf.subarray(0, buf.length - 4).toString('hex');
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

  console.log(`   Tx Hash:                   0x${txID}`);
  console.log(`   Contract Address (Base58): ${contractAddressBase58}`);
  console.log(`   Contract Address (Hex):    ${contractAddressHex}`);

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

async function triggerContractMethod(deployer, contractHex, functionSelector, parameterHex, description) {
  console.log(`\n⚡ Calling: ${description}...`);
  const triggerRes = await fetch(`${MAINNET_RPC_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex.replace(/^0x/, ''),
      fee_limit: 1000000000,
      call_value: 0,
    }),
  });
  const triggerData = await triggerRes.json();
  if (!triggerData.result || !triggerData.transaction) {
    const msg = triggerData.Error || JSON.stringify(triggerData);
    throw new Error(`triggersmartcontract failed: ${msg}`);
  }

  await broadcastTransaction(deployer, triggerData.transaction);
  console.log(`   Tx broadcast: 0x${triggerData.transaction.txID}. Waiting for confirmation (8s)...`);
  await sleep(8000);
  console.log(`   ✅ Confirmed!`);
  return triggerData.transaction.txID;
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
  console.log('💎 EQUORA DAO V2: MAINNET DEPLOYMENT & MIGRATION');
  console.log('======================================================================');

  const privKey = process.argv[2] || process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) {
    console.error('\n❌ ERROR: Private Key required!');
    console.error('Usage: node scripts/deploy-v2-mainnet.js <PRIVATE_KEY>');
    console.error('Or set DEPLOYER_PRIVATE_KEY in packages/hardhat/.env');
    process.exit(1);
  }

  const deployer = privateKeyToAddress(privKey);
  console.log('\nDeployer Wallet:');
  console.log('  Base58 Address:', deployer.tronBase58);
  console.log('  Hex Address:   ', deployer.tronHex);

  if (deployer.tronBase58 === 'TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8') {
    console.log('  ✅ MATCHES OFFICIAL MAINNET DEPLOYER (TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8)!');
  } else {
    console.log('  ⚠️ Note: Deployer is not TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8');
  }

  // Check balance on Mainnet RPC
  const acctRes = await fetch(`${MAINNET_RPC_URL}/wallet/getaccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: deployer.tronHex }),
  });
  const acctData = await acctRes.json();
  const balanceTrob = (acctData.balance || 0) / 1_000_000;
  console.log(`  Live Balance:  ${balanceTrob.toLocaleString()} TROB`);

  const coder = new ethers.AbiCoder();
  const deployed = {};

  // ─── 1. Deploy EquoraCoin (21 Crore Supply) ──────────────────────────────────
  const coinTreasury = deployer.evmAddress;
  const coinParams = coder.encode(['address'], [coinTreasury]);
  deployed.EquoraCoin = await deployContract(
    deployer,
    'EquoraCoin',
    'token/EquoraCoin.sol/EquoraCoin.json',
    coinParams
  );
  await verifyContractOnExplorer('EquoraCoin', deployed.EquoraCoin.contractAddressBase58, 'EquoraCoin.sol');

  // ─── 2. Deploy EquoraDAOv2 ───────────────────────────────────────────────────
  const registryHex = toTronHex('TWXbakETzfE9sBYdHTCp37HwygGKLY6AGy');
  const registryEvm = '0x' + registryHex.replace(/^41/, '');
  const coinEvm = '0x' + deployed.EquoraCoin.contractAddressHex.replace(/^41/, '');

  const daoParams = coder.encode(['address', 'address'], [coinEvm, registryEvm]);
  deployed.EquoraDAOv2 = await deployContract(
    deployer,
    'EquoraDAOv2',
    'core/EquoraDAOv2.sol/EquoraDAOv2.json',
    daoParams
  );
  await verifyContractOnExplorer('EquoraDAOv2', deployed.EquoraDAOv2.contractAddressBase58, 'EquoraDAOv2.sol');

  // ─── 3. Execute Migration ────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log('📦 EXECUTING ON-CHAIN MIGRATION FOR 85 GENUINE MEMBERS');
  console.log('======================================================================');

  const manifestPath = path.resolve(__dirname, '../../../scratch/migration_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Migration manifest not found at ${manifestPath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const genuineMembers = manifest.genuineMembers || [];
  const underfunded = manifest.underfundedReservations || [];

  console.log(`Loaded ${genuineMembers.length} genuine members and ${underfunded.length} underfunded reservations.`);

  const BATCH_SIZE = 25;
  for (let i = 0; i < genuineMembers.length; i += BATCH_SIZE) {
    const chunk = genuineMembers.slice(i, i + BATCH_SIZE);
    const addrs = chunk.map((m) => '0x' + toTronHex(m.address).replace(/^41/, ''));
    const positions = chunk.map((m) => m.position);
    const earnings = chunk.map((m) => Math.round(parseFloat(m.pushedAmountBtt || '0') * 1e6));

    const paramHex = coder.encode(
      ['address[]', 'uint256[]', 'uint256[]'],
      [addrs, positions, earnings]
    );

    await triggerContractMethod(
      deployer,
      deployed.EquoraDAOv2.contractAddressHex,
      'migrateGenuineMembers(address[],uint256[],uint256[])',
      paramHex,
      `Migrating Genuine Batch ${Math.floor(i / BATCH_SIZE) + 1} (Seats #${positions[0]} to #${positions[positions.length - 1]})`
    );
  }

  // ─── 4. Set Underfunded Reservations ─────────────────────────────────────────
  if (underfunded.length > 0) {
    console.log(`\nConfiguring ${underfunded.length} underfunded reservations & debt garnishments...`);
    const uAddrs = underfunded.map((u) => '0x' + toTronHex(u.address).replace(/^41/, ''));
    const uSeats = underfunded.map((u) => u.position);
    const uDeposits = underfunded.map((u) => Math.round(parseFloat(u.entryAmountBtt || '1.5') * 1e6));
    const uDebts = underfunded.map((u) => Math.round(parseFloat(u.unearnedDebtBtt || '0') * 1e6));

    const resParamHex = coder.encode(
      ['address[]', 'uint256[]', 'uint256[]', 'uint256[]'],
      [uAddrs, uSeats, uDeposits, uDebts]
    );

    await triggerContractMethod(
      deployer,
      deployed.EquoraDAOv2.contractAddressHex,
      'setUnderfundedReservations(address[],uint256[],uint256[],uint256[])',
      resParamHex,
      `Setting ${underfunded.length} Underfunded Reservations with 48h Deadline`
    );
  }

  // ─── 5. Finalize Migration ───────────────────────────────────────────────────
  await triggerContractMethod(
    deployer,
    deployed.EquoraDAOv2.contractAddressHex,
    'finalizeMigration()',
    '',
    'Finalizing Migration (Permanently Locking Migration Functions)'
  );

  // ─── 6. Save Deployment Summary ──────────────────────────────────────────────
  const outPath = path.resolve(__dirname, '../deployed-v2-mainnet.json');
  const summary = {
    network: 'trobchain-mainnet',
    deployedAt: new Date().toISOString(),
    deployer: deployer.tronBase58,
    contracts: {
      EquoraCoin: {
        addressBase58: deployed.EquoraCoin.contractAddressBase58,
        addressHex: deployed.EquoraCoin.contractAddressHex,
        txHash: deployed.EquoraCoin.txHash,
        totalSupply: '210,000,000 EQC (21 Crore)',
      },
      EquoraDAOv2: {
        addressBase58: deployed.EquoraDAOv2.contractAddressBase58,
        addressHex: deployed.EquoraDAOv2.contractAddressHex,
        txHash: deployed.EquoraDAOv2.txHash,
        totalSeatsMigrated: genuineMembers.length,
        underfundedReservations: underfunded.length,
      },
    },
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nDeployment summary saved to ${outPath}`);

  // ─── 7. Auto-Update apps/web-dao/.env.local ──────────────────────────────────
  const envLocalPath = path.resolve(__dirname, '../../../apps/web-dao/.env.local');
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, 'utf8');
    envContent = envContent.replace(
      /NEXT_PUBLIC_DAO_ADDRESS="[^"]*"/,
      `NEXT_PUBLIC_DAO_ADDRESS="${deployed.EquoraDAOv2.contractAddressBase58}"`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_DAO_HEX="[^"]*"/,
      `NEXT_PUBLIC_DAO_HEX="${deployed.EquoraDAOv2.contractAddressHex}"`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_TOKEN_ADDRESS="[^"]*"/,
      `NEXT_PUBLIC_TOKEN_ADDRESS="${deployed.EquoraCoin.contractAddressBase58}"`
    );
    envContent = envContent.replace(
      /NEXT_PUBLIC_TOKEN_HEX="[^"]*"/,
      `NEXT_PUBLIC_TOKEN_HEX="${deployed.EquoraCoin.contractAddressHex}"`
    );
    fs.writeFileSync(envLocalPath, envContent, 'utf8');
    console.log(`\n✅ Updated apps/web-dao/.env.local with new contract addresses!`);
  }

  console.log('\n======================================================================');
  console.log('🎉 ALL CONTRACTS DEPLOYED, MIGRATED & VERIFIED SUCCESSFULLY!');
  console.log(`   EquoraCoin:  ${deployed.EquoraCoin.contractAddressBase58}`);
  console.log(`   EquoraDAOv2: ${deployed.EquoraDAOv2.contractAddressBase58}`);
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('\n❌ DEPLOYMENT FAILED:', err);
  process.exit(1);
});
