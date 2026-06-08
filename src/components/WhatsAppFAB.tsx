"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { buildWhatsAppUrl } from "@/lib/site-settings";

export default function WhatsAppFAB() {
  const siteSettings = useSiteSettings();
  const waMessage = 'Halo, saya ingin bertanya tentang produk Durhaim.';
  const waUrl = buildWhatsAppUrl(siteSettings, waMessage);

  return (
    <a
      className="fixed bottom-margin-edge right-margin-edge w-14 h-14 bg-operator-green border-2 border-stark-white rounded-full flex items-center justify-center shadow-lg hover:bg-signal-orange hover:border-tactical-black transition-all duration-300 z-50 group"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="material-symbols-outlined text-stark-white group-hover:text-tactical-black">chat</span>
    </a>
  );
}
