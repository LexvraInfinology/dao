const ethers = require('ethers');

const hashes = [
  'ce7b5933c2f4420a1d4a67517506d3f43335491b38228d492c7af46a42767516',
  '25fb3c2ddf7e1d4a53f64c81f5120cb328d0a7598def66f010986f5e97de4256',
  'dabcb59658fa3cb17782583fda1eef25f44b35be73cdb223abd6d1db52968422',
  '59cc97a07891a0066991206952ba71b0f99c8a2e110b5dedac626c310f9b398d',
  'f097102263d47691dff003ba180c36d04f88762336fc1f67ae67cd1dc79ba87e',
  '604611399c7e0ae40af99ac4550b9fef5779ecc928efea99f0e93415cee5dfed',
  'ff69d541081007699bbed253311513efef3514c9d20cadc5b31406b5bb1b19ba',
  '0b11aecd3fcb52de175864c6ce664e7ecdd2b24c054a04f3737f4e267c808760'
];

const iface = new ethers.Interface([
  "event SlotJoined(address indexed user, uint256 indexed slot, uint256 cost, address indexed sponsor, uint256 timestamp)",
  "event PositionFilled(address indexed matrixOwner, uint8 indexed slot, uint256 cycle, uint8 position, address placedUser, uint256 amount)",
  "event DistributionExecuted(address indexed recipient, uint256 amount, uint8 payoutType, uint8 slot, uint256 cycle, uint8 position)"
]);

async function checkTx(h) {
  const res = await fetch('https://fullnode-one-testnet.trobchain.com/wallet/gettransactioninfobyid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: h })
  }).then(r => r.json());

  console.log(`\n=================== TX ${h.slice(0, 12)}... ===================`);
  if (!res?.log) return;
  for (const l of res.log) {
    if (l.address.toLowerCase() === '8919e11e219e81d9f510947f9d4f9e9ac04f4cc6') {
      try {
        const parsed = iface.parseLog({
          topics: l.topics.map(t => '0x' + t),
          data: '0x' + (l.data || '')
        });
        if (parsed) {
          if (parsed.name === 'SlotJoined') {
            console.log(`  [SlotJoined] user=${parsed.args.user} slot=${parsed.args.slot} sponsor=${parsed.args.sponsor}`);
          } else if (parsed.name === 'PositionFilled') {
            console.log(`  [PositionFilled] matrixOwner=${parsed.args.matrixOwner} pos=${parsed.args.position} placedUser=${parsed.args.placedUser}`);
          } else if (parsed.name === 'DistributionExecuted') {
            const types = ["UPLINE_1", "UPLINE_2", "OWNER_DIRECT", "UPGRADE_RESERVE", "AUTO_UPGRADE", "SPILLOVER_DOWNLINE1", "SPILLOVER_DOWNLINE2", "RECYCLE_SPONSOR", "PROTOCOL_POOL"];
            console.log(`  >>> [DistributionExecuted] recipient=${parsed.args.recipient} amount=${ethers.formatUnits(parsed.args.amount, 6)} TROB type=${types[parsed.args.payoutType] || parsed.args.payoutType} pos=${parsed.args.position}`);
          }
        }
      } catch (err) {}
    }
  }
}

async function main() {
  for (const h of hashes) {
    await checkTx(h);
  }
}
main();

