// A2 session-token design, A4 CSRF surface, A8 rate limiting.
import { webcrypto as crypto } from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = 'http://localhost:3000';
const H = { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' };
const PW = 'ZZAuditPassphrase!2026';
const b64 = (u8) => Buffer.from(u8).toString('base64');

async function hashPassword(password) {
  const salt = new Uint8Array(16); crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210000 }, key, 256);
  return { password_hash: b64(new Uint8Array(bits)), password_salt: b64(salt), password_iterations: 210000, password_updated_at: new Date().toISOString() };
}

const EMAIL = 'zzaudit-sess@durhaim.test';
await fetch(`${url}/rest/v1/admin_users`, { method: 'POST', headers: H, body: JSON.stringify({ full_name: 'ZZAUDIT Sess', email: EMAIL, role: 'ADMIN', status: 'ACTIVE', ...(await hashPassword(PW)) }) });

const login = async () => {
  const r = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PW }) });
  const sc = r.headers.getSetCookie?.() ?? [];
  return { status: r.status, raw: sc[0] ?? '', cookie: (sc[0] ?? '').split(';')[0] };
};

console.log('=== A2 session token design ===');
const s1 = await login();
const s2 = await login();
console.log('cookie attributes:', s1.raw.split(';').slice(1).map((x) => x.trim()).join(' | '));
console.log('two logins produce identical token:', s1.cookie === s2.cookie ? 'YES (deterministic, no per-session nonce)' : 'no');

const probe = (cookie) => fetch(`${BASE}/api/admin/overview`, { headers: { Cookie: cookie } }).then((r) => r.status);
console.log('token works:', await probe(s1.cookie));

// logout, then replay the same token
await fetch(`${BASE}/api/admin/logout`, { method: 'POST', headers: { Cookie: s1.cookie } });
const afterLogout = await probe(s1.cookie);
console.log('same token AFTER logout:', afterLogout, afterLogout === 200 ? '<-- REPLAYABLE, logout does not invalidate' : '(invalidated)');

// rotate password, then replay
await fetch(`${url}/rest/v1/admin_users?email=eq.${EMAIL}`, { method: 'PATCH', headers: H, body: JSON.stringify(await hashPassword('DifferentPassphrase!2026')) });
const afterPwChange = await probe(s1.cookie);
console.log('same token AFTER password change:', afterPwChange, afterPwChange === 200 ? '<-- STILL VALID, password rotation does not revoke sessions' : '(invalidated)');

// suspend, then replay
await fetch(`${url}/rest/v1/admin_users?email=eq.${EMAIL}`, { method: 'PATCH', headers: H, body: JSON.stringify({ status: 'SUSPENDED' }) });
const afterSuspend = await probe(s1.cookie);
console.log('same token AFTER suspension:', afterSuspend, afterSuspend === 200 ? '<-- STILL VALID (bad)' : '(correctly invalidated)');
await fetch(`${url}/rest/v1/admin_users?email=eq.${EMAIL}`, { method: 'PATCH', headers: H, body: JSON.stringify({ status: 'ACTIVE', ...(await hashPassword(PW)) }) });

console.log('\n=== A4 CSRF surface ===');
const s3 = await login();
for (const ct of ['application/x-www-form-urlencoded', 'text/plain', 'multipart/form-data']) {
  const r = await fetch(`${BASE}/api/admin/settings`, {
    method: 'PATCH', headers: { Cookie: s3.cookie, 'Content-Type': ct },
    body: 'public_domain=evil.example.com',
  });
  console.log(`PATCH settings as ${ct.padEnd(35)} -> ${r.status}${r.status < 300 ? '  <-- SIMPLE-REQUEST CSRF POSSIBLE' : ''}`);
}

console.log('\n=== A8 rate limiting ===');
let codes = [];
for (let i = 0; i < 9; i += 1) {
  const r = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: 'wrong-on-purpose' }) });
  codes.push(r.status);
}
console.log('9 bad logins, same email:', codes.join(' '), codes.includes(429) ? `(429 from attempt ${codes.indexOf(429) + 1})` : '<-- NEVER RATE LIMITED');

codes = [];
for (const variant of ['zzaudit-sess@durhaim.test', 'ZZAUDIT-SESS@durhaim.test', 'zzaudit-sess@Durhaim.test']) {
  const r = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: variant, password: 'wrong-on-purpose' }) });
  codes.push(`${variant.slice(0, 22)}=${r.status}`);
}
console.log('case variants after limit:', codes.join('  '));

// user enumeration
const known = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'zzaudit-nobody@durhaim.test', password: 'x' }) });
console.log('unknown email  ->', known.status, JSON.stringify(await known.json()));

await fetch(`${url}/rest/v1/admin_users?email=ilike.*zzaudit*`, { method: 'DELETE', headers: H });
await fetch(`${url}/rest/v1/admin_activity_logs?actor_email=ilike.*zzaudit*`, { method: 'DELETE', headers: H });
console.log('\nteardown complete');
