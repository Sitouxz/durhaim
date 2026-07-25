import { writeFileSync } from 'node:fs';

const base = 'https://www.durhaim.com';
const outDir = 'C:/Users/yehez/AppData/Local/Temp/claude/D--Works-Arma-Durhaim/5c5368f2-ff66-419d-be09-ffc2a988bca8/scratchpad/base';

const routes = [
  ['home', '/'],
  ['catalogue', '/catalogue'],
  ['product', '/catalogue/tbp-vest-mk-iv'],
  ['verify', '/verify'],
  ['cert-active', '/verify/ZY1956EW9KJF'],
  ['cert-unknown', '/verify/NOSUCHSERIAL999'],
  ['qr-guide', '/qr-guide'],
  ['our-story', '/our-story'],
  ['battle-proven', '/battle-proven'],
  ['latest-projects', '/latest-projects'],
  ['social', '/social-engagement'],
  ['contact', '/contact'],
  ['notfound', '/this-page-does-not-exist'],
  ['cart-redirect', '/cart'],
];

const shots = [];
for (const [name, p] of routes) {
  for (const w of [375, 1440]) {
    shots.push({ name: `${name}-${w}`, url: base + p, width: w, dpr: 1, waitMs: 3200 });
  }
}
shots.push({ name: 'home-en-1440', url: `${base}/?lang=en`, width: 1440, dpr: 1, waitMs: 3200 });
shots.push({ name: 'catalogue-768', url: `${base}/catalogue`, width: 768, dpr: 1, waitMs: 3200 });
shots.push({ name: 'home-768', url: `${base}/`, width: 768, dpr: 1, waitMs: 3200 });

writeFileSync('base.json', JSON.stringify({ outDir, chrome: 'C:/Program Files/Google/Chrome/Application/chrome.exe', shots }, null, 2));
console.log('shots:', shots.length);
