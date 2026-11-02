const fs = require('fs');
const path = require('path');

// Target testnet addresses that should be used:
// DAO: TVBLDggu9VULMQnxucjftLgg6QfAKN5rUW / 41d2b5680da9913bdc7ebe8a00ed419ecb60b669c5
// Matrix: TNU8aUC8H8osyfhr2TnNzNNEMZPtGV4D8o / 418919e11e219e81d9f510947f9d4f9e9ac04f4cc6
// Old mainnet hexes to find:
const OLD_MAINNET = [
  '419031dbc5faddd365a9b3d40ddc0c550ca0f369e4',
  '411a5f193d5b9654282fed67931d9123c00da9c879',
  '411a7f29b91424fd6715c5048b458dcf7beeeaeebc',
  'TQuf5qo6EdRYDdEihbfbj51yo6rtzQCkCV',
  'TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2',
  'TNxk5Uguc16mxReUjXHDctKj12Y3MUSQZj'
];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'artifacts', 'cache'].includes(entry.name)) continue;
      scanDir(full);
    } else if (/\.(ts|tsx|js|cjs|mjs|json|env.*)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        for (const target of OLD_MAINNET) {
          if (content.includes(target)) {
            console.log(`Found ${target} in ${full}`);
          }
        }
      } catch {}
    }
  }
}

console.log('Scanning apps and packages for old mainnet addresses...');
scanDir(path.resolve(__dirname, '../apps'));
scanDir(path.resolve(__dirname, '../packages'));
console.log('Done scanning.');

