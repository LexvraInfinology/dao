const fs = require('fs');
const file = 'apps/web-matrix/components/profile/ProfileHeroCard.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('CONTRACT_ADDRESSES')) {
  c = c.replace(
    'import { formatAddress, toTrobBase58 } from "@/lib/format";',
    'import { formatAddress, toTrobBase58 } from "@/lib/format";\nimport { CONTRACT_ADDRESSES } from "@/lib/contracts";'
  );
}

c = c.replace('title="Click to copy Upline 1 (Sponsor) address"', 'title="Click to copy Direct Sponsor address"');
c = c.replace('<span>Upline 1:', '<span>Sponsor:');
c = c.replace('TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX', '${toTrobBase58(CONTRACT_ADDRESSES.vault)}');
c = c.replace('copy("TPQyyruMPLn1S7szNTGWBtB1Yv1Noc1BRX")', 'copy(toTrobBase58(CONTRACT_ADDRESSES.vault))');
c = c.replace('Upline: 4 Protocol Pools (Vault: TPQyy...1BRX)', 'Upline: Protocol Vault (Apex Root)');

fs.writeFileSync(file, c);
console.log('Patched ProfileHeroCard.tsx');

