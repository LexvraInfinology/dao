const fs = require('fs');
const path = 'packages/services/src/matrix/index.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `                  txHash: \`0x\${ethers.keccak256(ethers.toUtf8Bytes(canonicalAddress + "-p" + pos)).slice(2, 66)}\`,
                  status: "COMPLETED",
                  description: \`Matrix Position #\${pos} P2P Settlement (+ $30.00 USD)\`,
                  timestamp: node.timestamp || new Date().toISOString(),`;

const repl = `                  txHash: "0x" + Buffer.from(canonicalAddress + "-p" + pos).toString("hex").padEnd(64, "0").slice(0, 64),
                  status: "COMPLETED",
                  description: \`Matrix Position #\${pos} P2P Settlement (+ $30.00 USD)\`,
                  timestamp: node.timestamp ? new Date(node.timestamp) : new Date(),`;

if (content.includes(target)) {
  content = content.replace(target, repl);
  console.log('Patched packages/services/src/matrix/index.ts (LF)');
} else {
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replCRLF = repl.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replCRLF);
    console.log('Patched packages/services/src/matrix/index.ts (CRLF)');
  } else {
    console.warn('target not found in packages/services/src/matrix/index.ts');
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Saved packages/services/src/matrix/index.ts');
