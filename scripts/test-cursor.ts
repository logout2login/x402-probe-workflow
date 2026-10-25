// ─── v1.13 test-cursor.ts ───
//
// 驗證 cursor 簽名/解碼的正確性。
// 本地測試（不需要 Cloudflare runtime）。

import { encodeCursor, decodeCursor, type CursorPayload } from "../src/worker/cursor";

const SECRET = "test-secret-for-cursor-signing";

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean) {
  if (ok) {
    console.log(`  ✅ ${name}`);
    pass += 1;
  } else {
    console.log(`  ❌ ${name}`);
    fail += 1;
  }
}

const payload: CursorPayload = {
  offset: 50,
  limit: 25,
  generated_at: "2026-10-22T12:00:00Z",
  exp: Date.now() + 6 * 3600 * 1000,
};

// 1. 編碼
const cursor = encodeCursor(SECRET, payload);
check("cursor 是字串", typeof cursor === "string");
check("cursor 有兩段（payload.mac）", cursor.split(".").length === 2);

// 2. 解碼
const decoded = decodeCursor(cursor, SECRET);
check("解碼成功", decoded !== null);
check("offset 匹配", decoded?.offset === payload.offset);
check("limit 匹配", decoded?.limit === payload.limit);
check("generated_at 匹配", decoded?.generated_at === payload.generated_at);

// 3. 偽造 cursor（錯誤 secret）
const tampered = encodeCursor("wrong-secret", payload);
const tamperedDecode = decodeCursor(tampered, SECRET);
check("錯誤 secret → null", tamperedDecode === null);

// 4. 偽造 cursor（篡改 body：改最後一位字元）
const parts = cursor.split(".");
const bodyB64 = parts[0]!;
const lastChar = bodyB64[bodyB64.length - 1]!;
const tamperedChar = lastChar === "A" ? "B" : "A";
const tamperedBody = bodyB64.slice(0, -1) + tamperedChar;
const tamperedFull = `${tamperedBody}.${parts[1]}`;
check("篡改 body → null", decodeCursor(tamperedFull, SECRET) === null);

// 5. 過期 cursor
const expiredPayload: CursorPayload = { ...payload, exp: Date.now() - 1000 };
const expiredCursor = encodeCursor(SECRET, expiredPayload);
check("過期 cursor → null", decodeCursor(expiredCursor, SECRET) === null);

// 6. 無 secret 模式（降級）
const noSecretCursor = encodeCursor(undefined, payload);
check("無 secret → unsigned 結尾", noSecretCursor.endsWith(".unsigned"));

// 7. null 輸入
check("null 輸入 → null", decodeCursor(null, SECRET) === null);
check("空字串 → null", decodeCursor("", SECRET) === null);
check("無效格式 → null", decodeCursor("invalid", SECRET) === null);

console.log(`\n════════════════════════════════════`);
console.log(`  PASS: ${pass}   FAIL: ${fail}`);
console.log(`════════════════════════════════════`);
process.exit(fail > 0 ? 1 : 0);
