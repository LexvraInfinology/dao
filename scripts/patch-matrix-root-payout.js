const fs = require("fs");
const path = require("path");

function patchMatrixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. In _placeUserInMatrix: Forward rootOwner's own slot payment directly to vault
  const target1 = `        // If newUser is the root matrix owner, there is no upline tree to place into\n        if (newUser == rootOwner || newUser == address(0)) {\n            return;\n        }`;
  const target1Crlf = `        // If newUser is the root matrix owner, there is no upline tree to place into\r\n        if (newUser == rootOwner || newUser == address(0)) {\r\n            return;\r\n        }`;
  const replace1 = `        // If newUser is the root matrix owner, there is no upline tree to place into.\n        // Forward root owner's slot payment directly to EquoraVault for 4 Protocol Pools!\n        if (newUser == rootOwner || newUser == address(0)) {\n            _forwardToVault(rootOwner, cost);\n            return;\n        }`;

  if (content.includes(target1Crlf)) {
    content = content.replace(target1Crlf, replace1.replace(/\n/g, "\r\n"));
    console.log(`[${path.basename(filePath)}] Patched _placeUserInMatrix (CRLF)`);
  } else if (content.includes(target1)) {
    content = content.replace(target1, replace1);
    console.log(`[${path.basename(filePath)}] Patched _placeUserInMatrix (LF)`);
  } else {
    console.warn(`[${path.basename(filePath)}] Warning: target1 not found!`);
  }

  // 2. In vacantPos == 3 || vacantPos == 6 ... : Payout to boardOwner when qualified or rootOwner
  // Replace the prior block that forwarded rootOwner to vault
  const priorRootBlockRegex = /if\s*\(\s*boardOwner\s*==\s*rootOwner\s*\|\|\s*boardOwner\s*==\s*genesisRoot[\s\S]*?emit\s+ProtocolPoolFunded\s*\(\s*boardOwner[\s\S]*?\)\s*;\s*\}\s*else\s+if\s*\(\s*isMatrixQualified\s*\(\s*boardOwner\s*\)\s*\)\s*\{/g;
  const newOwnerBlock = `if (isMatrixQualified(boardOwner) || boardOwner == rootOwner) {`;

  if (priorRootBlockRegex.test(content)) {
    content = content.replace(priorRootBlockRegex, newOwnerBlock);
    console.log(`[${path.basename(filePath)}] Patched positions 3, 6, 8, 9, 11, 12 to pay boardOwner`);
  } else {
    console.warn(`[${path.basename(filePath)}] Warning: priorRootBlockRegex not matched!`);
  }

  // 3. In _pushMatrixPayment: Allow rootOwner to receive payout! Only forward owner(), vaultContract, address(this) to vault.
  const priorPushRegex = /if\s*\(\s*recipient\s*==\s*owner\(\)\s*\|\|\s*recipient\s*==\s*genesisRoot\s*\|\|\s*recipient\s*==\s*rootOwner\s*\|\|\s*recipient\s*==\s*vaultContract\s*\|\|\s*recipient\s*==\s*address\(this\)\s*\)\s*\{\s*if\s*\(\s*vaultContract\s*!=\s*address\(0\)\s*\)\s*\{\s*_forwardToVault\(recipient,\s*amount\);\s*return;\s*\}\s*\}/g;
  const newPushBlock = `if (
            (recipient == owner() ||
            recipient == vaultContract ||
            recipient == address(this)) &&
            vaultContract != address(0)
        ) {
            _forwardToVault(recipient, amount);
            return;
        }`;

  if (priorPushRegex.test(content)) {
    content = content.replace(priorPushRegex, newPushBlock);
    console.log(`[${path.basename(filePath)}] Patched _pushMatrixPayment to allow rootOwner payouts`);
  } else {
    console.warn(`[${path.basename(filePath)}] Warning: priorPushRegex not matched!`);
  }

  // 4. In _creditOwner: Allow rootOwner to receive payout
  const priorCreditRegex = /if\s*\(\s*matrixOwner\s*==\s*vaultContract\s*\|\|\s*matrixOwner\s*==\s*owner\(\)\s*\|\|\s*matrixOwner\s*==\s*genesisRoot\s*\|\|\s*matrixOwner\s*==\s*rootOwner\s*\|\|\s*matrixOwner\s*==\s*address\(this\)\s*\)\s*\{\s*_forwardToVault\(matrixOwner,\s*amount\);\s*\}\s*else\s*\{/g;
  const newCreditBlock = `if (
            matrixOwner == vaultContract ||
            matrixOwner == owner() ||
            matrixOwner == address(this)
        ) {
            _forwardToVault(matrixOwner, amount);
        } else {`;

  if (priorCreditRegex.test(content)) {
    content = content.replace(priorCreditRegex, newCreditBlock);
    console.log(`[${path.basename(filePath)}] Patched _creditOwner to allow rootOwner payouts`);
  } else {
    console.warn(`[${path.basename(filePath)}] Warning: priorCreditRegex not matched!`);
  }

  fs.writeFileSync(filePath, content, "utf8");
}

const file1 = path.resolve(__dirname, "../packages/hardhat/contracts/core/EquoraMatrix.sol");
const file2 = path.resolve(__dirname, "../packages/hardhat/contracts-flattened/EquoraMatrix.sol");

patchMatrixFile(file1);
patchMatrixFile(file2);
console.log("Finished patching EquoraMatrix files.");

