const r = await fetch("https://ownsite-aeo-testnet.jerry-aeo.workers.dev/buy/e2e-x402-0001", { method: "POST" });
const b = await r.json().catch(()=>({}));
const p = b?.payload ?? b?.body?.payload ?? b;
const acc = p.accepts?.[0] ?? {};
console.log("HTTP:", r.status);
console.log("payTo:", p.payTo ?? acc.payTo);
console.log("asset:", p.asset ?? acc.asset);
console.log("amount:", p.amount ?? acc.maxAmountRequired);
console.log("scheme:", p.scheme ?? acc.scheme);
console.log("network:", p.network);
const fs = await import("node:fs");
try { const rep = JSON.parse(fs.readFileSync("testnet/xe2e-x402-0001-report.json","utf-8")); console.log("\nreport transfer_tx:", rep.transfer_tx ?? rep.step3_transfer_tx); } catch(e){ console.log("\n(no report transfer_tx)"); }
