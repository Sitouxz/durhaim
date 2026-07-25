// Pre-audit snapshot of every table via PostgREST (service role), paged.
// Env comes from `node --env-file=.env.local` so this needs no dependencies.
import { writeFile, mkdir } from 'node:fs/promises';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const outDir = process.argv[2];
const PAGE = 1000;

const tables = [
  'categories', 'products', 'serial_lists', 'serial_numbers', 'verification_logs',
  'newsletter_subscribers', 'site_settings', 'admin_users', 'admin_activity_logs',
];

await mkdir(outDir, { recursive: true });
const manifest = { takenAt: new Date().toISOString(), tables: {} };

for (const t of tables) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const r = await fetch(`${url}/rest/v1/${t}?select=*&order=id.asc&limit=${PAGE}&offset=${from}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }).catch(() => null);
    if (!r?.ok) {
      // site_settings is keyed by `key`, not `id`
      const r2 = await fetch(`${url}/rest/v1/${t}?select=*&limit=${PAGE}&offset=${from}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!r2.ok) { console.log(`${t}: HTTP ${r2.status} ${(await r2.text()).slice(0, 120)}`); break; }
      const batch = await r2.json();
      rows.push(...batch);
      if (batch.length < PAGE) break;
      continue;
    }
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  await writeFile(`${outDir}/${t}.json`, JSON.stringify(rows, null, 1));
  manifest.tables[t] = rows.length;
  console.log(`${t.padEnd(24)} ${String(rows.length).padStart(6)} rows`);
}

await writeFile(`${outDir}/_manifest.json`, JSON.stringify(manifest, null, 2));
console.log('\nsnapshot ->', outDir);
