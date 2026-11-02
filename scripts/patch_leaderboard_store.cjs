const fs = require('fs');
const file = 'apps/web-matrix/lib/stores/useLeaderboardStore.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `const data = await matrixApi.getLeaderboard(period, 50).catch(() => null);
      if (data && data.length > 0) {
        set({ entries: data, loading: false });
        return;
      }`;

const replacement = `const data = await matrixApi.getLeaderboard(period, 50).catch(() => null);
      if (data && data.length > 0) {
        const cleaned = data.filter((e) => {
          const a = (e.address || '').toLowerCase();
          return (
            a !== '0x7124b32b48786a13177f3bdc9620e7a48eb9c902' &&
            a !== 'tlhtkgsbruwfyv8mo6b4z3rrj1k1wlwzwa' &&
            a !== '0xef380fa5abfba8a057e1df49c0f6b3d6b24280ee'
          );
        });
        set({ entries: cleaned, loading: false });
        return;
      }`;

content = content.replace(/\r\n/g, '\n');
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully patched useLeaderboardStore.ts');
} else {
  console.log('Target not found in useLeaderboardStore.ts');
}

