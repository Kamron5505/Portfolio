import type { Metadata } from 'next';
import { getContent } from './content';
import { localeUrl, type Locale } from './i18n';

const KEYWORDS = [
  'Kamron Fazilov',
  'Kamron Fazilov portfolio',
  'Kamron Fazilov CV',
  'Frontend developer Tashkent',
  'React developer Tashkent',
  'Next.js developer Uzbekistan',
  'Web developer Uzbekistan',
  'Landing page development Tashkent',
  'Online store development Tashkent',
  'Камрон Фазилов',
  'Камрон Фазилов фронтенд разработчик',
  'фронтенд разработчик Ташкент',
  'разработка сайтов Ташкент',
  'Kamron Fazilov dasturchi',
  'frontend dasturchi Toshkent',
];

// Код подтверждения прав в Google Search Console. Отдаётся как
// <meta name="google-site-verification"> на каждой странице.
const GOOGLE_SITE_VERIFICATION = 'b1Zbgy0Uf1jT1gQC5HyVEb9GddWgEW5CW5jxqzzxQMQ';

export async function buildMetadata(locale: Locale): Promise<Metadata> {
  const { site, ui } = await getContent(locale);
  const url = localeUrl(locale, site.url);
  const others = (['en_US', 'uz_UZ', 'ru_RU'] as const).filter((l) => l !== ui.meta.ogLocale);

  // hreflang-карта на каждой странице — все варианты ссылаются друг на друга,
  // x-default ведёт на английский корень.
  const languages = {
    en: site.url,
    uz: `${site.url}/uz`,
    ru: `${site.url}/ru`,
    'x-default': site.url,
  };

  return {
    // Базовый URL для всех относительных ссылок в метаданных: og:image,
    // twitter:image и canonical Next.js разворачивает в абсолютные именно от него.
    metadataBase: new URL(site.url),
    title: {
      default: ui.meta.title,
      template: `%s | ${site.name}`,
    },
    description: ui.meta.description,
    applicationName: `${site.name} — Portfolio`,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    publisher: site.name,
    keywords: KEYWORDS,
    category: 'technology',
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      // og:image подставляется автоматически из app/opengraph-image.tsx и
      // разворачивается в абсолютный URL относительно metadataBase.
      type: 'profile',
      url,
      siteName: site.name,
      title: ui.meta.title,
      description: ui.meta.description,
      firstName: site.firstName,
      lastName: site.lastName,
      username: site.name,
      locale: ui.meta.ogLocale,
      alternateLocale: [...others],
    },
    twitter: {
      // twitter:image Next.js подставляет из opengraph-image — абсолютный URL
      // разворачивается от metadataBase.
      card: 'summary_large_image',
      title: ui.meta.title,
      description: ui.meta.description,
    },
    // twitter:url в Metadata API отдельного поля не имеет: Twitter/X читает
    // og:url. Дублируем явно, чтобы карточка не зависела от фолбэка.
    other: { 'twitter:url': url },
    verification: {
      google: GOOGLE_SITE_VERIFICATION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    // Телефонов и адресов на странице нет — автолинковка Safari только ломает
    // вёрстку, отключаем.
    formatDetection: { telephone: false, address: false, email: false },
    icons: {
      icon: [
        // .ico как запасной вариант для старых краулеров и фавиконов Яндекса.
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      ],
      apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
      shortcut: ['/favicon.ico'],
    },
    manifest: '/manifest.webmanifest',
  };
}
