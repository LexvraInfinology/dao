const fs = require('fs');
const path = require('path');

function searchHardcoded(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.next' || f === '.git' || f === 'dist') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      searchHardcoded(p);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('IS_MAINNET = true') || content.includes('TARGET_NETWORK = "mainnet"') || content.includes("TARGET_NETWORK = 'mainnet'")) {
        console.log('Match in:', p);
      }
    }
  }
}
searchHardcoded('apps');
searchHardcoded('packages');

