import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

// Публичных страниц у сайта ровно три — по одной на язык. Всё остальное
// (/admin, /api, /offline) в карту не попадает намеренно: это либо закрытые,
// либо служебные маршруты.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site } = await getContent('en');

  // Дата берётся из профиля, а не Date.now(): «дата изменения», которая
  // обновляется на каждый обход, обесценивает поле для краулера.
  const lastModified = new Date(site.updatedAt || Date.now());

  // hreflang-альтернативы для всех языковых версий главной. x-default ведёт
  // на английский корень — тот же набор, что и в метаданных страниц.
  // Адреса без хвостового слэша — та же форма, что в canonical и hreflang на
  // самих страницах (см. i18n.localeUrl). Разнобой создал бы для робота два
  // варианта одного URL.
  const languages = {
    en: site.url,
    uz: `${site.url}/uz`,
    ru: `${site.url}/ru`,
    'x-default': site.url,
  };

  const pages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified, changeFrequency: 'monthly', priority: 1, alternates: { languages } },
    { url: `${site.url}/uz`, lastModified, changeFrequency: 'monthly', priority: 0.9, alternates: { languages } },
    { url: `${site.url}/ru`, lastModified, changeFrequency: 'monthly', priority: 0.9, alternates: { languages } },
  ];

  // PDF резюме — индексируемый контент: Google показывает PDF по имени.
  // site.cv уже проверен в content.ts: если файла нет, поле пустое и записи
  // в карте не будет, чтобы не отправлять робота на 404.
  if (site.cv) {
    pages.push({
      url: site.cv.startsWith('http') ? site.cv : `${site.url}${site.cv}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.6,
    });
  }

  return pages;
}
