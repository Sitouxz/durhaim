import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { fallbackProducts } from '@/lib/catalogue-data';
import { getCatalogueTombstoneSlugs } from '@/lib/catalogue-tombstones';
import { createAdminClient } from '@/lib/supabase';
import { getSiteSettings } from '@/lib/site-settings-server';
import { getSiteUrl } from '@/lib/site-settings';

const routes = [
  '',
  '/catalogue',
  '/verify',
  '/our-story',
  '/battle-proven',
  '/contact',
];

async function getPublishedProductRoutes() {
  let tombstonedSlugs = new Set<string>();
  try {
    tombstonedSlugs = await getCatalogueTombstoneSlugs(createAdminClient());
    const fallbackRoutes = fallbackProducts
      .filter((product) => !tombstonedSlugs.has(product.slug))
      .map((product) => `/catalogue/${product.slug}`);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return fallbackRoutes;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .eq('is_published', true);

    if (error) {
      return fallbackRoutes;
    }

    return (data ?? [])
      .map((product) => product.slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
      .filter((slug) => !tombstonedSlugs.has(slug))
      .map((slug) => `/catalogue/${slug}`);
  } catch {
    return fallbackProducts
      .filter((product) => !tombstonedSlugs.has(product.slug))
      .map((product) => `/catalogue/${product.slug}`);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteSettings = await getSiteSettings();
  const siteUrl = getSiteUrl(siteSettings);
  const lastModified = new Date();
  const productRoutes = await getPublishedProductRoutes();

  return [...routes, ...productRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '' || route === '/catalogue' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/catalogue/') ? 0.8 : 0.7,
    alternates: {
      languages: {
        en: `${siteUrl}${route}`,
        id: `${siteUrl}${route}?lang=id`,
      },
    },
  }));
}
