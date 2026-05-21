const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appDir = path.join(root, 'src', 'app');
const srcDir = path.join(root, 'src');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function routeFromPage(file) {
  const rel = path.relative(appDir, path.dirname(file)).replace(/\\/g, '/');
  const segments = rel.split('/').filter((segment) => segment && !/^\(.+\)$/.test(segment));
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

function normalizeRoute(route) {
  if (!route || !route.startsWith('/') || route.startsWith('//') || route.startsWith('/api/')) return null;
  return route.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
}

const files = walk(srcDir).filter((file) => /\.(tsx|ts|jsx|js)$/.test(file));
const pageRoutes = new Set(walk(appDir).filter((file) => path.basename(file) === 'page.tsx').map(routeFromPage));
const refs = [];

function addRef(file, route) {
  const normalized = normalizeRoute(route);
  if (normalized) refs.push({ file, route: normalized });
}

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/href\s*=\s*["'`]([^"'`]+)["'`]/g)) addRef(file, match[1]);
  for (const match of text.matchAll(/href\s*:\s*["'`]([^"'`]+)["'`]/g)) addRef(file, match[1]);
  for (const match of text.matchAll(/(?:router\.)?(?:push|replace|prefetch)\(\s*["'`]([^"'`$]+)["'`]/g)) addRef(file, match[1]);
  for (const match of text.matchAll(/(?:router\.)?(?:push|replace|prefetch)\(\s*`([^`$]*)\$\{/g)) addRef(file, `${match[1].replace(/\/$/, '')}/[param]`);
}

function segmentMatch(refSeg, pageSeg) {
  return refSeg === pageSeg || /^\[[^/]+\]$/.test(pageSeg) || refSeg === '[param]';
}

function routeExists(route) {
  if (pageRoutes.has(route)) return true;
  const refSegs = route.split('/').filter(Boolean);
  for (const pageRoute of pageRoutes) {
    const pageSegs = pageRoute.split('/').filter(Boolean);
    if (refSegs.length === pageSegs.length && refSegs.every((seg, index) => segmentMatch(seg, pageSegs[index]))) {
      return true;
    }
  }
  return false;
}

const missing = refs.filter((ref) => !routeExists(ref.route));

if (missing.length) {
  console.error('Referenced internal routes with no page:');
  for (const ref of missing) console.error(`- ${ref.route} referenced in ${path.relative(root, ref.file)}`);
  process.exit(1);
}

console.log('No missing internal page routes found.');
