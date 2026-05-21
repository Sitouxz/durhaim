const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const checks = [
    ['categories', supabase.from('categories').select('*').limit(1)],
    ['products', supabase.from('products').select('id, name, slug, categories(name, slug)').limit(1)],
    ['serial_numbers', supabase.from('serial_numbers').select('id, serial, status, products(name)').limit(1)],
    ['verification_logs', supabase.from('verification_logs').select('*').limit(1)],
    ['newsletter_subscribers', supabase.from('newsletter_subscribers').select('*').limit(1)],
  ];

  let failed = false;
  for (const [name, query] of checks) {
    const { error } = await query;
    if (error) {
      failed = true;
      console.error(`${name}: ${error.code} ${error.message}`);
    } else {
      console.log(`${name}: OK`);
    }
  }

  const { data, error } = await supabase
    .from('serial_numbers')
    .select('serial, status, products(name)')
    .eq('serial', 'DRH-TEST-260520-XXXX')
    .single();

  if (error) {
    failed = true;
    console.error(`test serial: ${error.code} ${error.message}`);
  } else {
    console.log(`test serial: OK ${data.serial} ${data.status}`);
  }

  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
