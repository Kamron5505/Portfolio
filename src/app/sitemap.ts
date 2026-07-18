import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site } = await getContent('en');

  // hreflang-альтернативы для всех языковых версий главной.
  const languages = {
    en: `${site.url}/`,
    uz: `${site.url}/uz`,
    ru: `${site.url}/ru`,
  };

  const pages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1, alternates: { languages } },
    { url: `${site.url}/uz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9, alternates: { languages } },
    { url: `${site.url}/ru`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9, alternates: { languages } },
  ];

  // PDF резюме — индексируемый контент: Google показывает PDF по имени.
  if (site.cv) {
    pages.push({
      url: site.cv.startsWith('http') ? site.cv : `${site.url}${site.cv}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return pages;
}
