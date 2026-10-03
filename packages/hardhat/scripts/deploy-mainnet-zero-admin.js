/**
 * EQUORA DAO: MAINNET ZERO-ADMIN (NULL KEY) DEPLOYMENT & VERIFICATION SCRIPT
 *
 * This script automates the deployment of the EquoraDAO sovereign protocol
 * directly to TrobChain Mainnet and permanently renounces administrative privileges
 * to the null address (0x0000000000000000000000000000000000000000).
 *
 * Steps:
 * 1. Checks Deployer Treasury balance on Mainnet.
 * 2. Deploys EquoraDAO ($300 USD entry fee, 5X cap, 100 seats, Soulbound NFT).
 * 3. Wires Vault / Registry dependencies.
 * 4. Calls renounceAdmin() — burning admin privileges forever.
 * 5. Queries contract on-chain to verify admin() === address(0).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

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

// Mainnet RPC Configuration
const MAINNET_RPC_URL = process.env.TROB_MAINNET_RPC || 'https://fullnode.trobchain.com';

async function main() {
  console.log('======================================================================');
  console.log('EQUORA DAO: MAINNET ZERO-ADMIN (NULL KEY) DEPLOYMENT');
  console.log('======================================================================');
  console.log('RPC Endpoint:', MAINNET_RPC_URL);

  const privKey = process.env.MAINNET_DEPLOYER_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!privKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is not configured in .env');
  }

  const deployer = privateKeyToAddress(privKey);
  console.log('Deployer Address (Base58):', deployer.tronBase58);
  console.log('Deployer Address (Hex):   ', deployer.tronHex);

  // 1. Verify Deployer Account & Balance on RPC
  const acctRes = await fetch(`${MAINNET_RPC_URL}/wallet/getaccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: deployer.tronHex }),
  });
  const acctData = await acctRes.json();
  const balanceTrob = (acctData.balance || 0) / 1_000_000;
  console.log(`Deployer Balance:         ${balanceTrob.toLocaleString()} TROB`);

  if (balanceTrob < 50) {
    console.warn('WARNING: Deployer balance is low. Contract deployment requires energy/TROB.');
  }

  // 2. Read Artifact
  const artifactPath = path.resolve(__dirname, '../artifacts/contracts/core/EquoraDAO.sol/EquoraDAO.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('EquoraDAO.json artifact not found. Please compile contracts first.');
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Mainnet Token & Registry Addresses (or Fallbacks)
  const paymentTokenHex = process.env.MAINNET_PAYMENT_TOKEN_HEX || '0x3c53a0ced96d38906e5d8f4e6cd8c8c04b31e7a4';
  const registryHex     = process.env.MAINNET_REGISTRY_HEX      || '0xd6f20701da8518fadc9d31f6dd9f1dd26cdb0e70';

  const coder = new ethers.AbiCoder();
  const constructorParamsHex = coder.encode(['address', 'address'], [paymentTokenHex, registryHex]);

  console.log('\nDeploying EquoraDAO contract to Mainnet...');
  const deployPayload = {
    owner_address: deployer.tronHex,
    fee_limit: 1000000000, // 1000 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ''),
    parameter: constructorParamsHex.replace(/^0x/, ''),
    name: 'EquoraDAO',
  };

  const createRes = await fetch(`${MAINNET_RPC_URL}/wallet/deploycontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deployPayload),
  });
  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`deploycontract failed on Mainnet: ${createData.Error}`);
  }

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log('Contract Address (Hex):   ', contractAddressHex);
  console.log('Contract Address (Base58):', contractAddressBase58);
  console.log('Deployment TX ID:         ', txID);

  // Sign Transaction
  const sig = deployer.signingKey.sign('0x' + txID);
  const vHex = sig.v.toString(16).padStart(2, '0');
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const broadcastRes = await fetch(`${MAINNET_RPC_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...createData,
      signature: [signatureHex],
    }),
  });
  const broadcastData = await broadcastRes.json();
  console.log('Broadcast Result:', broadcastData);

  if (!broadcastData.result) {
    throw new Error(`Broadcast failed: ${broadcastData.message || JSON.stringify(broadcastData)}`);
  }

  console.log('\nWaiting for on-chain block confirmation (15s)...');
  await new Promise((r) => setTimeout(r, 15000));

  // 3. Renounce Admin to Null Key 0x0000000000000000000000000000000000000000
  console.log('\nRenouncing Administrative Privileges to 0x0000000000000000000000000000000000000000...');
  const triggerRes = await fetch(`${MAINNET_RPC_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: contractAddressHex,
      function_selector: 'renounceAdmin()',
      parameter: '',
      fee_limit: 100000000,
      call_value: 0,
    }),
  });
  const triggerData = await triggerRes.json();
  if (triggerData.result && triggerData.transaction) {
    const renounceTxId = triggerData.transaction.txID;
    const rSig = deployer.signingKey.sign('0x' + renounceTxId);
    const rSigHex = rSig.r.slice(2) + rSig.s.slice(2) + rSig.v.toString(16).padStart(2, '0');

    const renounceBroadcast = await fetch(`${MAINNET_RPC_URL}/wallet/broadcasttransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...triggerData.transaction,
        signature: [rSigHex],
      }),
    });
    const rbData = await renounceBroadcast.json();
    console.log('renounceAdmin() Broadcast:', rbData);
    await new Promise((r) => setTimeout(r, 10000));
  }

  // 4. Verify On-Chain Admin Status
  console.log('\nVerifying Zero-Admin Status on Blockchain...');
  const adminCheckRes = await fetch(`${MAINNET_RPC_URL}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: deployer.tronHex,
      contract_address: contractAddressHex,
      function_selector: 'admin()',
      parameter: '',
    }),
  });
  const adminCheckData = await adminCheckRes.json();
  const returnedAdmin = adminCheckData.constant_result?.[0] || '';
  const isZeroAdmin = returnedAdmin.endsWith('0000000000000000000000000000000000000000');

  console.log('On-Chain admin() Result:  ', returnedAdmin);
  console.log('Zero-Admin (Null Key) OK: ', isZeroAdmin ? 'YES (VERIFIED 0x0000000000000000000000000000000000000000)' : 'NO');

  console.log('\n======================================================================');
  console.log('MAINNET DEPLOYMENT SUMMARY');
  console.log('Contract Address (Base58):', contractAddressBase58);
  console.log('Contract Address (Hex):   ', contractAddressHex);
  console.log('Zero-Admin Autonomy:      ', isZeroAdmin ? 'VERIFIED (NO ADMIN / NULL KEY)' : 'PENDING');
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('Deployment Error:', err);
  process.exit(1);
});
