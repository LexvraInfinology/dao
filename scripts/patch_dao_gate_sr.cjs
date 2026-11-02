const fs = require('fs');

let daoGate = fs.readFileSync('apps/web-dao/src/components/dao/DaoAccessGate.tsx', 'utf8');
daoGate = daoGate.replace(
  "|| 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY'}",
  "|| (process.env.NEXT_PUBLIC_IS_MAINNET === 'true' ? 'TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY' : 'TJRjpQo1M8Ai8LQaVqX1o6kCFvgR2qJvV5')}"
);
fs.writeFileSync('apps/web-dao/src/components/dao/DaoAccessGate.tsx', daoGate, 'utf8');
console.log('Patched DaoAccessGate fallback SR successfully');

