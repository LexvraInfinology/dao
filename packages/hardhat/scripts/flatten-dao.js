const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const contracts = [
  { name: 'EquoraCoin', src: 'contracts/token/EquoraCoin.sol' },
  { name: 'EquoraToken', src: 'contracts/token/EquoraToken.sol' },
  { name: 'EquoraRegistry', src: 'contracts/core/EquoraRegistry.sol' },
  { name: 'EquoraNFT', src: 'contracts/rewards/EquoraNFT.sol' },
  { name: 'EquoraDAO', src: 'contracts/core/EquoraDAO.sol' },
  { name: 'EquoraVault', src: 'contracts/core/EquoraVault.sol' },
  { name: 'EquoraMatrix', src: 'contracts/core/EquoraMatrix.sol' },
];

const outDir = path.join(__dirname, '../contracts-flattened');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const c of contracts) {
  console.log(`Flattening ${c.name}...`);
  try {
    const raw = execSync(`npx hardhat flatten ${c.src}`, {
      cwd: path.join(__dirname, '..'),
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf-8'
    });

    // Clean duplicate SPDX-License-Identifier and pragma solidity
    const lines = raw.split('\n');
    let hasSpdx = false;
    let hasPragma = false;
    const cleaned = [];

    for (const line of lines) {
      if (line.includes('SPDX-License-Identifier:')) {
        if (!hasSpdx) {
          cleaned.push('// SPDX-License-Identifier: MIT');
          hasSpdx = true;
        }
        continue;
      }
      if (line.trim().startsWith('pragma solidity')) {
        if (!hasPragma) {
          cleaned.push('pragma solidity ^0.8.20;');
          hasPragma = true;
        }
        continue;
      }
      cleaned.push(line);
    }

    const outPath = path.join(outDir, `${c.name}.sol`);
    fs.writeFileSync(outPath, cleaned.join('\n'), 'utf-8');
    console.log(`Saved flattened ${c.name}.sol (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`Error flattening ${c.name}:`, err.message);
  }
}
