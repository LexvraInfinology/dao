const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'generated');
const distDir = path.join(__dirname, '..', 'dist', 'generated');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    try {
      fs.copyFileSync(src, dest);
    } catch (err) {
      // If file is locked (e.g. query engine DLL locked by local dev server on Windows), ignore if destination already exists
      if (fs.existsSync(dest)) {
        console.warn(`[copy-client] Kept existing locked file: ${path.basename(dest)}`);
      } else {
        throw err;
      }
    }
  }
}

if (fs.existsSync(srcDir)) {
  copyRecursive(srcDir, distDir);
  console.log('[database] Prisma client assets copied to dist/generated');
} else {
  console.warn('[database] src/generated not found, skipping copy');
}
