// Is each rotated category label fully visible inside its clipping ancestor?
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const url = process.argv[2];
const width = Number(process.argv[3]);
const PORT = 9900 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), `cdp-lbl-${PORT}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 100; i += 1) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {}
  await sleep(100);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) })); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, S);
await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, S);
await send('Page.navigate', { url }, S);
await sleep(3000);

const expr = `(() => {
  const out = [];
  for (const h of document.querySelectorAll('h4')) {
    const txt = (h.textContent || '').trim();
    if (!txt) continue;
    // nearest ancestor that actually clips
    let clip = h.parentElement;
    while (clip && getComputedStyle(clip).overflow === 'visible') clip = clip.parentElement;
    if (!clip) continue;
    const hb = h.getBoundingClientRect();
    const cb = clip.getBoundingClientRect();
    out.push({
      text: txt,
      cutTop: Math.round(cb.top - hb.top),
      cutBottom: Math.round(hb.bottom - cb.bottom),
      cutLeft: Math.round(cb.left - hb.left),
      cutRight: Math.round(hb.right - cb.right),
      writingMode: getComputedStyle(h).writingMode,
    });
  }
  return JSON.stringify(out);
})()`;

const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }, S);
const items = JSON.parse(r.result.value);
console.log(`viewport ${width}px  (positive number = that many px cut off that edge)`);
let bad = 0;
for (const it of items) {
  const cuts = ['cutTop', 'cutBottom', 'cutLeft', 'cutRight'].filter((k) => it[k] > 1);
  if (cuts.length) bad += 1;
  console.log(`  "${it.text}"`.padEnd(26), `wm=${it.writingMode.padEnd(12)}`,
    `T=${String(it.cutTop).padStart(4)} B=${String(it.cutBottom).padStart(4)} L=${String(it.cutLeft).padStart(4)} R=${String(it.cutRight).padStart(4)}`,
    cuts.length ? `  *** CLIPPED: ${cuts.join(',')} ***` : '  fully visible');
}
console.log(bad ? `\n${bad} label(s) clipped at ${width}px` : `\nall labels fully visible at ${width}px`);

ws.close(); proc.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
