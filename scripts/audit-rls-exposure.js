// Runtime RLS assertion: the public anon key must not be able to read the serial registry.
//
// This exists because of F-1. A single RLS policy line granted `anon` SELECT on
// serial_numbers, and because NEXT_PUBLIC_SUPABASE_ANON_KEY ships in the browser bundle,
// all 40,338 active serials were downloadable by anyone — which defeats the entire
// anti-counterfeit product. None of the other audit scripts could have caught it: they
// assert on source text, and the exposure lived in the database.
//
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Skips (exit 0) when
// they are absent, so a CI job without secrets does not fail spuriously — but never skips
// silently when it can actually reach the database.

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

// Tables the anon role is allowed to read, and the maximum it may read from each.
const PUBLIC_READABLE = new Set(['products', 'categories']);
const MUST_BE_EMPTY = [
  'serial_numbers',
  'serial_lists',
  'verification_logs',
  'newsletter_subscribers',
  'site_settings',
  'admin_users',
  'admin_activity_logs',
];

async function rowCount(baseUrl, key, table) {
  const res = await fetch(
    `${baseUrl}/rest/v1/${table}?select=*&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' } },
  );
  if (!res.ok && res.status !== 206) return { error: `HTTP ${res.status}` };
  const range = res.headers.get('content-range') || '/0';
  return { count: Number(range.split('/')[1] || 0) };
}

async function main() {
  const local = loadEnvLocal();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || local.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || local.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    console.log('RLS exposure audit skipped: Supabase URL/anon key not available.');
    return;
  }

  const failures = [];

  for (const table of MUST_BE_EMPTY) {
    const { count, error } = await rowCount(baseUrl, anonKey, table);
    if (error) {
      failures.push(`${table}: could not check (${error})`);
      continue;
    }
    if (count > 0) {
      failures.push(
        `${table}: anon can read ${count} row(s) — must be 0. `
        + 'The anon key is public, so any SELECT grant here exposes this table to everyone.',
      );
    }
  }

  // The intentionally public tables must stay readable, or the storefront breaks.
  for (const table of PUBLIC_READABLE) {
    const { count, error } = await rowCount(baseUrl, anonKey, table);
    if (error) failures.push(`${table}: could not check (${error})`);
    else if (count === 0) failures.push(`${table}: anon reads 0 rows — the public catalogue needs this readable.`);
  }

  if (failures.length) {
    console.error('RLS exposure audit failed:');
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }

  console.log('Anon role cannot read the serial registry or any admin table.');
}

main().catch((error) => {
  console.error('RLS exposure audit errored:', error.message);
  process.exit(1);
});
