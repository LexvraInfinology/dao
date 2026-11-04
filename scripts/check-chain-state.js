const { ethers } = require("ethers");
const crypto = require("crypto");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const MATRIX_HEX = "4107206fbf8b863f8a22b79ba3c771dcef0fe1ddc8";
const REGISTRY_HEX = "41607aa22a411c8bfc736637b30fdae63c84e47feb";

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
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
  return digits.reverse().map((d) => B58_ALPHABET[d]).join("");
}
function hexToBase58(hexStr) {
  const clean = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  const buf = Buffer.from(clean, "hex");
  const hash1 = crypto.createHash("sha256").update(buf).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.subarray(0, 4);
  return encode58(Buffer.concat([buf, checksum]));
}

function evmToBase58(evmAddr) {
  if (!evmAddr || evmAddr === ethers.ZeroAddress) return "none";
  const clean = evmAddr.startsWith("0x") ? evmAddr.slice(2) : evmAddr;
  return hexToBase58("41" + clean);
}

async function callConstant(contractHex, functionSelector, parameterHex = "") {
  const res = await fetch(`${FULLNODE_URL}/wallet/triggerconstantcontract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: "41f3e68b5fb76382683baf1e8512c4c0ab39490717",
      contract_address: contractHex,
      function_selector: functionSelector,
      parameter: parameterHex.replace(/^0x/, ""),
      visible: false,
    }),
  });
  const data = await res.json();
  if (data.constant_result && data.constant_result.length > 0) {
    return data.constant_result[0];
  }
  return null;
}

const PAYOUT_TYPES = ["DIRECT_INCOME", "LEVEL1_PASS_UP", "LEVEL2_PASS_UP", "PROTOCOL_POOL", "RECYCLE_REENTRY"];

async function main() {
  const coder = new ethers.AbiCoder();
  console.log("=== CHECKING ON-CHAIN REGISTRY STATE ===");

  const userListHex = await callConstant(REGISTRY_HEX, "getUserList()");
  let users = [];
  if (userListHex) {
    users = coder.decode(["address[]"], "0x" + userListHex)[0];
    console.log(`Registered Users (${users.length}):`);
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const codeHex = await callConstant(REGISTRY_HEX, "getCodeByUser(address)", coder.encode(["address"], [u]).slice(2));
      const code = codeHex ? coder.decode(["uint32"], "0x" + codeHex)[0] : "none";
      const spHex = await callConstant(REGISTRY_HEX, "getSponsor(address)", coder.encode(["address"], [u]).slice(2));
      const sponsor = spHex ? coder.decode(["address"], "0x" + spHex)[0] : "none";
      console.log(`  [User #${i + 1}] EVM: ${u} | Base58: ${evmToBase58(u)} | Code: ${code} | Sponsor: ${evmToBase58(sponsor)}`);
    }
  }

  console.log("\n=== CHECKING MATRIX STATE FOR ALL USERS ===");
  for (const u of users) {
    console.log(`\n======================================================`);
    console.log(`User ${evmToBase58(u)} (${u})`);
    console.log(`======================================================`);

    const dataHex = await callConstant(MATRIX_HEX, "getSlotData(address,uint256)", coder.encode(["address", "uint256"], [u, 1]).slice(2));
    if (dataHex) {
      const d = coder.decode(["bool", "uint256", "uint256", "address[14]", "uint256"], "0x" + dataHex);
      console.log(`Slot 1: isUnlocked=${d[0]}, currentCycle=${d[1]}, filledNodes=${d[2]}, slotEarned=${Number(d[4])/1e6} TROB`);
    }

    const detailHex = await callConstant(MATRIX_HEX, "getSlotNodesDetail(address,uint256)", coder.encode(["address", "uint256"], [u, 1]).slice(2));
    if (detailHex) {
      const dt = coder.decode(
        ["address[14]", "uint32[14]", "uint256[14]", "address[14]", "uint8[14]"],
        "0x" + detailHex
      );
      const addrs = dt[0];
      const codes = dt[1];
      const memberIds = dt[2];
      const recipients = dt[3];
      const types = dt[4];

      for (let pos = 0; pos < 14; pos++) {
        if (addrs[pos] !== ethers.ZeroAddress) {
          const pTypeStr = PAYOUT_TYPES[types[pos]] || types[pos];
          console.log(`  Node #${pos + 1}: Occupant=${evmToBase58(addrs[pos])} (Code: #${codes[pos]}, MemberId: #${memberIds[pos]})`);
          console.log(`           PayoutRecipient=${evmToBase58(recipients[pos])} (${recipients[pos]}) | PayoutType=${pTypeStr}`);
        }
      }
    }
  }
}

main().catch(console.error);
