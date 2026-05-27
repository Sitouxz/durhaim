const fs = require('fs');
const path = require('path');

const root = process.cwd();

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing required file: ${relativePath}`);
    process.exit(1);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

const failures = [];

function expectIncludes(file, required, message) {
  const content = read(file);
  if (!content.includes(required)) failures.push(message ?? `${file} must include ${required}.`);
}

function expectNotIncludes(file, forbidden, message) {
  const content = read(file);
  if (content.includes(forbidden)) failures.push(message ?? `${file} must not include ${forbidden}.`);
}

for (const route of [
  'src/app/api/admin/products/route.ts',
  'src/app/api/admin/serials/route.ts',
  'src/app/api/admin/categories/route.ts',
  'src/app/api/admin/settings/route.ts',
  'src/app/api/admin/product-images/route.ts',
  'src/app/api/admin/user-logs/route.ts',
]) {
  expectIncludes(route, 'requireAdminRole', `${route} must enforce role-based authorization inside the handler.`);
}

for (const route of ['src/app/api/verify/route.ts', 'src/app/verify/[serial]/page.tsx']) {
  expectNotIncludes(route, "status: 'ACTIVE'", `${route} must not activate serial numbers from public verification.`);
  expectNotIncludes(route, 'createAdminClient', `${route} must not use the service-role admin client from public verification.`);
}

expectIncludes('src/app/api/verify/route.ts', 'verifyRateLimit', 'Public verify API must rate limit serial checks.');
expectIncludes('src/app/api/verify/route.ts', "rpc('record_serial_verification'", 'Public verify API must use the constrained verification RPC.');
expectIncludes('src/app/api/newsletter/route.ts', 'newsletterRateLimit', 'Newsletter API must rate limit public submissions.');
expectNotIncludes('src/app/api/newsletter/route.ts', 'SUPABASE_SERVICE_ROLE_KEY ||', 'Newsletter API must not fall back to service-role writes.');

for (const required of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
  expectIncludes('next.config.mjs', required, `next.config.mjs must set ${required}.`);
}

expectIncludes('next.config.mjs', 'process.env.NODE_ENV === \'development\'', 'CSP must detect development mode explicitly.');
expectIncludes('next.config.mjs', "'unsafe-eval'", 'Development CSP must allow Next.js dev runtime eval.');

for (const required of ['https://vercel.live', 'wss://ws-us3.pusher.com']) {
  expectIncludes('next.config.mjs', required, `CSP must allow ${required} for the Vercel Live feedback widget.`);
}

const schema = read('supabase/schema.sql');
for (const table of ['categories', 'products', 'serial_numbers', 'verification_logs', 'newsletter_subscribers', 'site_settings', 'admin_users', 'admin_activity_logs']) {
  if (!schema.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`)) {
    failures.push(`supabase/schema.sql must enable RLS on ${table}.`);
  }
}

for (const policy of [
  'public_read_published_products',
  'public_read_categories',
  'public_read_verifiable_serials',
  'public_insert_newsletter_subscribers',
  'record_serial_verification',
]) {
  if (!schema.includes(policy)) failures.push(`supabase/schema.sql must define ${policy}.`);
}

for (const required of ['password_hash', 'password_salt', 'password_iterations', 'verifyAdminPasswordHash']) {
  const loginApi = read('src/app/api/admin/login/route.ts');
  const passwordHelperPath = path.join(root, 'src/lib/admin-passwords.ts');
  const passwordHelper = fs.existsSync(passwordHelperPath) ? fs.readFileSync(passwordHelperPath, 'utf8') : '';
  if (!loginApi.includes(required) && !passwordHelper.includes(required)) {
    failures.push(`Admin login must use per-user password hashes (${required}).`);
  }
}

expectIncludes('src/app/api/admin/product-images/route.ts', 'validateImageSignature', 'Product image upload must validate file signatures.');
expectNotIncludes('src/app/api/admin/product-images/route.ts', "'image/gif'", 'Product image upload must not allow GIF uploads.');

if (failures.length) {
  console.error('Security hardening audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Security hardening guardrails are present.');
