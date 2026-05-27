const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredFiles = [
  'src/middleware.ts',
  'src/lib/admin-auth.ts',
  'src/app/api/admin/login/route.ts',
  'src/app/api/admin/logout/route.ts',
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing ${file}`);
  }
}

const loginPagePath = fs.existsSync(path.join(root, 'src/app/(auth)/admin/login/page.tsx'))
  ? 'src/app/(auth)/admin/login/page.tsx'
  : 'src/app/admin/login/page.tsx';

const loginPage = fs.existsSync(path.join(root, loginPagePath))
  ? fs.readFileSync(path.join(root, loginPagePath), 'utf8')
  : '';

if (/router\.push\(['"]\/admin['"]\)/.test(loginPage)) {
  failures.push('Admin login page bypasses authentication by routing directly to /admin.');
}

if (!/\/api\/admin\/login/.test(loginPage)) {
  failures.push('Admin login page does not submit to /api/admin/login.');
}

if (!/email/.test(loginPage) || !/setEmail/.test(loginPage)) {
  failures.push('Admin login page must collect a user email.');
}

const loginApi = fs.existsSync(path.join(root, 'src/app/api/admin/login/route.ts'))
  ? fs.readFileSync(path.join(root, 'src/app/api/admin/login/route.ts'), 'utf8')
  : '';

if (!/admin_users/.test(loginApi) || !/status/.test(loginApi)) {
  failures.push('Admin login API must verify an active admin user.');
}

if (!/createAdminSessionToken\([^)]*email/.test(loginApi)) {
  failures.push('Admin login API must create a session token tied to the user email.');
}

if (!/getAdminCookieOptions\(req\)/.test(loginApi)) {
  failures.push('Admin login API must choose session cookie security from the current request.');
}

const adminAuth = fs.existsSync(path.join(root, 'src/lib/admin-auth.ts'))
  ? fs.readFileSync(path.join(root, 'src/lib/admin-auth.ts'), 'utf8')
  : '';

if (!/getAdminSessionUser/.test(adminAuth)) {
  failures.push('Admin auth helper must expose the signed-in session user.');
}

for (const unsafeDefault of ['durhaim-admin-2026', 'durhaim-local-session-secret']) {
  if (adminAuth.includes(unsafeDefault)) {
    failures.push(`Admin auth must not include unsafe default secret ${unsafeDefault}.`);
  }
}

if (!/getActiveAdminSessionUser/.test(adminAuth) || !/admin_users/.test(adminAuth) || !/ACTIVE/.test(adminAuth)) {
  failures.push('Admin auth helper must validate sessions against an active admin_users record.');
}

if (!/shouldUseSecureAdminCookie/.test(adminAuth) || !/x-forwarded-proto/.test(adminAuth) || !/localhost/.test(adminAuth)) {
  failures.push('Admin auth helper must avoid secure cookies on local HTTP while keeping HTTPS cookies secure.');
}

const signSessionEmailMatch = adminAuth.match(/async function signSessionEmail[\s\S]*?\n}/);
if (!signSessionEmailMatch || /getAdminPassword\(\)/.test(signSessionEmailMatch[0])) {
  failures.push('Admin session signing must not depend on the login password.');
}

if (!/getActiveAdminSessionUser/.test(fs.existsSync(path.join(root, 'src/middleware.ts'))
  ? fs.readFileSync(path.join(root, 'src/middleware.ts'), 'utf8')
  : '')) {
  failures.push('Admin middleware must check that the session user is still active.');
}

if (/isMissingUserTableError/.test(loginApi) || /warning: 'User management schema is not installed yet.'/.test(loginApi)) {
  failures.push('Admin login API must not allow bootstrap fallback logins when user schema is missing.');
}

if (!/LOGIN_WINDOW_MS/.test(loginApi) || !/429/.test(loginApi)) {
  failures.push('Admin login API must rate limit repeated login attempts.');
}

const signOutButton = fs.existsSync(path.join(root, 'src/components/AdminSignOutButton.tsx'))
  ? fs.readFileSync(path.join(root, 'src/components/AdminSignOutButton.tsx'), 'utf8')
  : '';

if (!/\/api\/admin\/logout/.test(signOutButton)) {
  failures.push('Admin sign out does not call /api/admin/logout.');
}

if (failures.length) {
  console.error('Admin auth audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Admin auth gate is present.');
