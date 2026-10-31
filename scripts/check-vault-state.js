const { ethers } = require("ethers");
const RPC_URL = "https://fullnode-one-testnet.trobchain.com";
const coder = new ethers.AbiCoder();

const vaultAddr = "TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX";

function toHexAddress(input) {
  const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = [0];
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const value = B58_ALPHABET.indexOf(c);
    if (value === -1) return null;
    for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
    bytes[0] += value;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < input.length && input[i] === "1"; i++) bytes.push(0);
  const buf = new Uint8Array(bytes.reverse());
  return "0x" + Array.from(buf.slice(1, 21)).map(b => b.toString(16).padStart(2, "0")).join("").toLowerCase();
}

async function queryConstant(functionSelector, parameterHex = "") {
  const contractHex = "41" + toHexAddress(vaultAddr).slice(2);
  const res = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex,
      visible: false,
    }),
  });
  const data = await res.json();
  if (data.result && data.result.result && data.constant_result?.length > 0) {
    return data.constant_result[0];
  }
  throw new Error(`Call ${functionSelector} failed: ${JSON.stringify(data)}`);
}

async function checkVault() {
  console.log("Checking EquoraVault state:");

  for (const fn of [
    "initialized()",
    "daoPool()",
    "salaryPool()",
    "magicBoxPool()",
    "rewardsPool()",
    "matrixContract()",
    "totalRoutedFromMatrix()",
    "totalRoutedFromUsers()"
  ]) {
    try {
      const raw = await queryConstant(fn);
      if (fn.includes("()")) {
        const type = fn.includes("Pool") || fn.includes("Contract") ? "address" : fn.includes("total") ? "uint256" : "bool";
        const val = coder.decode([type], "0x" + raw)[0];
        console.log(`  ${fn}:`, val.toString());
      }
    } catch (e) {
      console.log(`  ${fn} error:`, e.message);
    }
  }

  // Check backend txs for vault
  const txRes = await fetch(`https://testnet-backend.trobchain.com/v1/accounts/${vaultAddr}/transactions`);
  const txData = await txRes.json();
  console.log(`Vault transactions count:`, txData.data ? txData.data.length : 0);
  if (txData.data && txData.data.length > 0) {
    console.log("Recent txs:", txData.data.slice(0, 5));
  }
}

checkVault();
