import type { Metadata } from 'next';

// Страница-заглушка для офлайна: service worker отдаёт её, когда сети нет,
// а нужной страницы ещё нет в кеше. Лежит внутри группы (en), поэтому получает
// общую оболочку документа и стили.
export const metadata: Metadata = {
  title: 'Нет соединения',
  robots: { index: false, follow: false },
  // Без явного значения страница унаследовала бы canonical и hreflang главной
  // из layout — noindex вместе с canonical на другой URL даёт роботу
  // противоречивые сигналы. Здесь canonical указывает сам на себя,
  // языковых альтернатив у служебной страницы нет.
  alternates: { canonical: '/offline', languages: {} },
};

export default function OfflinePage() {
  return (
    // lang="ru": страница лежит в англоязычной группе маршрутов, но текст на
    // русском — без явного языка скринридер прочитает его с английской фонетикой.
    <main lang="ru" className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="font-mono text-sm text-accent">~/offline</p>
        <h1 className="mt-3 display-type text-3xl font-bold text-ink">Нет соединения</h1>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
          Похоже, интернет пропал. Уже открытые страницы доступны из кеша — вернитесь назад или
          попробуйте обновить, когда сеть появится.
        </p>
      </div>
    </main>
  );
}
