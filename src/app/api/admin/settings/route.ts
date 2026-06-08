import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';
import { requireAdminRole } from '@/lib/admin-permissions';
import {
  normalizeSiteSettings,
  siteSettingKeys,
  siteSettingsFromRows,
  validateSiteSettings,
} from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN', 'STAFF']);
    if (authorization.error) return authorization.error;

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [...siteSettingKeys])
      .order('key');

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({ error: 'Database schema is not installed. Apply supabase/schema.sql.' }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json(siteSettingsFromRows(data ?? []));
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const nextSettings = normalizeSiteSettings(body);
    const validationError = validateSiteSettings(nextSettings);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updates = siteSettingKeys.map((key) => ({
      key,
      value: nextSettings[key],
      updated_at: new Date().toISOString(),
    }));

    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ['OWNER', 'ADMIN']);
    if (authorization.error) return authorization.error;

    const { error } = await supabase
      .from('site_settings')
      .upsert(updates, { onConflict: 'key' });

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({ error: 'Database schema is not installed. Apply supabase/schema.sql.' }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json(siteSettingsFromRows(updates));
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
