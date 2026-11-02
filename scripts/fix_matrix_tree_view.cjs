const fs = require('fs');
let file = fs.readFileSync('apps/web-matrix/components/matrix/MatrixTreeView.tsx', 'utf8');
file = file.replace(
  'import { getOnChainQualification, getSlotCost } from "@/lib/contracts";',
  'import { getOnChainQualification, getSlotCost, CONTRACT_ADDRESSES, toHexAddress } from "@/lib/contracts";'
);
fs.writeFileSync('apps/web-matrix/components/matrix/MatrixTreeView.tsx', file, 'utf8');
console.log('Fixed imports in MatrixTreeView.tsx');

