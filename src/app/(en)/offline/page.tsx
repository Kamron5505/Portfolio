import type { Metadata } from 'next';

// Страница-заглушка для офлайна: service worker отдаёт её, когда сети нет,
// а нужной страницы ещё нет в кеше. Лежит внутри группы (en), поэтому получает
// общую оболочку документа и стили.
export const metadata: Metadata = {
  title: 'Нет соединения',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="font-mono text-sm text-accent">~/offline</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Нет соединения</h1>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
          Похоже, интернет пропал. Уже открытые страницы доступны из кеша — вернитесь назад или
          попробуйте обновить, когда сеть появится.
        </p>
      </div>
    </main>
  );
}
