// ─── DurableObject 基類宣告 ───
//
// @cloudflare/workers-types@4.20241022.0 將 DurableObject 定義為 interface，
// 導致 `extends DurableObject` 在 TS 報 TS2689。此宣告補上可 extend 的
// abstract class，讓 NonceLockDO / QuotaDO / CircuitBreakerDO 能正常繼承。
//
// 實際執行時由 Cloudflare Workers runtime 提供 DurableObject 類別；
// 此宣告只影響 TypeScript 編譯期檢查。

// DO 類別需 `import { DurableObject } from "cloudflare:workers"`（見各 DO 檔）：
// Cloudflare version-creation sandbox（free plan、SQLite DO）不注入 bare global
// DurableObject，否則 10021 "DurableObject is not defined"。

declare module "cloudflare:workers" {
  export abstract class DurableObject {
    constructor(state: DurableObjectState, env?: Record<string, unknown>);
    readonly state: DurableObjectState;
    readonly env: Record<string, unknown>;
    fetch(request: Request): Promise<Response>;
  }
}

declare abstract class DurableObject {
  constructor(state: DurableObjectState, env?: Record<string, unknown>);
  readonly state: DurableObjectState;
  readonly env: Record<string, unknown>;
}
