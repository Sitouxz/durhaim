export type Language = 'en' | 'id';
export type RegionCode = 'ID' | 'GLOBAL';

export type RegionalPrices = Partial<Record<RegionCode, number>>;

export const regionConfigs: Record<RegionCode, { label: string; currency: string; locale: string; multiplier: number }> = {
  ID: { label: 'Indonesia', currency: 'IDR', locale: 'id-ID', multiplier: 1 },
  GLOBAL: { label: 'Global', currency: 'USD', locale: 'en-US', multiplier: 0.000075 },
};

export const supportedRegions: RegionCode[] = ['ID', 'GLOBAL'];

export function normalizeLanguage(value?: string | null): Language {
  return value?.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function countryToRegion(country?: string | null): RegionCode {
  const normalized = country?.trim().toUpperCase();
  if (!normalized) return 'GLOBAL';
  if (normalized === 'ID') return 'ID';
  return 'GLOBAL';
}

type HeaderReader = {
  get(name: string): string | null;
};

export function detectRegionFromHeaders(headersList: HeaderReader): RegionCode {
  return countryToRegion(
    headersList.get('x-vercel-ip-country')
      ?? headersList.get('cf-ipcountry')
      ?? headersList.get('x-country-code'),
  );
}

export function detectLanguageFromHeaders(headersList: HeaderReader): Language {
  return normalizeLanguage(headersList.get('accept-language'));
}

export function detectRegionFromBrowser(): RegionCode {
  const locale = navigator.language || navigator.languages?.[0] || '';
  const localeCountry = locale.split('-')[1];
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timezone === 'Asia/Jakarta' || timezone === 'Asia/Makassar' || timezone === 'Asia/Jayapura') return 'ID';

  return countryToRegion(localeCountry);
}

export function getRegionalPrice(basePrice: number, regionalPrices: RegionalPrices | undefined, region: RegionCode) {
  const explicitPrice = regionalPrices?.[region] ?? regionalPrices?.GLOBAL;
  if (typeof explicitPrice === 'number' && Number.isFinite(explicitPrice) && explicitPrice > 0) {
    return explicitPrice;
  }

  const config = regionConfigs[region] ?? regionConfigs.GLOBAL;
  return Math.round(basePrice * config.multiplier);
}

export function formatRegionalPrice(basePrice: number, regionalPrices: RegionalPrices | undefined, region: RegionCode) {
  const config = regionConfigs[region] ?? regionConfigs.GLOBAL;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: config.currency === 'IDR' ? 0 : 2,
  }).format(getRegionalPrice(basePrice, regionalPrices, region));
}

export function defaultRegionalPrices(basePrice: number): RegionalPrices {
  return supportedRegions.reduce<RegionalPrices>((prices, region) => {
    prices[region] = getRegionalPrice(basePrice, undefined, region);
    return prices;
  }, {});
}
