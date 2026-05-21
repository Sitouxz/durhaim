const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};

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
  const localEnv = loadEnv();
  const databaseUrl = process.env.DATABASE_URL
    || process.env.SUPABASE_DB_URL
    || localEnv.DATABASE_URL
    || localEnv.SUPABASE_DB_URL;

  if (!databaseUrl) {
    console.error([
      'Missing database connection string.',
      'Add DATABASE_URL or SUPABASE_DB_URL to .env.local, then rerun:',
      '  npm run supabase:apply',
      '',
      'The Supabase anon/service-role keys can read data through PostgREST,',
      'but they cannot create tables. Schema creation needs the Postgres',
      'connection string from Supabase Dashboard > Project Settings > Database.',
    ].join('\n'));
    process.exit(1);
  }

  const schema = fs.readFileSync(path.join(process.cwd(), 'supabase', 'schema.sql'), 'utf8');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(schema);
  await client.end();
  console.log('Supabase schema applied successfully.');
}

main().catch((error) => {
  console.error('Failed to apply Supabase schema:');
  console.error(error.message);
  process.exit(1);
});
