import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getContent('en');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /offline здесь намеренно нет: страница закрыта мета-тегом noindex, а
        // чтобы робот его увидел, страницу нужно разрешить обходить.
        // JS и CSS (/_next/static) тоже открыты — без них Google не отрисует
        // страницу и посчитает её пустой.
        disallow: [
          // Админка и её API — не публичный контент.
          '/admin',
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: [`${site.url}/sitemap.xml`],
    // Подсказка Яндексу о главном зеркале сайта.
    host: site.url,
  };
}
