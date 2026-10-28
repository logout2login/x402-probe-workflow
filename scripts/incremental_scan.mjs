#!/usr/bin/env node
/**
 * Incremental scan for AuthorizationWithdrawn events (TWA buyer scans)
 * Uses cursor.json to track progress - only scans NEW blocks since last run
 * Multi-endpoint failover: Base Sepolia official > Ankr > drpc
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, 'logs');

// Contract addresses
const USDC = "0x036CBD53842c5426634e7929541eC2318f3dCF7e";
const TOPIC0 = "0x98de503528ee59b575ef0c0a2576a82497bfc029a5685b209e9ec333479b10a5"; // AuthorizationWithdrawn
const BUYER_ADDR = "0xc8f87fe6fe8cda55e284e2a39bd4b8e6bf047e90";
const fromTopic = "0x000000000000000000000000" + BUYER_ADDR.slice(2);

// Multi-endpoint RPC failover (ordered by preference)
const RPC_ENDPOINTS = [
  "https://base-sepolia.base.org",     // Base official
  "https://rpc.ankr.com/base_sepolia", // Ankr
  "https://base-sepolia.drpc.org",     // drpc (fallback)
];

const CHUNK = 50;
const CONC = 5; // Lower concurrency for public endpoints

// Cursor state file
const CURSOR_FILE = path.join(LOGS_DIR, 'cursor.json');
const RESULTS_FILE = path.join(LOGS_DIR, 'scan_events.json');
const LOG_FILE = path.join(LOGS_DIR, `scan_run_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`);

// Ensure logs dir
fs.mkdirSync(LOGS_DIR, { recursive: true });

// Logging helper
function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

// Read cursor
function readCursor() {
  try {
    const data = JSON.parse(fs.readFileSync(CURSOR_FILE, 'utf8'));
    return data.lastBlock ? parseInt(data.lastBlock, 10) : 0;
  } catch {
    return 0;
  }
}

// Write cursor
function writeCursor(blockNumber) {
  fs.writeFileSync(CURSOR_FILE, JSON.stringify({
    lastBlock: blockNumber,
    lastUpdate: new Date().toISOString(),
    totalScanned: blockNumber
  }, null, 2));
}

// RPC call with failover
let totalCalls = 0;
async function rpc(method, params, attempt = 0) {
  totalCalls++;
  const endpointIndex = attempt % RPC_ENDPOINTS.length;
  const endpoint = RPC_ENDPOINTS[endpointIndex];
  
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
    return j.result;
  } catch (e) {
    log(`  RPC error on ${endpoint.split('//')[1].split('/')[0]}: ${e.message}`);
    if (attempt < RPC_ENDPOINTS.length * 3) {
      await new Promise(s => setTimeout(s, 1000 * (attempt + 1)));
      return rpc(method, params, attempt + 1);
    }
    throw e;
  }
}

async function main() {
  log("=== Incremental TWA Scan Starting ===");
  
  // Get current latest block
  const latestHex = await rpc("eth_blockNumber", []);
  const latestBlock = parseInt(latestHex, 16);
  log(`Latest block: ${latestBlock}`);
  
  // Get cursor
  const lastBlock = readCursor();
  log(`Cursor (last scanned): ${lastBlock}`);
  
  // Calculate new range
  const newBlocks = latestBlock - lastBlock;
  if (newBlocks <= 0) {
    log("No new blocks to scan. Cursor is up to date.");
    return;
  }
  
  const startBlock = lastBlock + 1;
  const totalChunks = Math.ceil(newBlocks / CHUNK);
  log(`Scanning blocks ${startBlock} → ${latestBlock} (${newBlocks} blocks, ${totalChunks} chunks)`);
  
  // Check if we should skip old range (prevent re-scan of very old blocks)
  const maxScanAge = 2 * 3600; // 2 hours in seconds
  const blockTime = 2; // Base Sepolia ~2s per block
  const maxBlocks = (maxScanAge / blockTime) * 1.5; // 1.5x cushion
  
  if (startBlock < latestBlock - maxBlocks) {
    log(`⚠️  Gap detected: ${startBlock} is ${((latestBlock - startBlock) * blockTime / 3600).toFixed(1)}h behind latest`);
    log(`   Adjusting start to keep within ${maxScanAge/3600}h window`);
    startBlock = Math.max(startBlock, latestBlock - Math.floor(maxBlocks));
  }
  
  const finalStart = startBlock;
  const actualChunks = Math.ceil((latestBlock - finalStart + 1) / CHUNK);
  log(`Actual scan: ${actualChunks} chunks (after gap adjustment)`);
  
  // Parallel scan workers
  const found = [];
  let done = 0;
  
  async function worker(fromIdx) {
    const a = finalStart + fromIdx * CHUNK;
    const b = Math.min(latestBlock, a + CHUNK - 1);
    const fromHex = "0x" + a.toString(16);
    const toHex = "0x" + b.toString(16);
    
    try {
      const res = await rpc("eth_getLogs", [{
        fromBlock: fromHex,
        toBlock: toHex,
        address: USDC,
        topics: [TOPIC0, fromTopic]
      }]);
      
      for (const l of res) {
        found.push({
          ...l,
          _scannedAt: new Date().toISOString(),
          _chunk: fromIdx
        });
      }
      
      done++;
      if (done % 10 === 0) {
        log(`  Progress: ${done}/${actualChunks} chunks, ${found.length} events found`);
      }
    } catch (e) {
      log(`  Chunk ${fromIdx} error: ${e.message}`);
    }
  }
  
  // Launch workers
  const queue = Array.from({ length: actualChunks }, (_, i) => i);
  const workers = Array.from({ length: CONC }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      await worker(idx);
    }
  });
  
  await Promise.all(workers);
  
  log(`\nScan complete: ${found.length} events found in ${actualChunks} chunks`);
  log(`Total RPC calls: ${totalCalls}`);
  
  // Save results
  const existingEvents = [];
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    existingEvents.push(...data);
  } catch {}
  
  // Deduplicate by transaction hash
  const allEvents = [...existingEvents, ...found];
  const seenTxs = new Set();
  const unique = allEvents.filter(e => {
    if (seenTxs.has(e.transactionHash)) return false;
    seenTxs.add(e.transactionHash);
    return true;
  });
  
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(unique, null, 2));
  log(`Saved ${unique.length} total events → ${RESULTS_FILE}`);
  
  // Update cursor
  writeCursor(latestBlock);
  log(`Cursor updated to block ${latestBlock}`);
  
  // Print summary
  if (found.length > 0) {
    log("\n=== NEW Events Found ===");
    for (const e of found) {
      const ts = parseInt(e.blockNumber, 16);
      const owner = e.topics[2] ? ('0x' + e.topics[2].slice(26)) : 'n/a';
      log(`  Block ${ts} | tx=${e.transactionHash.slice(0, 18)}... | owner=${owner.slice(0, 12)}...`);
    }
  }
  
  log("\n=== Scan Complete ===");
}

main().catch(e => {
  log(`FATAL: ${e.message}`);
  process.exit(1);
});
