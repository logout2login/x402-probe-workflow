#!/usr/bin/env node
const fs = require('fs');

function scribe() {
  const logPath = 'logs/probe.log';
  if (!fs.existsSync(logPath)) {
    console.log('NO_LOG');
    return;
  }
  const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
  const last = lines[lines.length - 1];
  if (!last) {
    console.log('EMPTY_LOG');
    return;
  }
  try {
    const data = JSON.parse(last.split(' ')[1]);
    console.log(`SCRIBE target=${data.target || 'N/A'} status=${data.status || 0} latency=${data.latency || 0}s`);
  } catch {
    console.log('PARSE_ERROR');
  }
}

scribe();
