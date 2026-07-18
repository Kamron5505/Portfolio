import { getHighlights } from '@/lib/admin-data';
import { isBlobStorageEnabled } from '@/lib/storage';
import HighlightsManager from './HighlightsManager';

export const dynamic = 'force-dynamic';

export default async function HighlightsPage() {
  const highlights = await getHighlights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Хайлайты</h1>
        <p className="mt-2 text-muted">
          Фото и короткие видео на главной. Секция появляется на сайте, только когда в ней есть хотя бы
          один элемент. Пустая — не показывается.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface/60 p-4 text-sm leading-relaxed text-muted">
        <p>
          Небольшие файлы (фото и короткие клипы) загружайте прямо здесь. Для{' '}
          <span className="text-ink">тяжёлых видео</span> надёжнее вставить прямую ссылку на файл: загрузка
          через форму ограничена{' '}
          {isBlobStorageEnabled() ? '~4.5 МБ на платформе Vercel' : 'размером запроса'}, и большой ролик может
          не пройти.
        </p>
      </div>

      <HighlightsManager highlights={highlights} />
    </div>
  );
}
