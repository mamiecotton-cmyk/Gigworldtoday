#!/usr/bin/env node
// Simple link checker: scans src/data/platforms.json for websiteUrl/applyUrl and checks HTTP status
const fs = require('fs');
const path = require('path');

async function main() {
  const file = path.join(__dirname, 'src', 'data', 'platforms.json');
  if (!fs.existsSync(file)) {
    console.error('platforms.json not found at', file);
    process.exit(2);
  }

  const raw = fs.readFileSync(file, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
    process.exit(2);
  }

  const urls = new Set();
  for (const p of data) {
    if (p.websiteUrl) urls.add(p.websiteUrl);
    if (p.applyUrl) urls.add(p.applyUrl);
  }

  const list = Array.from(urls).filter(Boolean);
  console.log(`Found ${list.length} unique URLs to check.`);

  const results = [];
  const concurrency = 6;
  let idx = 0;

  async function worker() {
    while (idx < list.length) {
      const i = idx++;
      const url = list[i];
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeout);
        results.push({ url, ok: res.ok, status: res.status });
        console.log(`${res.status}  ${res.ok ? 'OK ' : 'ERR'}  ${url}`);
      } catch (err) {
        results.push({ url, ok: false, status: err.message });
        console.log(`ERR      ${url}  (${err.message})`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const okCount = results.filter(r => r.ok).length;
  console.log(`\nSummary: ${okCount}/${results.length} OK`);

  const bad = results.filter(r => !r.ok);
  if (bad.length) {
    console.log('\nBad URLs:');
    for (const b of bad) console.log('-', b.url, b.status);
    process.exitCode = 1;
  }
}

main();
