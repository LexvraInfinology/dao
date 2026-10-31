const { ethers } = require("ethers");
const RPC_URL = "https://fullnode-one-testnet.trobchain.com";
const coder = new ethers.AbiCoder();

const matrixAddr = "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY";

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

async function checkMatrixWiring() {
  const contractHex = "41" + toHexAddress(matrixAddr).slice(2);
  const res = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: "vaultContract()",
      parameter: "",
      visible: false,
    }),
  });
  const data = await res.json();
  console.log("Raw vaultContract() response:", data);
  if (data.constant_result?.[0]) {
    const decoded = coder.decode(["address"], "0x" + data.constant_result[0])[0];
    console.log("Decoded vaultContract:", decoded);
  }

  // Also check totalPoolForwarded()
  const res2 = await fetch(`${RPC_URL}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: contractHex,
      contract_address: contractHex,
      function_selector: "totalPoolForwarded()",
      parameter: "",
      visible: false,
    }),
  });
  const data2 = await res2.json();
  if (data2.constant_result?.[0]) {
    const decoded2 = coder.decode(["uint256"], "0x" + data2.constant_result[0])[0];
    console.log("totalPoolForwarded:", decoded2.toString());
  }
}

checkMatrixWiring();
