// A1 (corrected): a 204 from PATCH/DELETE proves nothing when the filter matches no rows.
// So: seed a real row per table with the service role, then attempt to modify/delete THAT row
// as anon and check afterwards whether it actually changed. No production row is touched.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = (k, extra = {}) => ({ apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json', ...extra });

// table -> [seed payload, primary-key column, mutable text column]
const specs = [
  ['categories', { name: 'ZZAUDIT cat', slug: 'zzaudit-verb-cat' }, 'id', 'name'],
  ['products', { name: 'ZZAUDIT prod', slug: 'zzaudit-verb-prod', price: 1, is_published: true }, 'id', 'name'],
  ['serial_lists', { name: 'ZZAUDIT list' }, 'id', 'name'],
  ['serial_numbers', { serial: 'ZZAUDIT-VERB-0001', status: 'ACTIVE' }, 'id', 'svp'],
  ['verification_logs', { ip_address: '203.0.113.2', user_agent: 'zzaudit-verb' }, 'id', 'user_agent'],
  ['newsletter_subscribers', { email: 'zzaudit-verb@durhaim.test' }, 'id', 'email'],
  ['site_settings', { key: 'zzaudit_verb', value: 'orig' }, 'key', 'value'],
  ['admin_users', { full_name: 'ZZAUDIT Verb', email: 'zzaudit-verb@durhaim.test', role: 'STAFF', status: 'SUSPENDED' }, 'id', 'full_name'],
  ['admin_activity_logs', { actor_email: 'zzaudit-verb', action: 'PROBE', entity_type: 'probe', summary: 'orig' }, 'id', 'summary'],
];

const pad = (s, n) => String(s).padEnd(n);
const out = [];

for (const [table, seed, pk, col] of specs) {
  const mk = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST', headers: H(svc, { Prefer: 'return=representation' }), body: JSON.stringify(seed),
  });
  if (!mk.ok) { out.push({ table, note: `seed failed HTTP ${mk.status} ${(await mk.text()).slice(0, 70)}` }); continue; }
  const row = (await mk.json())[0];
  const id = row[pk];
  const q = `${pk}=eq.${encodeURIComponent(id)}`;

  // anon UPDATE against the real row
  const up = await fetch(`${url}/rest/v1/${table}?${q}`, {
    method: 'PATCH', headers: H(anon), body: JSON.stringify({ [col]: 'PWNED-BY-ANON' }),
  });
  const afterUp = await (await fetch(`${url}/rest/v1/${table}?${q}&select=${col}`, { headers: H(svc) })).json();
  const changed = afterUp[0]?.[col] === 'PWNED-BY-ANON';

  // anon DELETE against the real row
  const del = await fetch(`${url}/rest/v1/${table}?${q}`, { method: 'DELETE', headers: H(anon) });
  const afterDel = await (await fetch(`${url}/rest/v1/${table}?${q}&select=${pk}`, { headers: H(svc) })).json();
  const deleted = Array.isArray(afterDel) && afterDel.length === 0;

  out.push({
    table,
    update: `${up.status} -> ${changed ? '*** MODIFIED ***' : 'unchanged'}`,
    delete: `${del.status} -> ${deleted ? '*** DELETED ***' : 'still present'}`,
  });

  // teardown (row may already be gone if the delete succeeded)
  await fetch(`${url}/rest/v1/${table}?${q}`, { method: 'DELETE', headers: H(svc) });
}

console.log(pad('table', 24), pad('anon UPDATE on real row', 34), 'anon DELETE on real row');
console.log('-'.repeat(96));
for (const r of out) {
  if (r.note) { console.log(pad(r.table, 24), r.note); continue; }
  console.log(pad(r.table, 24), pad(r.update, 34), r.delete);
}

// prove teardown
let residue = 0;
for (const [table] of specs) {
  const r = await fetch(`${url}/rest/v1/${table}?select=*&or=(name.like.ZZAUDIT*,summary.like.orig)&limit=1`, { headers: H(svc) });
  if (r.ok) { const b = await r.json(); residue += Array.isArray(b) ? b.length : 0; }
}
console.log('\nresidual seeded rows found by name/summary sweep:', residue);
