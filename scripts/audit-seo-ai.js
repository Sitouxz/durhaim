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

const checks = [
  {
    file: 'src/app/layout.tsx',
    required: ['Organization', 'WebSite', 'SearchAction', 'alternates', 'languages'],
  },
  {
    file: 'src/app/robots.ts',
    required: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot'],
  },
  {
    file: 'src/app/sitemap.ts',
    required: ['fallbackProducts', 'alternates', 'languages'],
  },
  {
    file: 'src/app/page.tsx',
    required: ['FAQPage', 'DURHAIM Tactical Gear', 'Indonesia', 'global'],
  },
  {
    file: 'src/app/catalogue/[slug]/page.tsx',
    required: ['Product', 'BreadcrumbList', 'FAQPage', 'WhatsApp'],
  },
  {
    file: 'src/app/contact/page.tsx',
    required: ['LocalBusiness', 'Bandung', 'areaServed', 'availableLanguage'],
  },
];

for (const check of checks) {
  const content = read(check.file);
  for (const required of check.required) {
    if (!content.includes(required)) {
      console.error(`${check.file} must include ${required} for SEO/AEO/GEO coverage.`);
      process.exit(1);
    }
  }
}

console.log('SEO, AEO, and GEO structured coverage is present.');
