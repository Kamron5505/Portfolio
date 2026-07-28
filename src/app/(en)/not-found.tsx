import type { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';

// Статус 404 Next выставляет сам и сам же добавляет <meta name="robots"
// content="noindex"> — дублировать директиву в metadata не нужно.
export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist or has been moved.',
  // Гасим унаследованные из layout canonical и hreflang: 404 не должен
  // объявлять себя копией главной.
  alternates: { canonical: null, languages: {} },
};

export default function NotFound() {
  return <NotFoundView />;
}
