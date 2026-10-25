// ─── build-index ───
// 產出 public/.well-known/agent-index.json。
// 只列 Listed / Featured 包；blocked / stale / unlisted 不出現在索引。
// q_effective 只作參考，閘門用原始 q + expires_at。

import { aeoGate } from "./publish-guard";
import { MAX_TTL_DAYS } from "../shared/constants";
import type { AgentIndex, PackageIndexEntry, Verification } from "../shared/types";

export interface PackageBundle {
  id: string;
  title?: string;
  verification: Verification;
  data: unknown;
}

function decayFactor(verifiedAt: string, now: Date): number {
  const days = (now.getTime() - new Date(verifiedAt).getTime()) / 86400_000;
  return Math.max(0.7, 1 - days / MAX_TTL_DAYS);
}

export function buildIndex(
  bundles: PackageBundle[],
  opts: { now: Date; base: string; lastRegenCount24h?: Record<string, number> }
): AgentIndex {
  const { now, base } = opts;
  const regenMap = opts.lastRegenCount24h ?? {};
  const packages: PackageIndexEntry[] = [];

  for (const b of bundles) {
    const g = aeoGate(b.verification, {
      now,
      maxTtlDays: MAX_TTL_DAYS,
      lastRegenCount24h: regenMap[b.id] ?? 0,
    });
    if (!g.listed) continue;
    const v = b.verification;
    const decay = decayFactor(v.verified_at, now);
    const isFeatured = g.featured;
    packages.push({
      package_id: v.package_id,
      title: b.title ?? v.package_id,
      q: v.q,
      q_effective: Number((v.q * decay).toFixed(3)),
      evidence_count: v.evidence_count,
      source_diversity: v.source_diversity,
      verified_at: v.verified_at,
      expires_at: v.expires_at,
      tier: isFeatured ? "featured" : "listed",
      preview_url: `${base}/preview/${v.package_id}`,
      verify_url: `${base}/verify/${v.package_id}`,
      paid_url: `${base}/buy/${v.package_id}`,
      price_usdc: isFeatured ? "1.00" : "0.50",
      status: "fresh",
      machine_tags: [
        `tier:${isFeatured ? "featured" : "verified_pro"}`,
        `q:${v.q.toFixed(2)}`,
        `evidence:${v.evidence_count}`,
        `ttl:${Math.round((new Date(v.expires_at).getTime() - now.getTime()) / 86400_000)}d`,
      ],
    });
  }

  // 排序：Featured 優先，再按 q_effective 降序
  packages.sort((a, b) => {
    const tierDiff = (b.tier === "featured" ? 1 : 0) - (a.tier === "featured" ? 1 : 0);
    if (tierDiff !== 0) return tierDiff;
    return b.q_effective - a.q_effective;
  });

  return {
    spec_version: "1.0",
    generated_at: now.toISOString(),
    packages,
  };
}
