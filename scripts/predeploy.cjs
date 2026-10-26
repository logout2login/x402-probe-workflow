/**
 * Pre-deploy guard — 雙重閘
 *
 * 閘 #1：dirty tree → REFUSE（通用閘）
 * 閘 #2：JWKS ≠ git HEAD → REFUSE（key-drift 專屬閘，今次事故復現預防）
 *
 * npm run deploy 會先跑呢隻 script，唔通過就 exit 1 攔截部署。
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// 閘 #1：dirty tree
let status;
try {
  status = execSync('git status --porcelain', {
    encoding: 'utf8',
    cwd: ROOT
  }).trim();
} catch (e) {
  // git status 即使 clean 都可能 exit 0；非 zero 即有問題
  console.error('REFUSE: git status 失敗\n' + e.stderr?.toString() || e.message);
  process.exit(1);
}

if (status) {
  console.error('REFUSE: dirty working tree\n' + status);
  console.error('Commit 所有改動再 deploy，唔好推斷。');
  process.exit(1);
}

console.log('predeploy ✓ [gate 1/2] clean tree');

// 閘 #2：JWKS 本地 vs git HEAD
const jwksLocal = fs.readFileSync(path.join(ROOT, 'public', '.well-known', 'jwks.json'), 'utf8');
let jwksHead;
try {
  jwksHead = execSync('git show HEAD:public/.well-known/jwks.json', {
    encoding: 'utf8',
    cwd: ROOT
  }).trim();
} catch (e) {
  // HEAD 無呢個檔案（首次 commit 前）→ skip gate 2
  console.log('predeploy ⚠ [gate 2/2] jwks.json not in HEAD yet (first deploy)');
}

if (jwksHead && jwksLocal.trim() !== jwksHead) {
  console.error('REFUSE: JWKS ≠ git HEAD — key drift 風險');
  console.error('本地 jwks.json: ' + jwksLocal.trim().substring(0, 80) + '...');
  console.error('git HEAD jwks.json: ' + jwksHead.substring(0, 80) + '...');
  console.error('請 git add 後再 deploy。');
  process.exit(1);
}

console.log('predeploy ✓ [gate 2/2] JWKS synced with HEAD');
console.log('predeploy ✓ 全部閘通過');
