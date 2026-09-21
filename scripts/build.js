const { execSync } = require('child_process');
const fs = require('fs');

if (fs.existsSync('apps/web/package.json')) {
  console.log('📦 [build] Building Next.js from apps/web workspace...');
  execSync('npm --prefix apps/web run build', { stdio: 'inherit' });
} else {
  console.log('📦 [build] Building Next.js directly inside web app...');
  execSync('npx next build', { stdio: 'inherit' });
}
