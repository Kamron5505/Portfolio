import type { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';
import { SITE } from '@/lib/data';

// 404 для адресов, не попавших ни в одну ветку маршрутов.
//
// metadataBase обязателен: у этого маршрута нет родительского layout, а без
// базового URL Next разворачивает og:image в http://localhost:3000 — на живой
// 404 это была бы битая соцкартинка.
//
// Статус 404 и <meta name="robots" content="noindex"> Next выставляет сам.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `Page not found | ${SITE.name}`,
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function GlobalNotFound() {
  return <NotFoundView />;
}
