const fs = require('fs');
const path = require('path');
const dir = 'apps/web-matrix/.next/static/chunks';
const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (content.includes('joinSlot(uint256,address)')) {
      const idx = content.indexOf('joinSlot(uint256,address)');
      console.log('Found joinSlot in', file);
      console.log(content.slice(Math.max(0, idx - 100), idx + 200));
    }
  }
}

