const contract = "TWZZ1ZvU2WmiEYzoXkeKjeKY66nyww2GbY";

async function testTronEvents() {
  const urls = [
    `https://testnet-backend.trobchain.com/v1/contracts/${contract}/events`,
    `https://testnet-backend.trobchain.com/v1/contract/${contract}/events`,
    `https://testnet-backend.trobchain.com/v1/contracts/${contract}/transactions`,
    `https://testnet-backend.trobchain.com/v1/accounts/${contract}/transactions`,
    `https://testnet-backend.trobchain.com/v1/contracts/${contract}`
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`Result for ${url} (status ${res.status}):`, text.slice(0, 300));
    } catch (err) {
      console.log(`Failed for ${url}:`, err.message);
    }
  }
}

testTronEvents();
