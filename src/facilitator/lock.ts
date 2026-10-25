// ─── v1.12 Facilitator Lock（本地狀態，DO 版見 src/do/） ───
//
// Worker 內部的簡單鎖，用於避免同一個 package_id 並發結算。

const locks = new Map<string, Promise<void>>();

export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key);
  if (prev) await prev.catch(() => {});
  let resolve!: () => void;
  const p = new Promise<void>(r => { resolve = r; });
  locks.set(key, p);
  try {
    return await fn();
  } finally {
    resolve();
    if (locks.get(key) === p) locks.delete(key);
  }
}
