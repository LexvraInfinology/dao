const fs = require('fs');

const content = fs.readFileSync('scratch/trobsafe_ext/assets/dappPopup-Crzi0Ea0.js', 'utf8');

// Find function Ue
const idx = content.indexOf('Ue(');
console.log('Context around Ue:');
console.log(content.slice(Math.max(0, idx - 200), idx + 400));

