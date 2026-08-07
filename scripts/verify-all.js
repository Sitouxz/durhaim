// Runs every audit script, collects failures, and exits non-zero at the end.
//
// The `verify` script used to be a single `&&` chain. On 2026-06-21 a broken helper made
// audit-page-completion.js throw, the chain aborted at step 4 of 20, and the remaining 16
// audits plus `npm run build` silently stopped running for over a month (F-3). Two real
// regressions accumulated behind it. One broken script must not hide the rest.

const { spawnSync } = require('child_process');

const steps = [
  ['test:unit', ['run', 'test:unit']],
  ['lint', ['run', 'lint']],
  ['audit:routes', ['run', 'audit:routes']],
  ['audit:whatsapp-only', ['run', 'audit:whatsapp-only']],
  ['audit:controls', ['run', 'audit:controls']],
  ['audit:pages', ['run', 'audit:pages']],
  ['audit:catalogue', ['run', 'audit:catalogue']],
  ['audit:admin-completion', ['run', 'audit:admin-completion']],
  ['audit:admin-auth', ['run', 'audit:admin-auth']],
  ['audit:print-qr', ['run', 'audit:print-qr']],
  ['audit:bulk-qr', ['run', 'audit:bulk-qr']],
  ['audit:qr-layout', ['run', 'audit:qr-layout']],
  ['audit:advanced-serials', ['run', 'audit:advanced-serials']],
  ['audit:user-management', ['run', 'audit:user-management']],
  ['audit:seo-ai', ['run', 'audit:seo-ai']],
  ['audit:security-hardening', ['run', 'audit:security-hardening']],
  ['audit:rls-exposure', ['run', 'audit:rls-exposure']],
  ['audit:settings', ['run', 'audit:settings']],
  ['audit:public-id-copy', ['run', 'audit:public-id-copy']],
  ['audit:public-pricing', ['run', 'audit:public-pricing']],
  ['audit:public-background', ['run', 'audit:public-background']],
  ['build', ['run', 'build']],
];

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const failed = [];

for (const [name, args] of steps) {
  process.stdout.write(`\n─── ${name} ───\n`);
  // A single command string rather than (cmd, argsArray, {shell:true}): Node deprecates the
  // latter because array args are concatenated unescaped. Every step name here is a hardcoded
  // constant, so there is nothing to interpolate. `shell` is required to run npm on Windows.
  const res = spawnSync(`${npm} ${args.join(' ')}`, { stdio: 'inherit', shell: true });
  if (res.status !== 0) failed.push(`${name} (exit ${res.status ?? 'signal'})`);
}

process.stdout.write('\n' + '='.repeat(60) + '\n');
if (failed.length) {
  console.error(`${failed.length} of ${steps.length} steps FAILED:`);
  for (const f of failed) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`All ${steps.length} steps passed.`);
