import type { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';

// 404 внутри языковой ветки: /uz/что-угодно, /ru/что-угодно и неизвестные
// локали (dynamicParams = false в layout).
// noindex Next добавляет к not-found сам — второй такой же мета-тег был бы
// дублем.
export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist or has been moved.',
  // Гасим унаследованные из layout canonical и hreflang: 404 не должен
  // объявлять себя копией языковой главной.
  alternates: { canonical: null, languages: {} },
};

export default function LocaleNotFound() {
  return <NotFoundView />;
}
