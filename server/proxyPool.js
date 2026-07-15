import fs from 'fs';
import https from 'https';
import http from 'http';

const PROXIES_FILE = './data/proxies_info.json';
const CHECK_INTERVAL = 5 * 60 * 1000;
const TIMEOUT = 5000;

let pool = {
  http: [],
  socks4: [],
  alive: [],
  index: 0,
  lastCheck: 0,
  checking: false,
};

function loadProxies() {
  try {
    if (!fs.existsSync(PROXIES_FILE)) return;
    const raw = fs.readFileSync(PROXIES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    pool.http = (data.HTTP || []).map(p => p.proxy);
    pool.socks4 = (data.SOCKS4 || []).map(p => p.proxy);
  } catch (e) {
    console.error('[ProxyPool] Erro ao carregar proxies:', e.message);
  }
}

function testProxy(proxy) {
  return new Promise((resolve) => {
    const [host, port] = proxy.split(':');
    const req = http.request({
      hostname: host,
      port: parseInt(port),
      path: 'http://httpbin.org/ip',
      method: 'GET',
      timeout: TIMEOUT,
      headers: { Host: 'httpbin.org' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.origin ? proxy : null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

async function checkProxies() {
  if (pool.checking) return;
  pool.checking = true;

  const allProxies = [...pool.http, ...pool.socks4];
  if (allProxies.length === 0) {
    pool.checking = false;
    return;
  }

  const batchSize = 20;
  const alive = [];

  for (let i = 0; i < allProxies.length; i += batchSize) {
    const batch = allProxies.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(p => testProxy(p)));
    results.forEach(r => { if (r) alive.push(r); });
  }

  pool.alive = alive;
  pool.index = 0;
  pool.lastCheck = Date.now();
  pool.checking = false;

  console.log(`[ProxyPool] ${alive.length}/${allProxies.length} proxies vivos`);
}

export function getProxyPool() {
  loadProxies();

  if (!pool.lastCheck) {
    checkProxies();
  }

  setInterval(() => {
    checkProxies();
  }, CHECK_INTERVAL);

  return {
    async getProxy() {
      if (Date.now() - pool.lastCheck > CHECK_INTERVAL) {
        await checkProxies();
      }

      if (pool.alive.length === 0) return null;
      if (pool.index >= pool.alive.length) pool.index = 0;
      return pool.alive[pool.index++];
    },

    getAliveCount() {
      return pool.alive.length;
    },

    async refresh() {
      await checkProxies();
    },

    reportDead(proxy) {
      pool.alive = pool.alive.filter(p => p !== proxy);
      console.log(`[ProxyPool] Proxy removido (morto): ${proxy}`);
    },
  };
}
