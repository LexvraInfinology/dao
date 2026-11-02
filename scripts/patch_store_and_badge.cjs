const fs = require('fs');

// 1. Patch useMatrixStore.ts
{
  const p = 'apps/web-matrix/lib/stores/useMatrixStore.ts';
  let c = fs.readFileSync(p, 'utf8');
  const target = `        const TROB_PRICE_USD = 0.056;
        const totalEarnedTrob = onChainProf?.totalEarningsTrob ?? (onChainDetails?.totalEarned ?? 0);
        const totalEarnedUsd = onChainProf?.totalEarningsUsd ?? (totalEarnedTrob * TROB_PRICE_USD);
        const availableWithdrawTrob = onChainProf?.availableBalanceTrob ?? 0;
        const availableWithdrawUsd = onChainProf?.availableBalanceUsd ?? (availableWithdrawTrob * TROB_PRICE_USD);`;

  const repl = `        const TROB_PRICE_USD = 0.056;
        const totalEarnedUsd = (onChainDetails?.totalEarnedUsd && onChainDetails.totalEarnedUsd > 0)
          ? onChainDetails.totalEarnedUsd
          : (onChainProf?.totalEarningsUsd ?? 0);
        const totalEarnedTrob = onChainDetails?.totalEarnedTrob ?? onChainProf?.totalEarningsTrob ?? (totalEarnedUsd > 0 ? totalEarnedUsd / TROB_PRICE_USD : 0);
        const availableWithdrawUsd = totalEarnedUsd;
        const availableWithdrawTrob = totalEarnedTrob;`;

  if (c.includes(target)) {
    c = c.replace(target, repl);
    console.log('Patched useMatrixStore.ts (LF)');
  } else {
    const targetCRLF = target.replace(/\n/g, '\r\n');
    const replCRLF = repl.replace(/\n/g, '\r\n');
    if (c.includes(targetCRLF)) {
      c = c.replace(targetCRLF, replCRLF);
      console.log('Patched useMatrixStore.ts (CRLF)');
    } else {
      console.warn('target not found in useMatrixStore.ts');
    }
  }
  fs.writeFileSync(p, c, 'utf8');
}

// 2. Patch ReferralLinkCard.tsx for qualification badge
{
  const p = 'apps/web-matrix/components/dashboard/ReferralLinkCard.tsx';
  let c = fs.readFileSync(p, 'utf8');
  const target = `            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 \${
              isQualified
                ? "bg-[#e8fbf5] text-[#0e9f79] border border-[#c3f0e0]"
                : "bg-[#fff6df] text-[#b97a17] border border-[#fae2ab]"
            }\`}>
              <ShieldCheck className="w-3 h-3" />
              {isQualified ? "Qualified (100% Yield)" : "Need 2 Directs"}
            </span>`;

  const repl = `            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 \${
              (isQualified || directsCount >= 2)
                ? "bg-[#e8fbf5] text-[#0e9f79] border border-[#c3f0e0]"
                : "bg-[#fff6df] text-[#b97a17] border border-[#fae2ab]"
            }\`}>
              <ShieldCheck className="w-3 h-3" />
              {(isQualified || directsCount >= 2) ? "Qualified (100% Yield)" : "Need 2 Directs"}
            </span>`;

  if (c.includes(target)) {
    c = c.replace(target, repl);
    console.log('Patched ReferralLinkCard.tsx (LF)');
  } else {
    const targetCRLF = target.replace(/\n/g, '\r\n');
    const replCRLF = repl.replace(/\n/g, '\r\n');
    if (c.includes(targetCRLF)) {
      c = c.replace(targetCRLF, replCRLF);
      console.log('Patched ReferralLinkCard.tsx (CRLF)');
    } else {
      console.warn('target not found in ReferralLinkCard.tsx');
    }
  }
  fs.writeFileSync(p, c, 'utf8');
}
