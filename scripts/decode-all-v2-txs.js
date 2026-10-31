const { ethers } = require('ethers');
const fs = require('fs');

const RPC = 'https://fullnode-one.trobchain.com';
const coder = new ethers.AbiCoder();

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function encode58(buffer) {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
    digits[0] += buffer[i];
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      bytes = digits[j] + carry;
      carry = (bytes / 58) | 0;
      digits[j] = bytes % 58;
    }
    while (carry) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) digits.push(0);
  return digits.reverse().map((d) => B58_ALPHABET[d]).join('');
}

function hexToBase58(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const addressHex = clean.length === 40 ? '41' + clean : clean;
  const buffer = Buffer.from(addressHex, 'hex');
  const h1 = ethers.sha256(buffer);
  const h2 = ethers.sha256(ethers.getBytes(h1));
  const checksum = ethers.getBytes(h2).slice(0, 4);
  const total = new Uint8Array(buffer.length + 4);
  total.set(buffer);
  total.set(checksum, buffer.length);
  return encode58(total);
}

// Function selector dictionary
const SELECTORS = {
  'joinDAO()': 'a9059cbb', // will compute dynamically
};

function getSelector(sig) {
  return ethers.keccak256(ethers.toUtf8Bytes(sig)).slice(2, 10);
}

const KNOWN_SIGS = [
  'joinDAO()',
  'completeUnderfundedSeat()',
  'retopup()',
  'claimPoolShare()',
  'migrateGenuineMembers(address[],uint256[],uint256[])',
  'setUnderfundedReservations(address[],uint256[],uint256[],uint256[])',
  'finalizeMigration()',
  'setTreasuryVault(address)',
  'setVaultContract(address)',
  'setPriceOracle(address)',
  'setEntryFee(uint256,uint256)',
  'setTrobPrice(uint256)',
  'receivePoolDeposit(uint256)',
  'flushAndDistributeAccumulatedPool()',
];

const sigMap = {};
for (const s of KNOWN_SIGS) {
  sigMap[getSelector(s)] = s;
}

async function getTx(txId) {
  const res = await fetch(`${RPC}/wallet/gettransactionbyid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: txId })
  });
  return await res.json();
}

async function getTxInfo(txId) {
  const res = await fetch(`${RPC}/wallet/gettransactioninfobyid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: txId })
  });
  return await res.json();
}

async function main() {
  const data = JSON.parse(fs.readFileSync('scratch/all_dao_txs.json', 'utf8'));

  for (const cName of ['EquoraDAO_v2_interim', 'EquoraDAO_v2_current']) {
    console.log(`\n=================== DECODING ${cName} ===================`);
    const txs = data[cName].txs;
    const decodedList = [];

    for (let i = 0; i < txs.length; i++) {
      const txHash = txs[i].hash;
      const tx = await getTx(txHash);
      const txInfo = await getTxInfo(txHash);

      const rawContract = tx?.raw_data?.contract?.[0]?.parameter?.value;
      const ownerHex = rawContract?.owner_address || '';
      const toHex = rawContract?.contract_address || '';
      const callData = rawContract?.data || '';
      const callValueSun = rawContract?.call_value || 0;
      const callValueTrob = callValueSun / 1e6;

      const selector = callData.slice(0, 8);
      const method = sigMap[selector] || ('unknown(' + selector + ')');

      const isSuccess = txInfo?.receipt?.result === 'SUCCESS' || txInfo?.receipt?.result === undefined && txInfo?.id;
      const callerBase58 = ownerHex ? hexToBase58(ownerHex) : 'N/A';

      const entry = {
        txHash,
        blockNumber: txInfo?.blockNumber,
        timestamp: new Date(tx?.raw_data?.timestamp || 0).toISOString(),
        caller: callerBase58,
        callerHex: ownerHex,
        callValueTrob,
        method,
        selector,
        callData,
        isSuccess,
        receiptResult: txInfo?.receipt?.result || 'SUCCESS',
        logCount: txInfo?.log?.length || 0
      };

      console.log(`[${i + 1}/${txs.length}] ${entry.timestamp} | ${entry.caller} | ${entry.callValueTrob} TROB | ${entry.method} | Result: ${entry.receiptResult}`);
      decodedList.push(entry);
    }

    fs.writeFileSync(`scratch/${cName}_decoded_txs.json`, JSON.stringify(decodedList, null, 2));
  }
}

main().catch(console.error);

