// Report elements whose box extends past the viewport width, at a given width.
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const url = process.argv[2];
const width = Number(process.argv[3] ?? 768);
const PORT = 9700 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), `cdp-diag-${PORT}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 100; i += 1) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; }
  } catch {}
  await sleep(100);
}

const ws = new WebSocket(wsUrl);
await new Promise((res) => ws.addEventListener('open', res));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}, sessionId) => new Promise((res) => {
  const i = ++id; pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, S);
await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, S);
await send('Page.navigate', { url }, S);
await sleep(3200);

const expr = `(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const overRight = Math.round(r.right - vw);
    const overLeft = Math.round(-r.left);
    if (overRight > 1 || overLeft > 1) {
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 150),
        text: (el.textContent || '').trim().replace(/\\s+/g,' ').slice(0, 45),
        left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
        overRight, overLeft,
        transform: cs.transform === 'none' ? '' : cs.transform.slice(0, 40),
        writingMode: cs.writingMode,
        pos: cs.position,
      });
    }
  }
  // deepest offenders first: report the ones with no offending descendant
  return JSON.stringify({ vw, scrollW: document.documentElement.scrollWidth, count: out.length, items: out.slice(0, 40) });
})()`;

const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }, S);
const data = JSON.parse(r.result.value);
console.log(`url=${url}  viewport=${data.vw}  scrollWidth=${data.scrollW}  overflow=${data.scrollW - data.vw}px`);
console.log(`offending elements: ${data.count}\n`);
for (const it of data.items) {
  console.log(`${it.tag}  L=${String(it.left).padStart(5)} R=${String(it.right).padStart(5)} w=${String(it.w).padStart(4)}  overR=${String(it.overRight).padStart(4)} overL=${String(it.overLeft).padStart(4)}  wm=${it.writingMode}`);
  console.log(`   cls: ${it.cls}`);
  if (it.transform) console.log(`   transform: ${it.transform}`);
  if (it.text) console.log(`   text: "${it.text}"`);
  console.log('');
}

ws.close(); proc.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
