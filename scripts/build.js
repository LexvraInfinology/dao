const { execSync } = require('child_process');
const fs = require('fs');

if (fs.existsSync('packages/nextjs/package.json')) {
  console.log('📦 [build] Building Next.js from root workspace...');
  execSync('npm --prefix packages/nextjs run build', { stdio: 'inherit' });
} else {
  console.log('📦 [build] Building Next.js directly inside packages/nextjs...');
  execSync('npx next build', { stdio: 'inherit' });
}
