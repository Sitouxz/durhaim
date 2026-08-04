"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/site-settings";

export default function WhatsAppFAB() {
  const siteSettings = useSiteSettings();
  const waUrl = buildWhatsAppUrl(siteSettings, "Halo, saya ingin bertanya tentang produk Durhaim.");

  return (
    <a
      className="store-whatsapp"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi Durhaim di WhatsApp"
      data-visual-diff-mask="retained-whatsapp"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
