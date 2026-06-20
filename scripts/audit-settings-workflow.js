const assert = require('assert/strict');
const { readFileSync } = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');

const root = process.cwd();
const settingsModulePath = path.join(root, 'src', 'lib', 'site-settings.ts');
const source = readFileSync(settingsModulePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
const moduleContext = { exports: {} };

vm.runInNewContext(
  compiled.outputText,
  {
    module: moduleContext,
    exports: moduleContext.exports,
    require,
    URL,
  },
  { filename: settingsModulePath },
);

const settings = moduleContext.exports;
const toPlain = (value) => JSON.parse(JSON.stringify(value));
const customSettings = settings.normalizeSiteSettings({
  public_domain: ' gear.durhaim.test/ ',
  whatsapp_contact: ' 0821-2010-1473 ',
  support_email: ' support@example.test ',
  location: ' Test Workshop ',
});

assert.deepEqual(toPlain(customSettings), {
  public_domain: 'gear.durhaim.test',
  whatsapp_contact: '0821-2010-1473',
  support_email: 'support@example.test',
  location: 'Test Workshop',
});

assert.equal(settings.getSiteUrl(customSettings), 'https://gear.durhaim.test');
assert.equal(settings.getWhatsAppNumber(customSettings), '6282120101473');
assert.equal(settings.buildTelHref(customSettings), 'tel:+6282120101473');
assert.equal(
  settings.buildWhatsAppUrl(customSettings, 'Halo Durhaim'),
  'https://wa.me/6282120101473?text=Halo%20Durhaim',
);
assert.equal(
  settings.buildVerifyUrl(customSettings, 'DRH TEST/001'),
  'https://gear.durhaim.test/verify/DRH%20TEST%2F001',
);

assert.deepEqual(
  toPlain(settings.siteSettingsFromRows([
    { key: 'public_domain', value: 'example.com' },
    { key: 'unknown', value: 'ignored' },
  ])),
  {
    ...settings.defaultSiteSettings,
    public_domain: 'example.com',
  },
);

const consumers = [
  'src/components/Footer.tsx',
  'src/components/WhatsAppFAB.tsx',
  'src/components/ProductDetailClient.tsx',
  'src/app/contact/page.tsx',
  'src/app/qr-guide/page.tsx',
  'src/app/verify/[serial]/page.tsx',
  'src/app/admin/serials/page.tsx',
];

for (const relativePath of consumers) {
  const text = readFileSync(path.join(root, relativePath), 'utf8');
  assert.ok(!text.includes('6282120101473'), `${relativePath} must not hardcode the WhatsApp number`);
  assert.ok(!text.includes('durhaimgear@gmail.com'), `${relativePath} must not hardcode the support email`);
}

const serialsPage = readFileSync(path.join(root, 'src', 'app', 'admin', 'serials', 'page.tsx'), 'utf8');
assert.ok(
  serialsPage.includes('buildVerifyUrl(siteSettings'),
  'serial QR exports must use the configured public domain',
);

console.log('Settings drive public contact links, support details, and QR verification URLs.');
