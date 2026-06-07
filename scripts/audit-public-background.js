const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8');
const backgroundMatch = css.match(/\.bg-texture\s*\{([\s\S]*?)\}/);

if (!backgroundMatch) {
  console.error('Public background audit failed: .bg-texture is missing.');
  process.exit(1);
}

const background = backgroundMatch[1];
const failures = [];

if (/url\(['"]?\/images\//.test(background)) {
  failures.push('.bg-texture must not use product photography.');
}

if (!background.includes('background-color: #131313')) {
  failures.push('.bg-texture must provide the dark brand background color.');
}

if (!background.includes('linear-gradient') || !background.includes('radial-gradient')) {
  failures.push('.bg-texture must use a restrained CSS-only tactical texture.');
}

if (failures.length) {
  console.error('Public background audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Public shared background uses a restrained CSS-only tactical texture.');
