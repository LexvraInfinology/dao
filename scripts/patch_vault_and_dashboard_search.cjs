const fs = require('fs');

// 1. apps/web-matrix/components/matrix/MatrixTreeView.tsx
let treeView = fs.readFileSync('apps/web-matrix/components/matrix/MatrixTreeView.tsx', 'utf8');
treeView = treeView.replace(
  /sponsor\.toLowerCase\(\)\s*===\s*"0x5181d06090f16c9bffef71e2ccd7ed17f676aad9"\s*\|\|\s*sponsor\.toLowerCase\(\)\s*===\s*"415181d06090f16c9bffef71e2ccd7ed17f676aad9"/,
  'sponsor.toLowerCase() === toHexAddress(CONTRACT_ADDRESSES.vault).toLowerCase() || sponsor.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase()'
);
if (!treeView.includes('CONTRACT_ADDRESSES')) {
  treeView = treeView.replace(
    'import { getOnChainQualification, getSlotCost } from "@/lib/contracts";',
    'import { getOnChainQualification, getSlotCost, CONTRACT_ADDRESSES, toHexAddress } from "@/lib/contracts";'
  );
}
fs.writeFileSync('apps/web-matrix/components/matrix/MatrixTreeView.tsx', treeView, 'utf8');
console.log('1. Updated MatrixTreeView.tsx');

// 2. apps/web-matrix/lib/contracts.ts
let contracts = fs.readFileSync('apps/web-matrix/lib/contracts.ts', 'utf8');
contracts = contracts.replace(
  'sponsorAddress !== "0x5181d06090f16c9bffef71e2ccd7ed17f676aad9"',
  'sponsorAddress !== toHexAddress(CONTRACT_ADDRESSES.vault).toLowerCase()'
);
fs.writeFileSync('apps/web-matrix/lib/contracts.ts', contracts, 'utf8');
console.log('2. Updated contracts.ts');

// 3. apps/web-matrix/app/dashboard/page.tsx
let dash = fs.readFileSync('apps/web-matrix/app/dashboard/page.tsx', 'utf8');

// Ensure import has getOnChainUserById, getOnChainUserByCode
if (!dash.includes('getOnChainUserById')) {
  dash = dash.replace(
    'import { CONTRACT_ADDRESSES, getOnChainSlotDetails, toHexAddress, getSlotCost, EXPLORER_URL } from "@/lib/contracts";',
    'import { CONTRACT_ADDRESSES, getOnChainSlotDetails, toHexAddress, getSlotCost, EXPLORER_URL, getOnChainUserById, getOnChainUserByCode } from "@/lib/contracts";'
  );
  if (!dash.includes('getOnChainUserById')) {
    dash = dash.replace(
      'import { formatAddress, toTrobBase58 } from "@/lib/format";',
      'import { formatAddress, toTrobBase58 } from "@/lib/format";\nimport { getOnChainUserById, getOnChainUserByCode } from "@/lib/contracts";'
    );
  }
}

// Add URL params detection on mount
const targetMount = `  React.useEffect(() => {
    setMounted(true);
  }, []);`;

const replacementMount = `  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryAddr = params.get("address") || params.get("user") || params.get("wallet");
      const queryId = params.get("id") || params.get("code");
      if (queryAddr && ((queryAddr.startsWith("0x") && queryAddr.length === 42) || (queryAddr.startsWith("T") && queryAddr.length === 34))) {
        changeAddress(queryAddr);
      } else if (queryId && /^\\d+$/.test(queryId)) {
        const idNum = parseInt(queryId, 10);
        getOnChainUserByCode(idNum).then((byCode) => {
          if (byCode) changeAddress(byCode);
          else {
            getOnChainUserById(idNum).then((byId) => {
              if (byId) changeAddress(byId);
            });
          }
        });
      }
    }
  }, [changeAddress]);`;

if (dash.includes(targetMount)) {
  dash = dash.replace(targetMount, replacementMount);
}

// Update handleSearch to resolve on-chain operative IDs
const targetSearch = `    } else if (/^\\d+$/.test(q)) {
      toast.info("Operative Search", \`Looking up Operative #\${q}...\`);
    } else {`;

const replacementSearch = `    } else if (/^\\d+$/.test(q)) {
      toast.info("Operative Search", \`Looking up Operative #\${q} on-chain...\`);
      const num = parseInt(q, 10);
      let resolved = await getOnChainUserByCode(num);
      if (!resolved) {
        resolved = await getOnChainUserById(num);
      }
      if (resolved) {
        changeAddress(resolved);
        toast.success("Operative Found", \`Inspecting Operative #\${q} (\${formatAddress(resolved)})\`);
        setSearchQuery("");
      } else {
        toast.error("Not Found", \`No on-chain operative found for #\${q}\`);
      }
    } else {`;

dash = dash.replace(targetSearch, replacementSearch);

fs.writeFileSync('apps/web-matrix/app/dashboard/page.tsx', dash, 'utf8');
console.log('3. Updated DashboardPage.tsx');

