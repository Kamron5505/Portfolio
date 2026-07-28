// Одноразовая миграция домена: приводит site_settings.data->>'url' к
// каноническому виду. Нужна там, где в базе остался адрес preview-деплоя,
// сохранённый до переезда на собственный домен.
//
// Публичный сайт и без неё отдаёт правильные ссылки — content.ts нормализует
// значение на чтении, — но держать в базе мёртвый домен незачем: он всплывает
// в форме админки и в бэкапах.
//
// Запуск: npm run db:fix-url
import { closeDb, db, isDbConfigured } from '../src/lib/db';
import { normalizeSiteUrl, SITE } from '../src/lib/data';
import type { SiteInfo } from '../src/lib/content';

async function main() {
  if (!isDbConfigured()) {
    console.log('База не настроена (нет DATABASE_URL и LOCAL_DB=1) — править нечего.');
    return;
  }

  const sql = db();
  const rows = (await sql`select data from site_settings where id = 1`) as Record<string, unknown>[];
  const current = rows[0]?.data as SiteInfo | undefined;

  if (!current) {
    console.log('Записи site_settings нет — сайт использует значения из data.ts.');
    return;
  }

  const normalized = normalizeSiteUrl(current.url) ?? SITE.url;
  if (normalized === current.url) {
    console.log(`Домен в базе уже канонический: ${current.url}`);
    return;
  }

  const next = { ...current, url: normalized };
  await sql`update site_settings set data = ${JSON.stringify(next)}::jsonb where id = 1`;
  console.log(`Домен обновлён: ${current.url} → ${normalized}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
