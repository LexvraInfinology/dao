const { execSync } = require('child_process');
const fs = require('fs');

if (fs.existsSync('apps/web/package.json')) {
  console.log('📦 [build] Building Next.js from root workspace...');
  execSync('npx next build', { cwd: 'apps/web', stdio: 'inherit' });
} else {
  console.log('📦 [build] Building Next.js directly inside web app directory...');
  execSync('npx next build', { stdio: 'inherit' });
}
