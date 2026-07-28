import { existsSync } from 'node:fs';
import path from 'node:path';

// ─────────────────────────────────────────────────────────────────────────────
// Проверка того, что локальный файл действительно лежит в public/.
//
// Нужна, чтобы сайт никогда не отдавал ссылку на 404: и кнопка «Скачать CV»,
// и запись в sitemap, и JSON-LD строятся от одного и того же значения, поэтому
// проверять его надо один раз — в слое контента.
//
// Модуль серверный (node:fs) и импортируется только из server components.
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Результат в пределах процесса не меняется: содержимое public/ фиксируется
// сборкой. Кешируем, чтобы не ходить в ФС на каждый рендер.
const cache = new Map<string, boolean>();

/**
 * true — если это внешняя ссылка (http/https) или файл, реально существующий
 * в public/. false — если путь пустой или файла нет.
 */
export function assetExists(src: string | null | undefined): boolean {
  if (!src) return false;
  if (/^https?:\/\//i.test(src)) return true;
  // Пути не из public/ (загрузки в Vercel Blob, data-URL) не проверяем.
  if (!src.startsWith('/')) return false;

  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  // Отрезаем query/hash и запрещаем выход за пределы public/.
  const clean = src.split(/[?#]/)[0];
  const absolute = path.join(PUBLIC_DIR, path.normalize(clean));
  const exists = absolute.startsWith(PUBLIC_DIR) && existsSync(absolute);

  cache.set(src, exists);
  return exists;
}
