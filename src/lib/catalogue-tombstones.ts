import type { SupabaseClient } from '@supabase/supabase-js';

const CATALOGUE_TOMBSTONE_PREFIX = 'catalogue_deleted_product:';

export function catalogueTombstoneKey(slug: string) {
  return `${CATALOGUE_TOMBSTONE_PREFIX}${slug}`;
}

export function catalogueTombstoneSlug(key: string) {
  return key.startsWith(CATALOGUE_TOMBSTONE_PREFIX)
    ? key.slice(CATALOGUE_TOMBSTONE_PREFIX.length)
    : null;
}

export async function getCatalogueTombstoneSlugs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key')
    .like('key', `${CATALOGUE_TOMBSTONE_PREFIX}%`);

  if (error) throw error;

  return new Set((data ?? [])
    .map((row) => catalogueTombstoneSlug(String(row.key)))
    .filter((slug): slug is string => Boolean(slug)));
}

export async function tombstoneCatalogueProduct(supabase: SupabaseClient, slug: string) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({
      key: catalogueTombstoneKey(slug),
      value: 'deleted',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  if (error) throw error;
}

export async function restoreCatalogueProduct(supabase: SupabaseClient, slug: string) {
  const { error } = await supabase
    .from('site_settings')
    .delete()
    .eq('key', catalogueTombstoneKey(slug));

  if (error) throw error;
}
