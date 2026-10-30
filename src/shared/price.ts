// ─── 有效價格（開張促銷）───
//
// 前 PROMO_FIRST_N 個 settled 付款以 PROMO_PRICE_6DECIMAL（$0.01）發售；
// 之後回落到 standard/featured 價。
//
// 計數來源：payments 表（status DEFAULT 'settled'，INSERT 於成功 settle 後）。
// 呢個係「真實 completed purchase」嘅數，唔係 verify/buy attempt。
//
// 失敗安全：任何 DB 錯誤 → 回落到 base（standard/featured）價，
// 保證唔會因為錯誤而 undercharge。

import {
  PRICE_STANDARD_6DECIMAL,
  PRICE_FEATURED_6DECIMAL,
  PROMO_PRICE_6DECIMAL,
  PROMO_FIRST_N,
} from "./constants";

export type PriceTier = "listed" | "featured";

/** 返回該 package 而家嘅有效價格（base units string，如 "10000"=$0.01 / "500000"=$0.50）。 */
export async function effectivePrice(
  env: { DB: D1Database },
  packageId: string,
  tier: PriceTier = "listed"
): Promise<string> {
  const base = tier === "featured" ? PRICE_FEATURED_6DECIMAL : PRICE_STANDARD_6DECIMAL;
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM payments WHERE status='settled' AND package_id = ?"
    ).bind(packageId).first<{ c: number }>();
    const count = Number(row?.c ?? 0);
    return count < PROMO_FIRST_N ? PROMO_PRICE_6DECIMAL : base;
  } catch {
    return base;
  }
}

/** base units → 顯示字串（2 位小數）："10000"→"0.01"、"500000"→"0.50"、"1000000"→"1.00"。 */
export function usdcDisplay(baseUnits: string): string {
  const n = Number(baseUnits);
  if (!Number.isFinite(n)) return "0.50";
  return (n / 1000000).toFixed(2);
}

/** 促銷剩餘名額（用於 storefront/文案）：promo 期間剩餘 slots，唔係 promo 就 0。 */
export async function promoRemaining(env: { DB: D1Database }, packageId: string): Promise<number> {
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM payments WHERE status='settled' AND package_id = ?"
    ).bind(packageId).first<{ c: number }>();
    const count = Number(row?.c ?? 0);
    return Math.max(0, PROMO_FIRST_N - count);
  } catch {
    return 0;
  }
}
