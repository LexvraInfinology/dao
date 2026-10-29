const RPC_URL = "https://fullnode-one-testnet.trobchain.com";

const addrs = {
  matrix: "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY",
  vault: "TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX",
  salary: "TQG1KagMZRXYPbvgvpLVES68Ht4eazZKo7",
  magicBox: "TPo6c2gjhX6DWPQcCf4TUF3NnzxAmCC8cb",
  rewards: "TBufkRiqngeRwJpWQkaySUm2dioqxLCuDf",
  dao: "TPw1MNKr2QcU3CizievsskdSRtuY18Zvvr"
};

function toHex(b58) {
  const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = [0];
  for (let i = 0; i < b58.length; i++) {
    const c = b58[i];
    const value = B58_ALPHABET.indexOf(c);
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
  for (let i = 0; i < b58.length && b58[i] === "1"; i++) bytes.push(0);
  const buf = new Uint8Array(bytes.reverse());
  return "41" + Array.from(buf.slice(1, 21)).map(b => b.toString(16).padStart(2, "0")).join("").toLowerCase();
}

async function checkBalances() {
  for (const [name, b58] of Object.entries(addrs)) {
    const hex = toHex(b58);
    const res = await fetch(`${RPC_URL}/wallet/getaccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: hex })
    });
    const d = await res.json();
    console.log(`${name} (${b58}): ${(d.balance || 0) / 1e6} TROB (${d.balance || 0} SUN)`);
  }
}

checkBalances();
