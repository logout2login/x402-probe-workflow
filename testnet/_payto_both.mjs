for (const base of ["https://ownsite-aeo.jerry-aeo.workers.dev", "https://ownsite-aeo-testnet.jerry-aeo.workers.dev"]) {
  try {
    const r = await fetch(base + "/buy/e2e-x402-0001", { method: "POST" });
    const b = await r.json().catch(() => ({}));
    const p = b?.payload ?? b?.body?.payload ?? b;
    console.log(base, "→", r.status, "payTo:", p.payTo ?? b?.accepts?.[0]?.payTo);
  } catch (e) { console.log(base, "ERR:", e.message.slice(0, 80)); }
}
