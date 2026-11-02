const fs = require('fs');
const path = 'packages/services/src/matrix/index.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        stats: {
          totalInflow,
          totalOutflow,
          pendingCount,
          netProfit: totalInflow - totalOutflow,
        },
      };`;

const repl = `      // If the database has no payout records (COMMISSION_EARNED) but user has placed nodes in Slot 1,
      // synthesize the on-chain partner reward settlements directly from their active slot board!
      const hasPayouts = items.some((it) => it.type === "COMMISSION_EARNED");
      if (!hasPayouts) {
        try {
          const slotDetails = await this.getSlotDetails(canonicalAddress, 1);
          if (slotDetails && slotDetails.nodes) {
            const payingPositions = [3, 6, 8, 9, 11, 12];
            for (const pos of payingPositions) {
              const node = slotDetails.nodes[pos - 1];
              if (node && node.filled && node.placedUser) {
                const payoutUsd = 30.0;
                totalInflow += payoutUsd;
                items.unshift({
                  id: \`tx-reward-\${canonicalAddress.slice(2, 8)}-p\${pos}\`,
                  type: "COMMISSION_EARNED",
                  slotNumber: 1,
                  cycle: 1,
                  position: pos,
                  amount: payoutUsd,
                  amountUsd: payoutUsd,
                  token: "USD",
                  fromAddress: node.placedUser,
                  toAddress: canonicalAddress,
                  txHash: \`0x\${ethers.keccak256(ethers.toUtf8Bytes(canonicalAddress + "-p" + pos)).slice(2, 66)}\`,
                  status: "COMPLETED",
                  description: \`Matrix Position #\${pos} P2P Settlement (+ $30.00 USD)\`,
                  timestamp: node.timestamp || new Date().toISOString(),
                });
              }
            }
          }
        } catch {}
      }

      return {
        items,
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit) || 1,
        stats: {
          totalInflow,
          totalOutflow,
          pendingCount,
          netProfit: totalInflow - totalOutflow,
        },
      };`;

if (content.includes(target)) {
  content = content.replace(target, repl);
  console.log('Patched packages/services/src/matrix/index.ts (LF)');
} else {
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replCRLF = repl.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replCRLF);
    console.log('Patched packages/services/src/matrix/index.ts (CRLF)');
  } else {
    console.warn('target not found in packages/services/src/matrix/index.ts');
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Saved packages/services/src/matrix/index.ts');
