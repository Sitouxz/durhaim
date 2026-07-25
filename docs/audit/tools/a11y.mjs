// Track D: WCAG 2.2 AA checks over CDP. No dependencies.
// Usage: node a11y.mjs <url> [width]
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const url = process.argv[2];
const width = Number(process.argv[3] ?? 1440);
const PORT = 9300 + Math.floor(Math.random() * 300);
const profile = path.join(os.tmpdir(), `cdp-a11y-${PORT}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
], { stdio: 'ignore' });

let wsUrl;
for (let i = 0; i < 120; i += 1) {
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
await sleep(3200);

const expr = `(() => {
  const out = { issues: [], info: {} };
  const add = (rule, wcag, detail) => out.issues.push({ rule, wcag, detail });

  // 3.1.1 page language
  const lang = document.documentElement.getAttribute('lang');
  out.info.lang = lang || '(missing)';
  if (!lang) add('html-lang', '3.1.1', '<html> has no lang attribute');

  // 1.1.1 images
  let noAlt = 0, decorative = 0;
  for (const img of document.querySelectorAll('img')) {
    const a = img.getAttribute('alt');
    if (a === null) { noAlt += 1; if (noAlt <= 4) add('img-alt', '1.1.1', 'img missing alt: ' + (img.getAttribute('src') || '').slice(0, 70)); }
    else if (a === '') decorative += 1;
  }
  out.info.images = document.querySelectorAll('img').length + ' (missing alt: ' + noAlt + ', decorative: ' + decorative + ')';

  // 4.1.2 controls with no accessible name
  const nameOf = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim()
    || (el.getAttribute('aria-labelledby') ? 'via-labelledby' : '');
  let unnamed = 0;
  for (const el of document.querySelectorAll('button, a[href], [role=button]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (!nameOf(el)) { unnamed += 1; if (unnamed <= 5) add('control-name', '4.1.2', el.tagName.toLowerCase() + ' has no accessible name; class=' + (el.className || '').toString().slice(0, 60)); }
  }

  // 1.3.1 / 3.3.2 form fields without labels
  for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const id = el.getAttribute('id');
    const labelled = (id && document.querySelector('label[for="' + id + '"]')) || el.closest('label')
      || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!labelled) add('input-label', '1.3.1', (el.getAttribute('type') || el.tagName.toLowerCase()) + ' has no label; placeholder="' + (el.getAttribute('placeholder') || '') + '"');
  }

  // 1.3.1 heading order
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
  out.info.headings = hs.join(',') || '(none)';
  out.info.h1count = hs.filter((n) => n === 1).length;
  if (hs.filter((n) => n === 1).length === 0) add('h1-missing', '1.3.1', 'page has no h1');
  if (hs.filter((n) => n === 1).length > 1) add('h1-multiple', '1.3.1', hs.filter((n) => n === 1).length + ' h1 elements');
  for (let i = 1; i < hs.length; i += 1) if (hs[i] - hs[i - 1] > 1) { add('heading-skip', '1.3.1', 'jumps h' + hs[i - 1] + ' -> h' + hs[i]); break; }

  // 2.4.1 landmarks + skip link
  out.info.landmarks = ['main', 'nav', 'header', 'footer'].filter((t) => document.querySelector(t)).join(',') || '(none)';
  if (!document.querySelector('main')) add('no-main', '1.3.6', 'no <main> landmark');
  const first = document.body.querySelector('a[href]');
  const skip = first && /^#/.test(first.getAttribute('href') || '') && /skip|lompat|langsung/i.test(first.textContent || '');
  if (!skip) add('no-skip-link', '2.4.1', 'no skip-to-content link as first focusable element');

  // 2.5.8 target size (24x24 minimum)
  let small = 0;
  for (const el of document.querySelectorAll('a[href], button, input[type=submit], [role=button]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.width < 24 || r.height < 24) { small += 1; if (small <= 4) add('target-size', '2.5.8', Math.round(r.width) + 'x' + Math.round(r.height) + 'px: "' + (el.textContent || '').trim().slice(0, 28) + '"'); }
  }
  out.info.smallTargets = small;

  // 1.4.3 contrast — compute for text nodes against their effective background
  const lum = (c) => { const s = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]; };
  const parse = (str) => { const m = str.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 }; };
  const bgOf = (el) => { let n = el; while (n && n !== document.documentElement) { const b = parse(getComputedStyle(n).backgroundColor); if (b && b.a > 0.5) return b.rgb; n = n.parentElement; } return [0, 0, 0]; };
  let lowC = 0; const seen = new Set();
  for (const el of document.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,h6,li,td,th,button,label,div')) {
    if (!el.childNodes.length) continue;
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!direct) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el);
    const L1 = lum(fg.rgb), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      const key = cs.color + '|' + bg.join(',') + '|' + Math.round(px);
      if (!seen.has(key)) { seen.add(key); lowC += 1; if (lowC <= 6) add('contrast', '1.4.3', ratio.toFixed(2) + ':1 (needs ' + need + ':1) ' + cs.color + ' on rgb(' + bg.join(',') + ') @' + Math.round(px) + 'px — "' + (el.textContent || '').trim().slice(0, 34) + '"'); }
    }
  }
  out.info.lowContrastCombos = lowC;

  // 4.1.3 status messages
  out.info.ariaLive = document.querySelectorAll('[aria-live],[role=status],[role=alert]').length;

  return JSON.stringify(out);
})()`;

const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }, S);
const d = JSON.parse(r.result.value);
console.log(`\n### ${url}  @${width}px`);
console.log('  lang=' + d.info.lang, '| landmarks=' + d.info.landmarks, '| h1=' + d.info.h1count, '| headings=' + d.info.headings);
console.log('  images=' + d.info.images, '| small targets=' + d.info.smallTargets, '| low-contrast combos=' + d.info.lowContrastCombos, '| aria-live regions=' + d.info.ariaLive);
console.log(`  ${d.issues.length} issue instance(s) reported:`);
const byRule = {};
for (const i of d.issues) (byRule[i.rule] ??= []).push(i);
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`   [${list[0].wcag}] ${rule} x${list.length}`);
  for (const i of list.slice(0, 4)) console.log('       - ' + i.detail);
}

ws.close(); proc.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
