import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';

// Манифест PWA — делает сайт устанавливаемым и даёт краулерам каноническое
// имя и тему. Next отдаёт его по /manifest.webmanifest и сам линкует в <head>.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { site, ui } = await getContent('en');

  return {
    id: '/',
    name: `${site.name} — ${site.role}`,
    short_name: site.firstName,
    description: site.tagline,
    // start_url и scope — от корня: у сайта одна установка на все языки,
    // локали живут внутри той же области видимости (/uz, /ru).
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'en',
    dir: 'ltr',
    // Совпадает с viewport.themeColor в layout — иначе Chrome берёт разные
    // цвета для строки состояния и сплеш-скрина.
    background_color: '#08080C',
    theme_color: '#08080C',
    categories: ['portfolio', 'business', 'productivity'],
    icons: [
      // Векторная иконка — для витрин, которые её понимают.
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      // Chrome требует PNG 192 и 512 для установки приложения.
      { src: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      // maskable-версии: Android обрезает иконку под форму системы, и без них
      // логотип получает белую подложку вместо фирменного фона.
      { src: '/icon-192-maskable.png', type: 'image/png', sizes: '192x192', purpose: 'maskable' },
      { src: '/icon-512-maskable.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
      // Apple touch icon: iOS манифест не читает, но держим набор в одном месте.
      { src: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' },
    ],
    shortcuts: [
      { name: ui.projects.title, url: '/#projects' },
      { name: ui.contact.title, url: '/#contact' },
    ],
  };
}
