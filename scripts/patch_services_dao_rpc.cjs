const fs = require('fs');

let daoIndex = fs.readFileSync('packages/services/src/dao/index.ts', 'utf8');

daoIndex = daoIndex.replace(
  'const fullNode = servicesConfig.blockchain.rpcUrl || "https://fullnode-one.trobchain.com";',
  'const fullNode = servicesConfig.blockchain.rpcUrl;'
);

const targetRpc482 = `      const rpcUrl =
        process.env.FULLNODE_URL ||
        process.env.RPC_URL ||
        process.env.NEXT_PUBLIC_RPC_URL ||
        "https://fullnode-one.trobchain.com";`;

const replacementRpc482 = `      const rpcUrl = servicesConfig.blockchain.rpcUrl;`;

if (daoIndex.includes(targetRpc482)) {
  daoIndex = daoIndex.replace(targetRpc482, replacementRpc482);
} else {
  const norm = daoIndex.replace(/\r\n/g, '\n');
  if (norm.includes(targetRpc482)) {
    daoIndex = norm.replace(targetRpc482, replacementRpc482);
  }
}

fs.writeFileSync('packages/services/src/dao/index.ts', daoIndex, 'utf8');
console.log('Patched packages/services/src/dao/index.ts');

