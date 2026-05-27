const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing ${relativePath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

const localizedPublicFiles = [
  'src/app/page.tsx',
  'src/app/battle-proven/page.tsx',
  'src/app/social-engagement/page.tsx',
  'src/app/our-story/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/latest-projects/page.tsx',
  'src/app/qr-guide/page.tsx',
  'src/app/catalogue/[slug]/page.tsx',
];

for (const file of localizedPublicFiles) {
  const content = read(file);
  if (!content.includes('LocalizedText')) {
    failures.push(`${file} must use LocalizedText for public page body copy.`);
  }
}

for (const file of [
  'src/app/catalogue/page.tsx',
  'src/app/cart/page.tsx',
  'src/app/verify/page.tsx',
  'src/components/SerialChecker.tsx',
  'src/components/Footer.tsx',
  'src/components/ProductDetailClient.tsx',
  'src/components/TopNavBar.tsx',
]) {
  const content = read(file);
  if (!content.includes('useCommerce')) {
    failures.push(`${file} must use the commerce language dictionary.`);
  }
}

const provider = read('src/components/CommerceProvider.tsx');
for (const required of [
  'Perlengkapan',
  'Pemeriksa Keaslian',
  'Sertifikat Keaslian',
  'Masukkan nomor serial',
  'Tahan Benturan Berat',
  'Hubungi Bantuan',
  'Selalu Maju',
]) {
  if (!provider.includes(required) && !read('src/app/page.tsx').includes(required)) {
    failures.push(`Indonesian public copy must include "${required}".`);
  }
}

const sourceChecks = [
  ['src/components/SerialChecker.tsx', 'Enter serial number below'],
  ['src/components/SerialChecker.tsx', 'VIEW CERTIFICATE'],
  ['src/components/Footer.tsx', 'Follow our newsletter to stay updated about agency.'],
  ['src/app/verify/page.tsx', 'AUTHENTICITY CHECKER'],
  ['src/app/page.tsx', 'Input No Code Here'],
  ['src/components/CommerceProvider.tsx', 'Kegiatan Sosial'],
  ['src/components/CommerceProvider.tsx', 'Kegiatan social'],
  ['src/app/social-engagement/page.tsx', 'Kegiatan Sosial'],
  ['src/app/social-engagement/page.tsx', 'Kegiatan social'],
  ['src/app/latest-projects/page.tsx', 'Kabar Sosial'],
];

for (const [file, forbidden] of sourceChecks) {
  if (read(file).includes(forbidden)) {
    failures.push(`${file} still contains old English-only copy: ${forbidden}`);
  }
}

if (failures.length) {
  console.error('Public Indonesian copy audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Public Indonesian copy coverage is present.');
