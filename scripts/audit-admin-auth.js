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
