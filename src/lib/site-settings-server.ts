import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { isMissingSchemaError } from "@/lib/catalogue-data";
import {
  defaultSiteSettings,
  siteSettingKeys,
  siteSettingsFromRows,
  type SiteSettings,
} from "@/lib/site-settings";

// Invalidated explicitly by PATCH /api/admin/settings so admin edits appear immediately
// rather than waiting out the revalidate window.
export const SITE_SETTINGS_CACHE_TAG = "site-settings";

// This previously called noStore(). Because the root layout reads site settings, that opted
// *every page on the site* out of caching — nothing was cacheable anywhere, and each request
// hit the database for four rows that change a few times a year. Caching here is what makes
// static and incremental rendering possible for the content pages.
const loadSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [...siteSettingKeys]);

      if (error) {
        if (isMissingSchemaError(error)) return defaultSiteSettings;
        throw error;
      }

      return siteSettingsFromRows(data ?? []);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Falling back to default site settings:", error);
      }
      return defaultSiteSettings;
    }
  },
  ["site-settings"],
  { revalidate: 300, tags: [SITE_SETTINGS_CACHE_TAG] },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  return loadSiteSettings();
}
