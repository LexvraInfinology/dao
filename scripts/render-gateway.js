/**
 * EQUORA PROTOCOL — RENDER MULTI-APP GATEWAY
 * 
 * Runs both web-matrix (port 3001) and web-dao (port 3000) on a single Render service.
 * Listens on process.env.PORT and reverse-proxies traffic:
 *  - Requests to /dao, /api/dao, /api/auth, /audit, /deploy -> web-dao (port 3000)
 *  - Host matching equorafidao.com -> web-dao (port 3000)
 *  - All other requests -> web-matrix (port 3001)
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PUBLIC_PORT = parseInt(process.env.PORT || '10000', 10);
const MATRIX_PORT = 3001;
const DAO_PORT = 3000;

const rootDir = path.resolve(__dirname, '..');

console.log(`[Gateway] Starting Equora Multi-App Gateway on port ${PUBLIC_PORT}...`);

// 1. Spawn web-matrix
console.log(`[Gateway] Spawning web-matrix on port ${MATRIX_PORT}...`);
const matrixProcess = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'start', '-p', String(MATRIX_PORT)],
  {
    cwd: path.join(rootDir, 'apps/web-matrix'),
    env: { ...process.env, PORT: String(MATRIX_PORT) },
    stdio: 'inherit',
  }
);

// 2. Spawn web-dao
console.log(`[Gateway] Spawning web-dao on port ${DAO_PORT}...`);
const daoProcess = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'start', '-p', String(DAO_PORT)],
  {
    cwd: path.join(rootDir, 'apps/web-dao'),
    env: { ...process.env, PORT: String(DAO_PORT) },
    stdio: 'inherit',
  }
);

function handleExit(code, signal) {
  console.log(`[Gateway] Child process exited (${code || signal}). Shutting down gateway...`);
  try { matrixProcess.kill(); } catch (e) {}
  try { daoProcess.kill(); } catch (e) {}
  process.exit(code || 0);
}

matrixProcess.on('exit', handleExit);
daoProcess.on('exit', handleExit);

// 3. HTTP Reverse Proxy
const server = http.createServer((req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  const url = req.url || '/';

  // Route decision:
  // DAO routing: if host is dao domain OR path is /dao, /api/dao, /api/auth, /audit, etc.
  const isDao =
    host.includes('dao') ||
    url.startsWith('/dao') ||
    url.startsWith('/api/dao') ||
    url.startsWith('/api/auth') ||
    url.startsWith('/api/trobsafe') ||
    url.startsWith('/api/seats') ||
    url.startsWith('/api/price') ||
    url.startsWith('/audit') ||
    url.startsWith('/trobsafe');

  const targetPort = isDao ? DAO_PORT : MATRIX_PORT;

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': 'https',
      'x-forwarded-port': String(PUBLIC_PORT),
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    // If backend is still starting up
    if (!res.headersSent) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end(`Equora Service Starting Up (${isDao ? 'DAO' : 'Matrix'}). Please refresh in a moment.`);
    }
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PUBLIC_PORT, '0.0.0.0', () => {
  console.log(`[Gateway] Equora Gateway successfully listening on 0.0.0.0:${PUBLIC_PORT}`);
  console.log(`[Gateway] -> Routing DAO traffic to 127.0.0.1:${DAO_PORT}`);
  console.log(`[Gateway] -> Routing Matrix traffic to 127.0.0.1:${MATRIX_PORT}`);
});
