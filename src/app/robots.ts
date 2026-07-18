import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getContent('en');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Админку и её API индексировать незачем.
      disallow: ['/admin', '/api/'],
    },
    sitemap: [`${site.url}/sitemap.xml`],
    host: site.url,
  };
}
