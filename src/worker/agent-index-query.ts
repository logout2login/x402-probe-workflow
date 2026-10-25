// ─── v1.10 Agent-Index 動態生成 ───
//
// 從 D1 packages 表即時生成 agent-index.json。
// v1.0 只從 KV 讀預生成分片；v1.10+ 直接查 DB + 支援排序/過濾。

import { PRICE_STANDARD_6DECIMAL, PRICE_FEATURED_6DECIMAL } from "../shared/constants";
import type { Env } from "./env";
import type { AgentIndex, PackageIndexEntry } from "../shared/types";

export interface IndexQueryOpts {
  minQ?: number;
  minEvidence?: number;
  maxAgeDays?: number;
  tier?: "listed" | "featured" | "all";
  keyword?: string;
}

export async function queryIndexRows(env: Env, opts: IndexQueryOpts = {}): Promise<AgentIndex> {
  const now = new Date();
  const maxAgeMs = (opts.maxAgeDays ?? 90) * 86400_000;

  const clauses: string[] = ["p.status='fresh'"];
  const params: Array<string | number> = [];

  if (opts.tier && opts.tier !== "all") {
    clauses.push("p.tier = ?");
    params.push(opts.tier);
  }
  if (opts.minQ != null) {
    clauses.push("p.q >= ?");
    params.push(opts.minQ);
  }
  if (opts.minEvidence != null) {
    clauses.push("p.evidence_count >= ?");
    params.push(opts.minEvidence);
  }
  clauses.push("p.expires_at > ?");
  params.push(new Date(now.getTime() + maxAgeMs).toISOString());
  if (opts.keyword) {
    clauses.push("p.title LIKE ?");
    params.push(`%${opts.keyword}%`);
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM packages p WHERE ${clauses.join(" AND ")} ORDER BY p.q DESC, p.verified_at DESC`
  ).bind(...params).all<PackageRow>();

  const packages: PackageIndexEntry[] = results.map(row => toIndexEntry(row, env.OWNSITE_BASE));
  return {
    spec_version: "1.1",
    generated_at: now.toISOString(),
    packages,
  };
}

interface PackageRow {
  package_id: string;
  title: string;
  q: number;
  evidence_count: number;
  source_diversity: number | null;
  verified_at: string;
  expires_at: string;
  tier: string;
  origin: string;
}

function toIndexEntry(row: PackageRow, base: string): PackageIndexEntry {
  const decay = Math.max(0.7, 1 - (Date.now() - new Date(row.verified_at).getTime()) / (180 * 86400_000));
  const qEffective = Math.round(row.q * decay * 100) / 100;
  return {
    package_id: row.package_id,
    title: row.title,
    q: row.q,
    q_effective: qEffective,
    evidence_count: row.evidence_count,
    source_diversity: row.source_diversity ?? 0,
    verified_at: row.verified_at,
    expires_at: row.expires_at,
    tier: row.tier as "listed" | "featured",
    origin: (row.origin as "publisher" | "demand" | "demo") ?? "publisher",
    preview_url: `${base}/preview/${row.package_id}`,
    verify_url: `${base}/verify/${row.package_id}`,
    paid_url: `${base}/buy/${row.package_id}`,
    price_usdc: row.tier === "featured" ? "1.00" : "0.50",
    status: "fresh",
  };
}

// 匯出常數讓外部使用（避免 tree-shake 移除）
export const PRICE_STANDARD_REF = PRICE_STANDARD_6DECIMAL;
export const PRICE_FEATURED_REF = PRICE_FEATURED_6DECIMAL;
