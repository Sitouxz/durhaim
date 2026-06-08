export const siteSettingKeys = [
  "public_domain",
  "whatsapp_contact",
  "support_email",
  "location",
] as const;

export type SiteSettingKey = (typeof siteSettingKeys)[number];
export type SiteSettings = Record<SiteSettingKey, string>;

export const defaultSiteSettings: SiteSettings = {
  public_domain: "durhaim.com",
  whatsapp_contact: "+62 821-2010-1473",
  support_email: "durhaimgear@gmail.com",
  location: "Mitra Dago Parahyangan Jl. Anyelir No. C8 Bandung",
};

type SettingsInput = Partial<Record<SiteSettingKey, string>>;

function isSiteSettingKey(key: string): key is SiteSettingKey {
  return siteSettingKeys.includes(key as SiteSettingKey);
}

function cleanPublicDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return defaultSiteSettings.public_domain;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).host;
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/[/?#].*$/, "")
      .replace(/^\/+|\/+$/g, "") || defaultSiteSettings.public_domain;
  }
}

function toPublicSiteUrl(value: string) {
  const domain = cleanPublicDomain(value);
  const withProtocol = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return `https://${defaultSiteSettings.public_domain}`;
  }
}

function canParsePublicDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    new URL(withProtocol);
    return true;
  } catch {
    return false;
  }
}

export function normalizeSiteSettings(input: SettingsInput = {}): SiteSettings {
  return siteSettingKeys.reduce<SiteSettings>((settings, key) => {
    const rawValue = typeof input[key] === "string" ? input[key].trim() : "";
    settings[key] = key === "public_domain"
      ? cleanPublicDomain(rawValue)
      : rawValue || defaultSiteSettings[key];
    return settings;
  }, { ...defaultSiteSettings });
}

export function siteSettingsFromRows(rows: { key: string; value: string }[] = []) {
  const settings = rows.reduce<SettingsInput>((current, row) => {
    if (isSiteSettingKey(row.key) && typeof row.value === "string") {
      current[row.key] = row.value;
    }
    return current;
  }, {});

  return normalizeSiteSettings(settings);
}

export function getSiteUrl(settings: SettingsInput = {}) {
  return toPublicSiteUrl(normalizeSiteSettings(settings).public_domain);
}

export function getWhatsAppNumber(settings: SettingsInput = {}) {
  const configured = normalizeSiteSettings(settings).whatsapp_contact;
  const digits = configured.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return normalized || defaultSiteSettings.whatsapp_contact.replace(/\D/g, "");
}

export function buildTelHref(settings: SettingsInput = {}) {
  return `tel:+${getWhatsAppNumber(settings)}`;
}

export function buildWhatsAppUrl(settings: SettingsInput = {}, message?: string) {
  const baseUrl = `https://wa.me/${getWhatsAppNumber(settings)}`;
  const trimmedMessage = message?.trim();
  return trimmedMessage ? `${baseUrl}?text=${encodeURIComponent(trimmedMessage)}` : baseUrl;
}

export function buildVerifyUrl(settings: SettingsInput = {}, serial: string) {
  return `${getSiteUrl(settings)}/verify/${encodeURIComponent(serial.trim())}`;
}

export function validateSiteSettings(settings: SettingsInput = {}) {
  const normalized = normalizeSiteSettings(settings);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!canParsePublicDomain(normalized.public_domain)) {
    return "Public domain must be a valid domain.";
  }

  if (getWhatsAppNumber(normalized).length < 8) {
    return "WhatsApp contact must include a valid phone number.";
  }

  if (!emailPattern.test(normalized.support_email)) {
    return "Support email must be a valid email address.";
  }

  return null;
}
