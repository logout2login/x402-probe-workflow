#!/usr/bin/env node
import fs from 'fs';
const TARGET = 'https://x402.org/facilitator';

const start = Date.now();
try {
  const resp = await fetch(TARGET, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
  const latency = ((Date.now() - start) / 1000).toFixed(3);
  console.log(`PROBE code=${resp.status} lat=${latency}s target=${TARGET}`);
  const result = { status: resp.status, latency: parseFloat(latency), target: TARGET };
  const now = new Date().toISOString();
  const logEntry = `${now} ${JSON.stringify(result)}`;
  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/probe.log', logEntry + '\n');
  console.log(logEntry);
} catch (e) {
  const latency = ((Date.now() - start) / 1000).toFixed(3);
  console.log(`PROBE failed lat=${latency}s target=${TARGET} error=${e.message}`);
  const result = { status: 0, latency: parseFloat(latency), target: TARGET, error: e.message };
  const now = new Date().toISOString();
  const logEntry = `${now} ${JSON.stringify(result)}`;
  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/probe.log', logEntry + '\n');
  console.log(logEntry);
}
