import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, renderOgImage } from '@/lib/og';

// Соцкартинка 1200×630 для английского корня. Next сам подставляет её в
// og:image и twitter:image и кеширует на CDN — бинарный файл не нужен.
// Разметка живёт в lib/og.tsx: её же использует версия для /uz и /ru.
export const alt = ogAlt('en');
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OGImage() {
  return renderOgImage('en');
}
