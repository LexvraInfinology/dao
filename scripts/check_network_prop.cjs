const fs = require('fs');
const content = fs.readFileSync('apps/web-matrix/.next/static/chunks/650-5a9718bae6893d44.js', 'utf8');

const matches = content.match(/.{0,40}network.{0,40}/g);
console.log('Network references in bundle:', matches);

