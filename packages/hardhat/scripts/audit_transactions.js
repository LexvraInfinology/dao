const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const FULLNODE_URL = "https://fullnode-one-testnet.trobchain.com";
const members = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../joined-members.json"), "utf8"));

const PayoutTypeNames = [
  "UPLINE_1",
  "UPLINE_2",
  "OWNER_DIRECT",
  "PROTOCOL_POOL",
  "SPILLOVER_DOWNLINE1",
  "SPILLOVER_DOWNLINE2",
  "WATERFALL_DOWNLINE",
  "RESERVED_UPGRADE"
];

// Event signatures
// PositionFilled(address indexed matrixOwner, uint8 indexed slot, uint256 indexed cycle, uint8 position, address participant, uint256 amount)
// DistributionExecuted(address indexed recipient, uint256 amount, uint8 payoutType, uint8 slot, uint256 cycle, uint8 position)
// SpilloverResolved(address indexed matrixOwner, address indexed recipient, uint8 position, bool wasOwnerFallback)
// ProtocolPoolFunded(address indexed matrixOwner, uint256 amount, uint8 slot, uint256 cycle, uint8 position, uint256 timestamp)

async function getTxInfo(txHash) {
  const clean = txHash.startsWith("0x") ? txHash.slice(2) : txHash;
  const res = await fetch(`${FULLNODE_URL}/wallet/gettransactioninfobyid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: clean })
  });
  return await res.json();
}

const iface = new ethers.Interface([
  "event PositionFilled(address indexed matrixOwner, uint8 indexed slot, uint256 indexed cycle, uint8 position, address participant, uint256 amount)",
  "event DistributionExecuted(address indexed recipient, uint256 amount, uint8 payoutType, uint8 slot, uint256 cycle, uint8 position)",
  "event SpilloverResolved(address indexed matrixOwner, address indexed recipient, uint8 position, bool wasOwnerFallback)",
  "event ProtocolPoolFunded(address indexed matrixOwner, uint256 amount, uint8 slot, uint256 cycle, uint8 position, uint256 timestamp)",
  "event SlotJoined(address indexed user, uint256 indexed slot, uint256 cost, address sponsor, uint256 timestamp)"
]);

async function main() {
  console.log(`Auditing ${members.length} members on-chain...`);

  const results = [];

  for (const m of members) {
    if (!m.txHash || m.txHash.length < 10 || m.memberNumber === 1) {
      results.push({
        memberNumber: m.memberNumber,
        label: m.label,
        evm: m.evm,
        sponsor: m.sponsor,
        txHash: m.txHash,
        note: "Founder / Genesis seat"
      });
      continue;
    }

    try {
      const info = await getTxInfo(m.txHash);
      if (!info || !info.log) {
        results.push({
          memberNumber: m.memberNumber,
          label: m.label,
          txHash: m.txHash,
          error: "No logs found in transaction info"
        });
        continue;
      }

      const parsedEvents = [];
      for (const log of info.log) {
        try {
          const topics = log.topics.map(t => "0x" + t);
          const data = "0x" + (log.data || "");
          const parsed = iface.parseLog({ topics, data });
          if (parsed) {
            parsedEvents.push(parsed);
          }
        } catch (e) {
          // not our event or unknown
        }
      }

      const posFilled = parsedEvents.find(e => e.name === "PositionFilled");
      const distExec = parsedEvents.find(e => e.name === "DistributionExecuted");
      const spillover = parsedEvents.find(e => e.name === "SpilloverResolved");

      results.push({
        memberNumber: m.memberNumber,
        label: m.label,
        evm: m.evm,
        sponsor: m.sponsor,
        txHash: m.txHash,
        matrixOwner: posFilled ? posFilled.args.matrixOwner : null,
        position: posFilled ? Number(posFilled.args.position) : null,
        recipient: distExec ? distExec.args.recipient : null,
        payoutType: distExec ? PayoutTypeNames[Number(distExec.args.payoutType)] || Number(distExec.args.payoutType) : null,
        amount: distExec ? (Number(distExec.args.amount) / 1e6).toFixed(4) + " TROB" : null,
        spilloverRecipient: spillover ? spillover.args.recipient : null
      });
    } catch (err) {
      results.push({
        memberNumber: m.memberNumber,
        label: m.label,
        txHash: m.txHash,
        error: err.message
      });
    }
  }

  // Create a mapping of EVM -> Member name
  const memberMap = {};
  for (const m of members) {
    memberMap[m.evm.toLowerCase()] = `M${m.memberNumber}`;
  }
  // Also add vault
  const vaultEvm = "0xf5712d645589149d07fcc67dcd0d26a080d0ffe9";
  memberMap[vaultEvm.toLowerCase()] = "Protocol Vault (4 Pools)";

  console.log("\n==========================================================================================");
  console.log("ON-CHAIN MATRIX EXECUTION AUDIT TABLE");
  console.log("==========================================================================================");

  for (const r of results) {
    if (r.note) {
      console.log(`[Member ${r.memberNumber}] ${r.label}: ${r.note}`);
      continue;
    }
    const joiner = `M${r.memberNumber}`;
    const sponsorName = memberMap[r.sponsor?.toLowerCase()] || r.sponsor;
    const boardOwnerName = memberMap[r.matrixOwner?.toLowerCase()] || r.matrixOwner;
    const recipientName = memberMap[r.recipient?.toLowerCase()] || r.recipient;

    console.log(`Member ${r.memberNumber} (${joiner}):`);
    console.log(`   - Joiner EVM: ${r.evm}`);
    console.log(`   - Sponsor:    ${sponsorName} (${r.sponsor})`);
    console.log(`   - Board Filled: ${boardOwnerName}'s Board (Position: P${r.position})`);
    console.log(`   - Payout To:  ${recipientName} (${r.recipient})`);
    console.log(`   - Rule / Type:${r.payoutType} (Amount: ${r.amount})`);
    console.log(`   - TxHash:     ${r.txHash}`);
    console.log("------------------------------------------------------------------------------------------");
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../audit_results.json"),
    JSON.stringify({ results, memberMap }, null, 2),
    "utf8"
  );
}

main().catch(console.error);
