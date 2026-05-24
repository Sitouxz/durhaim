import type { Language } from '@/lib/commerce';

const categoryTranslations: Record<string, string> = {
  vest: 'Vest & Chestrig',
  pack: 'Pack & Pouch',
  belt: 'Belt',
  accessories: 'Aksesori',
  uncategorized: 'Tanpa Kategori',
};

const tagTranslations: Record<string, string> = {
  'BATTLE PROVEN': 'TERUJI LAPANGAN',
  'NEW ARRIVAL': 'BARU',
  'LIMITED STOCK': 'STOK TERBATAS',
};

const descriptionTranslations: Record<string, string> = {
  'MODULAR TACTICAL CARRIER / QUICK RELEASE SYSTEM / LASER CUT MOLLE':
    'CARRIER TAKTIS MODULAR / SISTEM QUICK RELEASE / MOLLE LASER CUT',
  'HEAVY DUTY PLATE CARRIER / TRIPLE MAG POUCH INCLUDED / ADJUSTABLE HARNESS':
    'PLATE CARRIER HEAVY DUTY / TERMASUK TRIPLE MAG POUCH / HARNESS DAPAT DIATUR',
  '30L CAPACITY / HYDRATION COMPATIBLE / MULTICAM BLACK CORDURA':
    'KAPASITAS 30L / KOMPATIBEL HYDRATION / CORDURA MULTICAM BLACK',
  'RIGGER BELT / QUICK RELEASE BUCKLE / INTEGRATED POUCH SYSTEM':
    'RIGGER BELT / BUCKLE QUICK RELEASE / SISTEM POUCH TERINTEGRASI',
  'TACTICAL WAIST BELT / MULTICAM BLACK / COBRA STYLE BUCKLE / MAG POUCHES':
    'TACTICAL WAIST BELT / MULTICAM BLACK / BUCKLE GAYA COBRA / MAG POUCH',
};

export function localizeCategoryName(slug: string | undefined, fallback: string, language: Language) {
  if (language !== 'id') return fallback;
  return slug ? categoryTranslations[slug] ?? fallback : fallback;
}

export function localizeProductTag(tag: string, language: Language) {
  if (language !== 'id') return tag;
  return tagTranslations[tag.toUpperCase()] ?? tag;
}

export function localizeProductDescription(description: string, language: Language) {
  if (language !== 'id') return description;
  return descriptionTranslations[description.toUpperCase()] ?? description;
}
