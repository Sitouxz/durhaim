// Full-page screenshot capture over Chrome DevTools Protocol.
// Zero dependencies: uses the system Chrome + Node's built-in WebSocket.
//
// Usage: node shoot.mjs <manifest.json>
// Manifest: { outDir, chrome, shots: [{ name, url, width, height?, dpr?, dark?, waitMs?, clickSelector? }] }

import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const PORT = 9222 + Math.floor(Math.random() * 500);
const profile = path.join(os.tmpdir(), `cdp-profile-${PORT}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launchChrome() {
  const args = [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--force-device-scale-factor=1',
  ];
  const proc = spawn(manifest.chrome, args, { stdio: 'ignore', detached: false });

  for (let i = 0; i < 100; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return { proc, version: (await r.json())['Browser'] };
    } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('Chrome did not expose the debugging port');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.sessions = new Map();
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 45000);
    });
  }
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => resolve(new CDP(ws)));
    ws.addEventListener('error', reject);
  });
}

const { proc, version } = await launchChrome();
console.log('chrome:', version);

const wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl;
const cdp = await connect(wsUrl);
await mkdir(manifest.outDir, { recursive: true });

const results = [];

for (const shot of manifest.shots) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = sessionId;

  try {
    await cdp.send('Page.enable', {}, S);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: shot.width,
      height: shot.height ?? 900,
      deviceScaleFactor: shot.dpr ?? 2,
      mobile: shot.width < 700,
    }, S);
    if (shot.dark !== undefined) {
      await cdp.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: shot.dark ? 'dark' : 'light' }],
      }, S);
    }

    // Authenticated captures (the admin surface) need the session cookie bound to the origin.
    // Setting it on a fresh about:blank target does not work — the cookie jar has no origin to
    // attach to yet, and every admin page came back as the login screen. Land on the origin
    // first, then set the cookie, then navigate to the target path.
    if (shot.cookie) {
      const m = /^([^=]+)=(.*)$/.exec(shot.cookie.trim());
      if (m) {
        const origin = new URL(shot.url).origin;
        await cdp.send('Network.enable', {}, S);
        await cdp.send('Page.navigate', { url: origin }, S);
        await sleep(1200);
        const res = await cdp.send('Network.setCookie', {
          name: m[1], value: m[2], url: origin, path: '/', httpOnly: true, sameSite: 'Lax',
        }, S);
        if (res && res.success === false) console.log(`    warn: cookie not set for ${shot.name}`);
      }
    }

    await cdp.send('Page.navigate', { url: shot.url }, S);
    await sleep(shot.waitMs ?? 2500);

    if (shot.clickSelector) {
      await cdp.send('Runtime.evaluate', {
        expression: `document.querySelector(${JSON.stringify(shot.clickSelector)})?.click()`,
      }, S);
      await sleep(900);
    }

    const title = (await cdp.send('Runtime.evaluate', { expression: 'document.title', returnByValue: true }, S)).result.value;
    const metrics = await cdp.send('Page.getLayoutMetrics', {}, S);
    const full = metrics.cssContentSize ?? metrics.contentSize;

    // Horizontal overflow is a finding in itself, so record it while we are here.
    const overflow = (await cdp.send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollWidth - document.documentElement.clientWidth',
      returnByValue: true,
    }, S)).result.value;

    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: shot.width, height: Math.min(full.height, 20000), scale: 1 },
    }, S);

    const file = path.join(manifest.outDir, `${shot.name}.png`);
    await writeFile(file, Buffer.from(data, 'base64'));
    results.push({ name: shot.name, url: shot.url, width: shot.width, pageHeight: Math.round(full.height), overflowPx: overflow, title, file });
    console.log(`ok  ${shot.name.padEnd(42)} ${String(shot.width).padStart(5)}px  h=${String(Math.round(full.height)).padStart(5)}  overflow=${overflow}`);
  } catch (err) {
    results.push({ name: shot.name, url: shot.url, error: String(err) });
    console.log(`ERR ${shot.name.padEnd(42)} ${err}`);
  } finally {
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
  }
}

await writeFile(path.join(manifest.outDir, '_index.json'), JSON.stringify(results, null, 2));
cdp.ws.close();
proc.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
console.log(`\n${results.filter((r) => !r.error).length}/${results.length} captured -> ${manifest.outDir}`);
