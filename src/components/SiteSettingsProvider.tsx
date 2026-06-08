"use client";

import { createContext, useContext, useMemo } from "react";
import {
  defaultSiteSettings,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

const SiteSettingsContext = createContext<SiteSettings>(defaultSiteSettings);

type SiteSettingsProviderProps = {
  children: React.ReactNode;
  initialSettings: SiteSettings;
};

export function SiteSettingsProvider({
  children,
  initialSettings,
}: SiteSettingsProviderProps) {
  const settings = useMemo(
    () => normalizeSiteSettings(initialSettings),
    [initialSettings],
  );

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
