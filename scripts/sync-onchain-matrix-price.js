require('dotenv').config();
const { ethers } = require('ethers');
const crypto = require('crypto');

const RPC_URL = process.env.FULLNODE_URL || process.env.RPC_URL || 'https://fullnode-one.trobchain.com';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const DAO_HEX = '417816ae352da7d1a806eea8446aebbe551420429b';
const MATRIX_HEX = '41b48f1e72c64b776ce5864df74926b3b935fef308';

function getSigner(privKey) {
  const clean = privKey.startsWith('0x') ? privKey : '0x' + privKey;
  const signingKey = new ethers.SigningKey(clean);
  const evmAddress = ethers.computeAddress(clean);
  const tronHex = '41' + evmAddress.slice(2).toLowerCase();
  return { evmAddress, tronHex, signingKey };
}

async function broadcastTx(signer, transaction) {
  const txID = transaction.txID;
  const sig = signer.signingKey.sign('0x' + txID);
  const vHex = sig.v === 27 ? '1b' : '1c';
  const signatureHex = sig.r.slice(2) + sig.s.slice(2) + vHex;

  const res = await fetch(`${RPC_URL}/wallet/broadcasttransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...transaction, signature: [signatureHex] }),
  });
  return res.json();
}

async function syncOnChainPrice() {
  if (!PRIVATE_KEY) {
    console.error('DEPLOYER_PRIVATE_KEY is missing from environment.');
    process.exit(1);
  }

  const signer = getSigner(PRIVATE_KEY);
  console.log('Deployer EVM:', signer.evmAddress, 'TronHex:', signer.tronHex);

  // 1. Fetch live market price
  const res = await fetch('https://backend.trobchain.com/v1/market/price');
  const priceJson = await res.json();
  const livePriceUsd = priceJson.data.priceUsd;
  console.log(`Live TROB price from market API: $${livePriceUsd}`);

  const trobPriceUsd6 = Math.round(livePriceUsd * 1e6);
  const newDaoEntryFeeSun = BigInt(Math.round((300 / livePriceUsd) * 1e6));
  console.log(`Computed DAO Entry Fee ($300): ${newDaoEntryFeeSun.toString()} SUN (~${(Number(newDaoEntryFeeSun) / 1e6).toFixed(2)} TROB)`);
  console.log(`Computed trobPriceUsd6: ${trobPriceUsd6}`);

  const coder = new ethers.AbiCoder();
  const setEntryFeeParam = coder.encode(['uint256', 'uint256'], [newDaoEntryFeeSun, trobPriceUsd6]).slice(2);

  // Broadcast setEntryFee on EquoraDAO
  console.log('Creating setEntryFee transaction...');
  const txRes = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: signer.tronHex,
      contract_address: DAO_HEX,
      function_selector: 'setEntryFee(uint256,uint256)',
      parameter: setEntryFeeParam,
      fee_limit: 50_000_000,
      call_value: 0,
      visible: false,
    }),
  });
  const txJson = await txRes.json();
  if (!txJson.transaction) {
    console.error('Failed to create tx:', txJson);
    return;
  }

  const bcast1 = await broadcastTx(signer, txJson.transaction);
  console.log('DAO setEntryFee broadcast result:', bcast1);

  console.log('Waiting 4s for block confirmation...');
  await new Promise((r) => setTimeout(r, 4500));

  // Trigger syncPriceFromDAO on EquoraMatrix
  console.log('Creating EquoraMatrix.syncPriceFromDAO() transaction...');
  const syncTxRes = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: signer.tronHex,
      contract_address: MATRIX_HEX,
      function_selector: 'syncPriceFromDAO()',
      parameter: '',
      fee_limit: 50_000_000,
      call_value: 0,
      visible: false,
    }),
  });
  const syncTxJson = await syncTxRes.json();
  if (syncTxJson.transaction) {
    const bcast2 = await broadcastTx(signer, syncTxJson.transaction);
    console.log('Matrix syncPriceFromDAO broadcast result:', bcast2);
  }

  console.log('Waiting 4s for block confirmation...');
  await new Promise((r) => setTimeout(r, 4500));

  // Verify updated Matrix on-chain values
  const matCheck = await fetch(`${RPC_URL}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: '410000000000000000000000000000000000000000',
      contract_address: MATRIX_HEX,
      function_selector: 'trobPriceUsd6()',
      parameter: '',
      visible: false,
    }),
  });
  const matJson = await matCheck.json();
  const updatedPriceUsd6 = Number(BigInt('0x' + matJson.constant_result[0].slice(0, 64)));
  console.log(`✅ Verified updated Matrix trobPriceUsd6 on-chain: ${updatedPriceUsd6} ($${updatedPriceUsd6 / 1e6})`);

  // Verify slotCosts(1)
  const slotCheck = await fetch(`${RPC_URL}/wallet/triggerconstantcontract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner_address: '410000000000000000000000000000000000000000',
      contract_address: MATRIX_HEX,
      function_selector: 'slotCosts(uint256)',
      parameter: coder.encode(['uint256'], [1]).slice(2),
      visible: false,
    }),
  });
  const slotJson = await slotCheck.json();
  const updatedSlot1Sun = Number(BigInt('0x' + slotJson.constant_result[0].slice(0, 64)));
  console.log(`✅ Verified updated Matrix slotCosts(1) on-chain: ${updatedSlot1Sun} SUN (~${(updatedSlot1Sun / 1e6).toFixed(2)} TROB)`);
}

syncOnChainPrice().catch(console.error);
