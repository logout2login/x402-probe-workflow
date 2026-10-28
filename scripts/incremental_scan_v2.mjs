#!/usr/bin/env node
/**
 * Incremental Scan — 只掃 cursor 之後嘅新 block
 * RPC failover: sepolia.base.org → drpc → publicnode
 * Concurrency: 3 (public endpoints 唔好打太狠)
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const LOGS_DIR = process.argv[2] || 'logs';
fs.mkdirSync(LOGS_DIR, { recursive: true });

const LOG_FILE = path.join(LOGS_DIR, `scan_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`);
function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

// ── RPC endpoints (ordered by reliability from HK) ──
const RPC_ENDPOINTS = [
  "https://base-sepolia-rpc.publicnode.com", // fastest from HK
  "https://sepolia.base.org",     // Base official, free, no key
  "https://base-sepolia.drpc.org", // drpc, rate-limited fallback
];
const CHUNK = 50;
const CONC  = 3;  // public endpoints 限流嚴，3 夠用
const MAX_RETRIES = 3;

const USDC      = "0x036CBD53842c5426634e7929541eC2318f3dCF7e";
const TOPIC0    = "0x98de503528ee59b575ef0c0a2576a82497bfc029a5685b209e9ec333479b10a5";
const BUYER_ADDR = "0xc8f87fe6fe8cda55e284e2a39bd4b8e6bf047e90";
const fromTopic = "0x000000000000000000000000" + BUYER_ADDR.slice(2);

let rpcIdx = 0;
let activeRPC = RPC_ENDPOINTS[0];

async function rpc(method, params) {
  // Try current endpoint first, then rotate on failure
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const r = await fetch(activeRPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: AbortSignal.timeout(15000)
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
      return j.result;
    } catch (e) {
      if (attempt < MAX_RETRIES - 1) {
        const wait = Math.min(1000 * Math.pow(2, attempt), 8000);
        log(`  ⚠ RPC fail (${activeRPC}): ${e.message} — retry ${attempt+1}/${MAX_RETRIES} in ${wait}ms`);
        await new Promise(r => setTimeout(r, wait));
        // Rotate endpoint on persistent failure
        if (e.message.includes("Temporary") || e.message.includes("rate")) {
          rpcIdx = (rpcIdx + 1) % RPC_ENDPOINTS.length;
          activeRPC = RPC_ENDPOINTS[rpcIdx];
          log(`  🔄 Switching to ${activeRPC}`);
        }
      } else {
        throw e;
      }
    }
  }
}

async function main() {
  log("=== Incremental Scan v2 (sepolia.base.org primary) ===");

  // 1. Get latest block
  const latestHex = await rpc("eth_blockNumber", []);
  const latestBlock = parseInt(latestHex, 16);
  log(`Latest block: ${latestBlock}`);

  // 2. Load cursor
  let lastBlock = 0;
  try {
    const cursor = JSON.parse(fs.readFileSync(path.join(LOGS_DIR, 'cursor.json'), 'utf8'));
    lastBlock = parseInt(cursor.lastBlock || 0, 10);
    log(`Cursor: ${lastBlock}`);
  } catch {
    log("No cursor found, starting from 0");
  }

  const startBlock = Math.max(lastBlock + 1, latestBlock - 1200); // 10-min window max
  if (startBlock > latestBlock) {
    log("Already up to date, nothing to scan");
    return;
  }

  const range = latestBlock - startBlock + 1;
  const totalChunks = Math.ceil(range / CHUNK);
  log(`Scanning ${startBlock} → ${latestBlock} (${range} blocks, ${totalChunks} chunks)`);
  log(`Using RPC: ${activeRPC}`);

  // 3. Scan
  const found = [];
  let done = 0;
  let errors = 0;

  async function worker(idx) {
    const a = startBlock + idx * CHUNK;
    const b = Math.min(latestBlock, a + CHUNK - 1);
    for (let retry = 0; retry <= MAX_RETRIES; retry++) {
      try {
        const res = await rpc("eth_getLogs", [{
          fromBlock: "0x" + a.toString(16),
          toBlock: "0x" + b.toString(16),
          address: USDC,
          topics: [TOPIC0, fromTopic]
        }]);
        if (Array.isArray(res)) found.push(...res);
        done++;
        if (done % 10 === 0) log(`  ${done}/${totalChunks} done, ${found.length} events, err=${errors}`);
        return;
      } catch (e) {
        if (retry < MAX_RETRIES) {
          const wait = 500 * Math.pow(2, retry);
          log(`  retry ${retry+1} for chunk ${idx} (${a}-${b}): ${e.message}`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          errors++;
          log(`  ❌ chunk ${idx} (${a}-${b}) failed after ${MAX_RETRIES} retries: ${e.message}`);
        }
      }
    }
  }

  const queue = Array.from({ length: totalChunks }, (_, i) => i);
  await Promise.all(Array.from({ length: CONC }, async () => {
    while (queue.length > 0) await worker(queue.shift());
  }));

  log(`\nDone: ${found.length} new events | ${done}/${totalChunks} chunks succeeded | ${errors} errors`);
  log(`RPC used: ${activeRPC}`);

  // 4. Merge & save
  let all = [];
  try { all = JSON.parse(fs.readFileSync(path.join(LOGS_DIR, 'scan_events.json'), 'utf8')); } catch {}
  const merged = [...all, ...found];
  const unique = [...new Map(merged.map(e => [e.transactionHash, e])).values()];
  fs.writeFileSync(path.join(LOGS_DIR, 'scan_events.json'), JSON.stringify(unique, null, 2));
  log(`Total events: ${unique.length} (${found.length} new)`);

  // 5. Update cursor
  const cursor = {
    lastBlock: latestBlock,
    lastUpdate: new Date().toISOString(),
    totalScanned: latestBlock,
    totalEvents: unique.length,
    rpcEndpoint: activeRPC
  };
  fs.writeFileSync(path.join(LOGS_DIR, 'cursor.json'), JSON.stringify(cursor, null, 2));
  log(`Cursor updated: block ${latestBlock}`);

  // 6. Show new events
  if (found.length > 0) {
    log("\n=== New Events ===");
    for (const e of found) {
      const block = parseInt(e.blockNumber, 16);
      const owner = e.topics[2] ? ('0x' + e.topics[2].slice(26)) : 'n/a';
      const ts = e.blockTimestamp ? new Date(parseInt(e.blockTimestamp, 16) * 1000).toISOString() : 'n/a';
      log(`  Block ${block} | ${ts} | tx=${e.transactionHash.slice(0, 18)}...`);
    }
  } else {
    log("\n✅ No new events (same as before or scan completed)");
  }
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
