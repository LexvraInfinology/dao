const fs = require('fs');
const path = 'apps/web-matrix/lib/stores/useFinanceStore.ts';
let content = fs.readFileSync(path, 'utf8');

// Update import
content = content.replace(
  'import { getOnChainUserProfile, getOnChainJoinedTransactions } from "../contracts";',
  'import { getOnChainUserProfile, getOnChainJoinedTransactions, getOnChainUserTransactions } from "../contracts";'
);

const oldFetch = `    try {
      const res = await matrixApi.getTransactions(addr, options);
      if (res && res.items && res.items.length > 0) {
        set({
          transactions: res.items,
          transactionStats: res.stats || null,
          loadingTransactions: false,
        });
        return;
      }
    } catch {
      // Fallback to verified on-chain transactions
    }

    try {
      const onChainRes = getOnChainJoinedTransactions(addr);
      set({
        transactions: onChainRes.items,
        transactionStats: onChainRes.stats,
        loadingTransactions: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to load transactions",
        loadingTransactions: false,
      });
    }`;

const newFetch = `    // 1. Prioritize live 100% on-chain blockchain transaction ledger
    try {
      const onChainRes = await getOnChainUserTransactions(addr);
      if (onChainRes && onChainRes.items && onChainRes.items.length > 0) {
        set({
          transactions: onChainRes.items,
          transactionStats: onChainRes.stats,
          loadingTransactions: false,
        });
        return;
      }
    } catch (err: any) {
      console.warn("[FinanceStore] On-chain tx ledger notice:", err?.message || err);
    }

    // 2. Fallback to API / DB
    try {
      const res = await matrixApi.getTransactions(addr, options);
      if (res && res.items && res.items.length > 0) {
        set({
          transactions: res.items,
          transactionStats: res.stats || null,
          loadingTransactions: false,
        });
        return;
      }
    } catch {}

    set({ loadingTransactions: false });`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  console.log('Patched useFinanceStore.ts (LF)');
} else {
  const oldFetchCRLF = oldFetch.replace(/\n/g, '\r\n');
  const newFetchCRLF = newFetch.replace(/\n/g, '\r\n');
  if (content.includes(oldFetchCRLF)) {
    content = content.replace(oldFetchCRLF, newFetchCRLF);
    console.log('Patched useFinanceStore.ts (CRLF)');
  } else {
    console.warn('oldFetch not found in useFinanceStore.ts');
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Saved useFinanceStore.ts');
