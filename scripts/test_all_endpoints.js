const http = require('http');

const endpoints = [
  '/api/dao/stats',
  '/api/dao/members',
  '/api/dao/member/TFciprfGxcZ9W7gzwu1Nvc9cEoqnv8mdCp',
  '/api/dao/lounge/TFciprfGxcZ9W7gzwu1Nvc9cEoqnv8mdCp',
  '/api/dao/profile/TFciprfGxcZ9W7gzwu1Nvc9cEoqnv8mdCp',
  '/api/dao/transactions',
  '/api/dao/events',
  '/api/dao/eligibility/TFciprfGxcZ9W7gzwu1Nvc9cEoqnv8mdCp',
  '/api/price/trob',
];

async function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ path, status: res.statusCode, success: json.success, sample: json.data || json });
        } catch (e) {
          resolve({ path, status: res.statusCode, error: e.message, raw: data.slice(0, 100) });
        }
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing Next.js API endpoints on http://localhost:3000...');
  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    console.log(`[${res.status || 'ERR'}] ${ep} => success: ${res.success}`);
    if (res.status !== 200 || !res.success) {
      console.log('  Details:', JSON.stringify(res).slice(0, 300));
    }
  }
}

run();
