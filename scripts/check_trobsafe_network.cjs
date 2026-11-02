const fs = require('fs');

const path = 'scratch/trobsafe_ext/assets/dappPopup-Crzi0Ea0.js';
if (fs.existsSync(path)) {
  const content = fs.readFileSync(path, 'utf8');
  const matches = content.match(/.{0,50}network.{0,50}/g);
  console.log('Matches in TrobSafe ext:', matches?.slice(0, 10));
} else {
  console.log('File does not exist');
}

