async function testUrls() {
  const daoAddress = 'TAuwP4TDvmGp6FT5wqcSz2VMZVbuusneto';
  const urls = [
    `https://backend.trobchain.com/v1/accounts/${daoAddress}/transactions?limit=5`,
    `https://trobchain.com/api/accounts/${daoAddress}/transactions?limit=5`,
    `https://trobchain.com/api/account/transaction?address=${daoAddress}&limit=5`,
    `https://fullnode-one.trobchain.com/v1/accounts/${daoAddress}/transactions?limit=5`,
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      console.log(u, '=> status:', res.status, 'isJson:', text.startsWith('{') || text.startsWith('['));
      if (text.startsWith('{')) {
        console.log('Sample:', text.slice(0, 150));
      }
    } catch (e) {
      console.log(u, '=> error:', e.message);
    }
  }
}
testUrls();

