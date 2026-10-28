#!/usr/bin/env node
const fs = require('fs');
const TARGET = 'https://x402.org/facilitator';

async function probe() {
  const start = Date.now();
  try {
    const resp = await fetch(TARGET, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    const latency = ((Date.now() - start) / 1000).toFixed(3);
    console.log(`PROBE code=${resp.status} lat=${latency}s target=${TARGET}`);
    return { status: resp.status, latency: parseFloat(latency), target: TARGET };
  } catch (e) {
    const latency = ((Date.now() - start) / 1000).toFixed(3);
    console.log(`PROBE failed lat=${latency}s target=${TARGET} error=${e.message}`);
    return { status: 0, latency: parseFloat(latency), target: TARGET, error: e.message };
  }
}

probe().then(r => {
  const now = new Date().toISOString();
  const logEntry = `${now} ${JSON.stringify(r)}`;
  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/probe.log', logEntry + '\n');
  console.log(logEntry);
}).catch(e => console.error('Probe failed:', e));
