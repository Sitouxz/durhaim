const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'src');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(srcDir).filter((file) => /\.(tsx|jsx)$/.test(file));
const failures = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (/href=["']#["']/.test(line)) {
      failures.push(`${path.relative(root, file)}:${index + 1}: placeholder href="#"`);
    }
  });

  for (const match of text.matchAll(/<button\b[\s\S]*?>/g)) {
    const tag = match[0];
    if (!/onClick=|type=|aria-label=/.test(tag)) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      failures.push(`${path.relative(root, file)}:${line}: button has no type, aria-label, or click handler`);
    }
  }
}

if (failures.length) {
  console.error('Inert control audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('No obvious inert controls found.');
