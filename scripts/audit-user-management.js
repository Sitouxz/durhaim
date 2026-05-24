const fs = require('fs');
const path = require('path');

function read(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing required file: ${relativePath}`);
    process.exit(1);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

const schema = read('supabase/schema.sql');
for (const required of ['admin_users', 'admin_activity_logs', 'admin_user_role_check', 'admin_user_status_check']) {
  if (!schema.includes(required)) {
    console.error(`Schema must define ${required}.`);
    process.exit(1);
  }
}

const api = read('src/app/api/admin/users/route.ts');
for (const method of ['export async function GET', 'export async function POST', 'export async function PATCH']) {
  if (!api.includes(method)) {
    console.error(`Users API must implement ${method}.`);
    process.exit(1);
  }
}

for (const required of ['requireUserManager', 'OWNER', 'ADMIN', 'actorEmail']) {
  if (!api.includes(required)) {
    console.error(`Users API must enforce admin role permissions and activity attribution (${required}).`);
    process.exit(1);
  }
}

const logApi = read('src/app/api/admin/user-logs/route.ts');
if (!logApi.includes('admin_activity_logs')) {
  console.error('User log API must read admin_activity_logs.');
  process.exit(1);
}

const page = read('src/app/admin/users/page.tsx');
for (const required of ['User Management', 'Activity Log', '/api/admin/users', '/api/admin/user-logs']) {
  if (!page.includes(required)) {
    console.error(`Users page must include ${required}.`);
    process.exit(1);
  }
}

const layout = read('src/app/admin/layout.tsx');
if (!layout.includes('/admin/users')) {
  console.error('Admin navigation must link to /admin/users.');
  process.exit(1);
}

console.log('User management and activity log are wired.');
