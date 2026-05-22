import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isMissingSchemaError } from '@/lib/catalogue-data';

export const dynamic = 'force-dynamic';

const allowedSettings = ['public_domain', 'whatsapp_contact', 'support_email', 'location'] as const;

type SettingKey = typeof allowedSettings[number];

function settingsFromRows(rows: { key: string; value: string }[]) {
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<SettingKey, string>;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [...allowedSettings])
      .order('key');

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({ error: 'Database schema is not installed. Apply supabase/schema.sql.' }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json(settingsFromRows(data ?? []));
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const updates = allowedSettings.map((key) => ({
      key,
      value: typeof body[key] === 'string' ? body[key].trim() : '',
      updated_at: new Date().toISOString(),
    }));

    if (updates.some((setting) => !setting.value)) {
      return NextResponse.json({ error: 'All settings are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert(updates, { onConflict: 'key' });

    if (error) throw error;

    return NextResponse.json(settingsFromRows(updates));
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
