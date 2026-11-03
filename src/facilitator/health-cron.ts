// ─── v1.12 Facilitator 健康度 Cron ───
//
// 每日 09:00 UTC 觸發。對每個 facilitator 做 healthCheck，
// 結果寫入 facilitator_daily。

import type { Env } from "../worker/env";
import { CDPFacilitator } from "./cdp";
import { SelfHostedFacilitator } from "./selfhosted";

export async function runFacilitatorHealthCron(env: Env) {
  const day = new Date().toISOString().slice(0, 10);
  const facEnv = {
    FACILITATOR_URL: env.FACILITATOR_URL,
    CDP_API_KEY: env.CDP_API_KEY,
    CDP_KEY_ID: env.CDP_KEY_ID,
    CDP_KEY_SECRET: env.CDP_KEY_SECRET,
    SELFHOSTED_PRIVATE_KEY: env.SELFHOSTED_PRIVATE_KEY,
    NETWORK: env.NETWORK,
    ASSET_USDC: env.ASSET_USDC,
    OWNSITE_BASE: env.OWNSITE_BASE,
  };

  const cdp = new CDPFacilitator();
  const selfhosted = new SelfHostedFacilitator();
  const results = await Promise.all([
    cdp.healthCheck(facEnv),
    selfhosted.healthCheck(facEnv),
  ]);

  const entries: Array<[string, { ok: boolean; error?: string }]> = [
    ["cdp", results[0]],
    ["selfhosted", results[1]],
  ];

  for (const [name, r] of entries) {
    await env.DB.prepare(
      `INSERT INTO facilitator_hourly (hour, facilitator, health, requests, circuit_state)
       VALUES (?,?,?,?,?)
       ON CONFLICT(hour, facilitator) DO UPDATE SET health=excluded.health`
    ).bind(
      new Date().toISOString().slice(0, 13) + ":00:00Z",
      name,
      r.ok ? 1 : 0,
      1,
      r.ok ? "closed" : "open"
    ).run();

    await env.DB.prepare(
      `INSERT INTO facilitator_daily (day, facilitator, healthy_hours, total_hours)
       VALUES (?,?,?,?)
       ON CONFLICT(day, facilitator) DO UPDATE SET
         healthy_hours=healthy_hours+excluded.healthy_hours,
         total_hours=total_hours+excluded.total_hours`
    ).bind(day, name, r.ok ? 1 : 0, 1).run();
  }

  return { day, results: entries };
}
