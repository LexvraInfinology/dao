const fs = require('fs');
let content = fs.readFileSync('apps/web-matrix/components/matrix/MatrixAccessGate.tsx', 'utf8');
const target = 'const rawSr = eligibility?.condition2?.srVote?.officialSrAddress || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";';
const target2 = 'const officialSr = rawSr.includes("K7S") ? "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY" : rawSr;';

const replacement = `const isMainnet = process.env.NEXT_PUBLIC_IS_MAINNET === 'true';
          const defaultSr = isMainnet ? "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY" : (process.env.NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS || "TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5");
          const rawSr = eligibility?.condition2?.srVote?.officialSrAddress || defaultSr;
          const officialSr = rawSr.includes("K7S") ? defaultSr : rawSr;`;

if (content.includes(target)) {
  const lines = content.split(/\r?\n/);
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(target)) {
      newLines.push('          ' + replacement);
      if (lines[i+1] && lines[i+1].includes(target2)) {
        i++; // skip next line
      }
    } else {
      newLines.push(lines[i]);
    }
  }
  fs.writeFileSync('apps/web-matrix/components/matrix/MatrixAccessGate.tsx', newLines.join('\n'), 'utf8');
  console.log('Successfully patched MatrixAccessGate.tsx');
} else {
  console.log('Target not found in MatrixAccessGate.tsx');
}

