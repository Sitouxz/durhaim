// Track B: admin CRUD flows end to end, plus edge cases. Seeds and tears down its own fixtures.
import { webcrypto as crypto } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = 'http://localhost:3000';
const H = { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' };
const PW = 'ZZAuditPassphrase!2026';
const b64 = (u) => Buffer.from(u).toString('base64');
const pad = (s, n) => String(s).padEnd(n);
const findings = [];
const note = (msg) => { findings.push(msg); console.log('   ! ' + msg); };

const salt = new Uint8Array(16); crypto.getRandomValues(salt);
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(PW), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210000 }, key, 256);
await fetch(`${url}/rest/v1/admin_users`, { method: 'POST', headers: H, body: JSON.stringify({
  full_name: 'ZZAUDIT Owner', email: 'zzaudit-owner@durhaim.test', role: 'OWNER', status: 'ACTIVE',
  password_hash: b64(new Uint8Array(bits)), password_salt: b64(salt), password_iterations: 210000 }) });

const L = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'zzaudit-owner@durhaim.test', password: PW }) });
const cookie = (L.headers.getSetCookie()[0] || '').split(';')[0];
writeFileSync('admin-cookie.txt', cookie);
console.log('login OWNER:', L.status, cookie ? 'ok' : 'FAILED');

const api = (p, method = 'GET', body) => fetch(BASE + p, {
  method, headers: { Cookie: cookie, 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

console.log('\n=== B: overview ===');
const ov = await api('/api/admin/overview');
const ovj = await ov.json();
console.log('  GET overview', ov.status, JSON.stringify(ovj).slice(0, 150));

console.log('\n=== B: category CRUD ===');
let catId;
{
  const c = await api('/api/admin/categories', 'POST', { name: 'ZZAUDIT Cat', slug: 'zzaudit-cat', icon: 'star' });
  const j = await c.json().catch(() => ({}));
  catId = j?.id ?? j?.[0]?.id;
  console.log('  POST  ', c.status, catId ? 'created' : JSON.stringify(j).slice(0, 110));
  if (!catId) note('category POST did not return an id');

  const dup = await api('/api/admin/categories', 'POST', { name: 'ZZAUDIT Cat', slug: 'zzaudit-cat' });
  console.log('  POST duplicate slug', dup.status, dup.status === 409 ? '(409 as expected)' : JSON.stringify(await dup.json()).slice(0, 90));
  if (dup.status === 200 || dup.status === 201) note('duplicate category slug accepted');

  const bad = await api('/api/admin/categories', 'POST', { name: '', slug: '' });
  console.log('  POST empty name/slug', bad.status, bad.status === 400 ? '(400 as expected)' : 'EXPECTED 400');
  if (bad.status < 400) note(`empty category name/slug accepted (HTTP ${bad.status})`);

  if (catId) {
    const u = await api('/api/admin/categories', 'PATCH', { id: catId, name: 'ZZAUDIT Cat Renamed', slug: 'zzaudit-cat', icon: 'star' });
    console.log('  PATCH ', u.status);
    const d = await api(`/api/admin/categories?id=${catId}`, 'DELETE');
    console.log('  DELETE', d.status);
    if (d.status >= 400) note(`category DELETE failed (HTTP ${d.status}) — check the delete contract`);
  }
}

console.log('\n=== B: product CRUD ===');
let prodId;
{
  const p = await api('/api/admin/products', 'POST', {
    name: 'ZZAUDIT Product', slug: 'zzaudit-product', description: 'audit fixture',
    price: 123456, regional_prices: { ID: 123456, GLOBAL: 9 }, images: [], is_published: false,
  });
  const j = await p.json().catch(() => ({}));
  prodId = j?.id ?? j?.[0]?.id;
  console.log('  POST  ', p.status, prodId ? 'created' : JSON.stringify(j).slice(0, 110));

  const dup = await api('/api/admin/products', 'POST', { name: 'ZZAUDIT Product', slug: 'zzaudit-product', price: 1 });
  console.log('  POST duplicate slug', dup.status, dup.status === 409 ? '(409 as expected)' : 'EXPECTED 409');
  if (dup.status === 200 || dup.status === 201) note('duplicate product slug accepted');

  const neg = await api('/api/admin/products', 'POST', { name: 'ZZAUDIT Neg', slug: 'zzaudit-neg', price: -500 });
  console.log('  POST negative price', neg.status, neg.status >= 400 ? '(rejected)' : 'ACCEPTED');
  if (neg.status < 400) note('negative product price accepted');

  const long = await api('/api/admin/products', 'POST', { name: 'Z'.repeat(5000), slug: 'zzaudit-long', price: 1 });
  console.log('  POST 5000-char name', long.status, long.status >= 400 ? '(rejected)' : 'ACCEPTED');
  if (long.status < 400) note('5000-character product name accepted with no length cap');

  // unpublished product must not appear publicly
  if (prodId) {
    const pub = await fetch(`${BASE}/api/products?search=ZZAUDIT`);
    const pj = await pub.json();
    const leaked = (pj.products || []).some((x) => x.slug === 'zzaudit-product');
    console.log('  unpublished product visible in public API:', leaked ? 'YES — LEAK' : 'no');
    if (leaked) note('unpublished product is returned by the public /api/products');

    const page = await fetch(`${BASE}/catalogue/zzaudit-product`);
    console.log('  unpublished product page:', page.status, page.status === 404 ? '(404 as expected)' : 'EXPECTED 404');
    if (page.status === 200) note('unpublished product page renders publicly at /catalogue/<slug>');
  }
}

console.log('\n=== B: serial generation ===');
{
  const g = await api('/api/admin/serials', 'POST', { productId: prodId ?? 'CUSTOM_PRODUCT', count: 3 });
  console.log('  POST generate 3', g.status, JSON.stringify(await g.json().catch(() => ({}))).slice(0, 120));

  const zero = await api('/api/admin/serials', 'POST', { productId: prodId ?? 'CUSTOM_PRODUCT', count: 0 });
  console.log('  POST count=0', zero.status, zero.status >= 400 ? '(rejected)' : 'ACCEPTED');
  if (zero.status < 400) note('serial generation with count=0 accepted');

  const huge = await api('/api/admin/serials', 'POST', { productId: prodId ?? 'CUSTOM_PRODUCT', count: 100000 });
  console.log('  POST count=100000', huge.status, huge.status >= 400 ? '(rejected)' : 'ACCEPTED — no upper bound');
  if (huge.status < 400) note('serial generation accepted count=100000 with no upper bound');
}

console.log('\n=== B: user-logs / activity ===');
const ul = await api('/api/admin/user-logs');
const ulj = await ul.json().catch(() => []);
console.log('  GET user-logs', ul.status, Array.isArray(ulj) ? `${ulj.length} entries` : JSON.stringify(ulj).slice(0, 90));

console.log('\n=== teardown ===');
for (const [t, c, v] of [
  ['serial_numbers', 'serial', 'ilike.*ZZAUDIT*'],
  ['products', 'slug', 'ilike.*zzaudit*'],
  ['categories', 'slug', 'ilike.*zzaudit*'],
  ['admin_users', 'email', 'ilike.*zzaudit*'],
  ['admin_activity_logs', 'actor_email', 'ilike.*zzaudit*'],
]) {
  const r = await fetch(`${url}/rest/v1/${t}?${c}=${v}`, { method: 'DELETE', headers: { ...H, Prefer: 'return=representation' } });
  const b = await r.json().catch(() => []);
  if (Array.isArray(b) && b.length) console.log(`  ${t}: removed ${b.length}`);
}

console.log('\n' + '='.repeat(60));
console.log(findings.length ? `${findings.length} issue(s):` : 'no issues found in admin CRUD flows');
findings.forEach((f) => console.log('  - ' + f));
