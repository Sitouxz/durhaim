import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import { isMissingSchemaError } from "@/lib/catalogue-data";
import {
  defaultSiteSettings,
  siteSettingKeys,
  siteSettingsFromRows,
  type SiteSettings,
} from "@/lib/site-settings";

export async function getSiteSettings(): Promise<SiteSettings> {
  noStore();

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
}
