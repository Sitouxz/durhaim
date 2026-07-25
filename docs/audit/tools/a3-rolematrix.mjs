// A3: endpoint x method x role authorization matrix.
// Seeds three ZZAUDIT admin users (hashes derived exactly as src/lib/admin-passwords.ts does),
// logs each in against the local dev server, then exercises every admin endpoint.
import { webcrypto as crypto } from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = 'http://localhost:3000';
const H = { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' };
const PW = 'ZZAuditPassphrase!2026';
const ITER = 210000;

const b64 = (u8) => Buffer.from(u8).toString('base64');

async function hashPassword(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256);
  return { password_hash: b64(new Uint8Array(bits)), password_salt: b64(salt), password_iterations: ITER, password_updated_at: new Date().toISOString() };
}

const users = [
  { role: 'STAFF', email: 'zzaudit-staff@durhaim.test', full_name: 'ZZAUDIT Staff' },
  { role: 'ADMIN', email: 'zzaudit-admin@durhaim.test', full_name: 'ZZAUDIT Admin' },
  { role: 'OWNER', email: 'zzaudit-owner@durhaim.test', full_name: 'ZZAUDIT Owner' },
];

// --- seed
for (const u of users) {
  const body = { ...u, status: 'ACTIVE', ...(await hashPassword(PW)) };
  const r = await fetch(`${url}/rest/v1/admin_users`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok) console.log('seed failed', u.role, r.status, (await r.text()).slice(0, 120));
}
console.log('seeded 3 ZZAUDIT admin users\n');

// --- login
const cookies = {};
for (const u of users) {
  const r = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: u.email, password: PW }),
  });
  const setCookie = r.headers.getSetCookie?.() ?? [];
  const c = setCookie.map((s) => s.split(';')[0]).join('; ');
  cookies[u.role] = c;
  console.log(`login ${u.role.padEnd(6)} HTTP ${r.status} ${c ? 'cookie set' : 'NO COOKIE ' + (await r.text()).slice(0, 90)}`);
}
console.log('');

// endpoint, method, body, roles that SHOULD be allowed
const probes = [
  ['/api/admin/overview', 'GET', null, ['OWNER', 'ADMIN', 'STAFF']],
  ['/api/admin/products', 'GET', null, ['OWNER', 'ADMIN', 'STAFF']],
  ['/api/admin/categories', 'GET', null, ['OWNER', 'ADMIN', 'STAFF']],
  ['/api/admin/serials', 'GET', null, ['OWNER', 'ADMIN', 'STAFF']],
  ['/api/admin/settings', 'GET', null, ['OWNER', 'ADMIN', 'STAFF']],
  ['/api/admin/user-logs', 'GET', null, ['OWNER', 'ADMIN']],
  ['/api/admin/users', 'GET', null, ['OWNER', 'ADMIN']],
  ['/api/admin/settings', 'PATCH', { public_domain: 'www.durhaim.com', whatsapp_contact: '+62 821-2010-1473', support_email: 'durhaimgear@gmail.com', location: 'Mitra Dago Parahyangan Jl. Anyelir No. C8 Bandung' }, ['OWNER', 'ADMIN']],
  ['/api/admin/users', 'POST', { full_name: 'ZZAUDIT Probe X', email: 'zzaudit-probe-x@durhaim.test', role: 'STAFF', status: 'ACTIVE', password: 'ZZAuditProbePass!2026' }, ['OWNER', 'ADMIN']],
];

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('endpoint', 30), pad('method', 7), pad('OWNER', 8), pad('ADMIN', 8), pad('STAFF', 8), 'expected');
console.log('-'.repeat(92));

const gaps = [];
for (const [ep, method, body, allowed] of probes) {
  const res = {};
  for (const role of ['OWNER', 'ADMIN', 'STAFF']) {
    const r = await fetch(BASE + ep, {
      method, headers: { Cookie: cookies[role], 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    res[role] = r.status;
    // clean up any user the POST probe created
    if (method === 'POST' && ep === '/api/admin/users' && r.status < 300) {
      await fetch(`${url}/rest/v1/admin_users?email=eq.zzaudit-probe-x@durhaim.test`, { method: 'DELETE', headers: H });
    }
    const ok = r.status >= 200 && r.status < 300;
    const shouldBe = allowed.includes(role);
    if (ok && !shouldBe) gaps.push(`${method} ${ep}: ${role} allowed but should be denied (HTTP ${r.status})`);
    if (!ok && shouldBe && r.status === 403) gaps.push(`${method} ${ep}: ${role} denied but should be allowed (HTTP 403)`);
  }
  console.log(pad(ep, 30), pad(method, 7), pad(res.OWNER, 8), pad(res.ADMIN, 8), pad(res.STAFF, 8), allowed.join('/'));
}

console.log('');
if (gaps.length) { console.log('AUTHORIZATION GAPS:'); gaps.forEach((g) => console.log('  ! ' + g)); }
else console.log('no authorization gaps detected');

// --- teardown
const d = await fetch(`${url}/rest/v1/admin_users?email=ilike.*zzaudit*`, { method: 'DELETE', headers: { ...H, Prefer: 'return=representation' } });
const gone = await d.json().catch(() => []);
console.log(`\nteardown: deleted ${Array.isArray(gone) ? gone.length : 0} ZZAUDIT admin users`);
await fetch(`${url}/rest/v1/admin_activity_logs?actor_email=ilike.*zzaudit*`, { method: 'DELETE', headers: H });
