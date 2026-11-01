const fs = require('fs');
const path = require('path');

const suspiciousPatterns = [
  { name: "Hardcoded 1260", regex: /\b1260(\.0)?\b/ },
  { name: "Mock slot unlock (<= 4)", regex: /selectedSlotNumber\s*<=\s*4/ },
  { name: "Mock earnings fallback", regex: /earnings|totalEarned|balance/i },
  { name: "Hardcoded default addresses", regex: /41[a-f0-9]{40}|T[1-9A-HJ-NP-Za-km-z]{33}/ },
];

function scanFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.next', '.git', '.turbo', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanFiles(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

const matrixFiles = scanFiles(path.resolve(__dirname, '../apps/web-matrix'));
console.log(`Scanning ${matrixFiles.length} files in apps/web-matrix...`);

for (const file of matrixFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check 1260
    if (/\b1260(\.0)?\b/.test(line)) {
      console.log(`[1260] ${path.relative(path.resolve(__dirname, '..'), file)}:${idx + 1} -> ${line.trim()}`);
    }
    // Check <= 4 mock unlock
    if (/selectedSlotNumber\s*<=\s*[2-9]/.test(line)) {
      console.log(`[Mock Unlock] ${path.relative(path.resolve(__dirname, '..'), file)}:${idx + 1} -> ${line.trim()}`);
    }
    // Check for hardcoded mock names or fake addresses
    if (/MockData|mockPlacements|dummyData|mockSlots/i.test(line)) {
      console.log(`[Mock Identifier] ${path.relative(path.resolve(__dirname, '..'), file)}:${idx + 1} -> ${line.trim()}`);
    }
  });
}

