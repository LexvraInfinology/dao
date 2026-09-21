/**
 * patch-qr.js
 * Automatically patches the 'qr' library to allow border: 0 (used by RainbowKit's cuer dependency).
 */
const fs = require('fs');
const path = require('path');

const potentialPaths = [
  path.resolve(__dirname, '..', 'node_modules', 'qr', 'index.js'),
  path.resolve(__dirname, '..', '..', 'node_modules', 'qr', 'index.js'),
  path.resolve(__dirname, '..', '..', '..', 'node_modules', 'qr', 'index.js'),
];

let patched = false;

for (const qrIndexPath of potentialPaths) {
  if (fs.existsSync(qrIndexPath)) {
    let content = fs.readFileSync(qrIndexPath, 'utf8');

    // Fix 1: Bitmap.border method
    content = content.replace(
      /if \(!Number\.isSafeInteger\(border\) \|\| border <= 0\)\s*throw new Error\(`Bitmap\.border: invalid size=\${border}`\);/,
      `if (!Number.isSafeInteger(border) || border < 0)\n            throw new Error(\`Bitmap.border: invalid size=\${border}\`);\n        if (border === 0)\n            return this;`
    );

    // Fix 2: encodeQR function
    content = content.replace(
      /if \(!Number\.isSafeInteger\(border\) \|\| border <= 0\)\s*throw new Error\(`invalid border=\${border}`\);\s*res = res\.border\(border, false\);/,
      `if (!Number.isSafeInteger(border) || border < 0)\n        throw new Error(\`invalid border=\${border}\`);\n    if (border > 0)\n        res = res.border(border, false);`
    );

    fs.writeFileSync(qrIndexPath, content, 'utf8');
    console.log(`✅ [patch-qr] Successfully patched ${qrIndexPath} (allowed border=0)`);
    patched = true;
  }
}

if (!patched) {
  console.log('ℹ️ [patch-qr] qr module not yet installed or not found.');
}
