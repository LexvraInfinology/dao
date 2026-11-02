const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../packages/services/src/dao/index.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const daoHex = "419031dbc5faddd365a9b3d40ddc0c550ca0f369e4";',
  'const daoHex = (process.env.NEXT_PUBLIC_DAO_HEX || "41d2b5680da9913bdc7ebe8a00ed419ecb60b669c5").replace(/^0x/, "41").toLowerCase();'
);

content = content.replace(
  'process.env.NEXT_PUBLIC_DAO_HEX || "419031dbc5faddd365a9b3d40ddc0c550ca0f369e4"',
  'process.env.NEXT_PUBLIC_DAO_HEX || "41d2b5680da9913bdc7ebe8a00ed419ecb60b669c5"'
);

content = content.replace(
  '"https://fullnode-one.trobchain.com";\n      const daoHex',
  '(servicesConfig.blockchain.rpcUrl || "https://fullnode-one-testnet.trobchain.com");\n      const daoHex'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched packages/services/src/dao/index.ts');

