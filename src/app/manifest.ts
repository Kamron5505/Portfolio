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
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'en',
    dir: 'ltr',
    background_color: '#08080C',
    theme_color: '#08080C',
    categories: ['portfolio', 'business', 'productivity'],
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
      // Chrome требует PNG 192/512 для установки.
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      // maskable-версии: Android обрезает иконку под форму системы, и без них
      // логотип получает белую подложку вместо фирменного фона.
      { src: '/icon-192-maskable.png', type: 'image/png', sizes: '192x192', purpose: 'maskable' },
      { src: '/icon-512-maskable.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: ui.projects.title, url: '/#projects' },
      { name: ui.contact.title, url: '/#contact' },
    ],
  };
}
