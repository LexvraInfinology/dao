import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ethers } from 'ethers';
import bs58 from 'bs58';

const FULLNODE_URL = 'https://fullnode-one-testnet.trobchain.com';
const USER_KEY = 'd729c3fce80e3e831a7167efbe9e7b768f0bf8cb2ee4dfe87559208cb9a7a0a0';
const SENDER_ADDR = 'TKRWSwmKSpLB85V26MPEWbwCWqXR9aPzNf';
const SENDER_HEX = '4167b282b09c3aac1b9fbff6b4ec14ea2b72573c02';

// Token, Registry, Vault addresses
const PAYMENT_TOKEN_HEX = '0x3c53a0ced96d38906e5d8f4e6cd8c8c04b31e7a4'; // TFUBj9wdogDvS212LwqMcw5AjxaBcaYjaR
const REGISTRY_HEX = '0xd6f20701da8518fadc9d31f6dd9f1dd26cdb0e70';      // TVZjYU4M5qUmQMQpx59bNSaKzowUNXG8u5
const VAULT_HEX = '0xd1c52987ccd9528457cb81a8b9685d2f15889dbb';         // TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB

function hexToBase58(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const addressHex = clean.length === 40 ? '41' + clean : clean;
  const buffer = Buffer.from(addressHex, 'hex');
  const hash1 = crypto.createHash('sha256').update(buffer).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.slice(0, 4);
  return bs58.encode(Buffer.concat([buffer, checksum]));
}

async function signAndBroadcast(txID, rawData, rawDataHex, privKeyHex) {
  const clean = privKeyHex.startsWith('0x') ? privKeyHex : `0x${privKeyHex}`;
  const signingKey = new ethers.SigningKey(clean);
  const sig = signingKey.sign(`0x${txID}`);
  const vHex = sig.v.toString(16).padStart(2, '0');
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const payload = {
    txID,
    raw_data: rawData,
    raw_data_hex: rawDataHex,
    signature: [signatureHex],
  };

  const res = await fetch(`${FULLNODE_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

async function main() {
  console.log('===============================================================');
  console.log('DEPLOYING FRESH EquoraDAO SMART CONTRACT TO TROBCHAIN TESTNET');
  console.log('Deployer Wallet:', SENDER_ADDR, `(${SENDER_HEX})`);
  console.log('===============================================================\n');

  // Load compiled artifact
  const artifactPath = path.resolve(
    process.cwd(),
    'packages/hardhat/artifacts/contracts/core/EquoraDAO.sol/EquoraDAO.json'
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found at ${artifactPath}`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const coder = new ethers.AbiCoder();
  const constructorParamsHex = coder
    .encode(['address', 'address'], [PAYMENT_TOKEN_HEX, REGISTRY_HEX])
    .replace(/^0x/, '');

  console.log('1. Submitting deploycontract to Trobchain fullnode...');

  const deployPayload = {
    owner_address: SENDER_HEX,
    fee_limit: 1000000000, // 1000 TROB
    call_value: 0,
    consume_user_resource_percent: 100,
    origin_energy_limit: 10000000,
    abi: JSON.stringify(artifact.abi),
    bytecode: artifact.bytecode.replace(/^0x/, ''),
    parameter: constructorParamsHex,
    name: 'EquoraDAO',
  };

  const createRes = await fetch(`${FULLNODE_URL}/wallet/deploycontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deployPayload),
  });

  const createData = await createRes.json();
  if (createData.Error) {
    throw new Error(`deploycontract failed: ${createData.Error}`);
  }

  const txID = createData.txID;
  const contractAddressHex = createData.contract_address;
  const contractAddressBase58 = hexToBase58(contractAddressHex);

  console.log(`   Tx ID: ${txID}`);
  console.log(`   Contract Hex: ${contractAddressHex}`);
  console.log(`   Contract Base58: ${contractAddressBase58}`);

  console.log('\n2. Signing and broadcasting deployment transaction...');
  const broadcastResult = await signAndBroadcast(
    txID,
    createData.raw_data,
    createData.raw_data_hex,
    USER_KEY
  );

  console.log('   Broadcast Result:', broadcastResult);
  if (!broadcastResult.result) {
    throw new Error(`Broadcast failed: ${JSON.stringify(broadcastResult)}`);
  }

  console.log('\n3. Waiting 6 seconds for block confirmation on-chain...');
  await new Promise((r) => setTimeout(r, 6000));

  // Wire setVaultContract
  console.log('\n4. Wiring setVaultContract on new EquoraDAO...');
  try {
    const vaultParamHex = coder.encode(['address'], [VAULT_HEX]).replace(/^0x/, '');
    const triggerRes = await fetch(`${FULLNODE_URL}/wallet/triggersmartcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: SENDER_HEX,
        contract_address: contractAddressHex,
        function_selector: 'setVaultContract(address)',
        parameter: vaultParamHex,
        fee_limit: 100000000,
        call_value: 0,
      }),
    });
    const triggerData = await triggerRes.json();
    if (triggerData.transaction) {
      const vTxID = triggerData.transaction.txID;
      const vBroadcast = await signAndBroadcast(
        vTxID,
        triggerData.transaction.raw_data,
        triggerData.transaction.raw_data_hex,
        USER_KEY
      );
      console.log('   Vault wiring broadcast:', vBroadcast);
    }
  } catch (wireErr) {
    console.warn('   Note on vault wiring:', wireErr.message);
  }

  console.log('\n===============================================================');
  console.log('>>> DEPLOYMENT SUCCESSFUL!');
  console.log(`>>> New EquoraDAO Base58: ${contractAddressBase58}`);
  console.log(`>>> New EquoraDAO Hex:    ${contractAddressHex}`);
  console.log(`>>> Explorer URL:         https://testnet.trobchain.com/contract/${contractAddressBase58}`);
  console.log('===============================================================\n');

  // Output JSON for downstream config updates
  const resultObj = {
    contractAddressBase58,
    contractAddressHex,
    txID,
    deployer: SENDER_ADDR,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), 'scripts/latest_dao_deployment.json'),
    JSON.stringify(resultObj, null, 2)
  );

  return resultObj;
}

main().catch(console.error);
