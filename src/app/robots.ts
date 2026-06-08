import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/site-settings-server';
import { getSiteUrl } from '@/lib/site-settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteSettings = await getSiteSettings();
  const siteUrl = getSiteUrl(siteSettings);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Bingbot'],
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
