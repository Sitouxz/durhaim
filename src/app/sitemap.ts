import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { fallbackProducts } from '@/lib/catalogue-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://durhaim.com';

const routes = [
  '',
  '/catalogue',
  '/verify',
  '/our-story',
  '/battle-proven',
  '/contact',
];

async function getPublishedProductRoutes() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return fallbackProducts.map((product) => `/catalogue/${product.slug}`);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .eq('is_published', true);

    if (error) {
      return fallbackProducts.map((product) => `/catalogue/${product.slug}`);
    }

    return (data ?? [])
      .map((product) => product.slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
      .map((slug) => `/catalogue/${slug}`);
  } catch {
    return fallbackProducts.map((product) => `/catalogue/${product.slug}`);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
