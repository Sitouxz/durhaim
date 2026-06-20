const fs = require('fs');
const path = require('path');

const root = process.cwd();
const footer = fs.readFileSync(path.join(root, 'src/components/Footer.tsx'), 'utf8');
const fab = fs.readFileSync(path.join(root, 'src/components/WhatsAppFAB.tsx'), 'utf8');

for (const [name, source] of [['Footer', footer], ['WhatsAppFAB', fab]]) {
  if (!source.includes('WhatsAppIcon')) {
    throw new Error(`${name} must render WhatsAppIcon.`);
  }
}

if (!footer.includes('href={buildWhatsAppUrl(siteSettings)}')) {
  throw new Error('Footer contact number must open WhatsApp.');
}

console.log('WhatsApp icon usage is configured.');
