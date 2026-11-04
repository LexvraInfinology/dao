const { ethers } = require("ethers");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const MATRIX_HEX = "4107206fbf8b863f8a22b79ba3c771dcef0fe1ddc8";
const VAULT_HEX = "4175cb32e5d8e90eb24b1473e3a170f4d78838406c";
const REGISTRY_HEX = "41607aa22a411c8bfc736637b30fdae63c84e47feb";

async function main() {
  console.log("=== Fetching Matrix Events ===");
  try {
    const res = await fetch(`${FULLNODE_URL}/v1/contracts/${MATRIX_HEX}/events?limit=100`);
    const data = await res.json();
    console.log(`Found ${data.data?.length || 0} events on Matrix contract.`);
    if (data.data) {
      for (const ev of data.data) {
        console.log(`[${ev.event_name}] tx: ${ev.transaction_id} (block ${ev.block_number})`);
        console.log("  result:", JSON.stringify(ev.result));
      }
    }
  } catch (err) {
    console.error("Matrix events error:", err);
  }

  console.log("\n=== Fetching Registry Events ===");
  try {
    const res = await fetch(`${FULLNODE_URL}/v1/contracts/${REGISTRY_HEX}/events?limit=50`);
    const data = await res.json();
    console.log(`Found ${data.data?.length || 0} events on Registry contract.`);
    if (data.data) {
      for (const ev of data.data) {
        console.log(`[${ev.event_name}] tx: ${ev.transaction_id}`);
        console.log("  result:", JSON.stringify(ev.result));
      }
    }
  } catch (err) {
    console.error("Registry events error:", err);
  }

  console.log("\n=== Fetching Vault Events ===");
  try {
    const res = await fetch(`${FULLNODE_URL}/v1/contracts/${VAULT_HEX}/events?limit=50`);
    const data = await res.json();
    console.log(`Found ${data.data?.length || 0} events on Vault contract.`);
    if (data.data) {
      for (const ev of data.data) {
        console.log(`[${ev.event_name}] tx: ${ev.transaction_id}`);
        console.log("  result:", JSON.stringify(ev.result));
      }
    }
  } catch (err) {
    console.error("Vault events error:", err);
  }
}

main().catch(console.error);
