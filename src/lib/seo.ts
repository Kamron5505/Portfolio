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

export async function buildMetadata(locale: Locale): Promise<Metadata> {
  const { site, ui } = await getContent(locale);
  const url = localeUrl(locale, site.url);
  const others = (['en_US', 'uz_UZ', 'ru_RU'] as const).filter((l) => l !== ui.meta.ogLocale);

  // hreflang-карта на каждой странице — все варианты ссылаются друг на друга,
  // x-default ведёт на английский корень.
  const languages = {
    en: `${site.url}/`,
    uz: `${site.url}/uz`,
    ru: `${site.url}/ru`,
    'x-default': `${site.url}/`,
  };

  return {
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
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      // og:image подставляется автоматически из app/opengraph-image.tsx
      type: 'profile',
      url,
      siteName: site.name,
      title: ui.meta.title,
      description: ui.meta.description,
      firstName: site.firstName,
      lastName: site.lastName,
      locale: ui.meta.ogLocale,
      alternateLocale: [...others],
    },
    twitter: {
      card: 'summary_large_image',
      title: ui.meta.title,
      description: ui.meta.description,
    },
    // TODO: вставьте свои коды подтверждения, когда добавите сайт в
    // Google Search Console и Яндекс.Вебмастер.
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
    icons: {
      icon: [
        // .ico как запасной вариант для старых краулеров и фавиконов Яндекса.
        { url: '/favicon.ico', sizes: '32x32' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
    },
    manifest: '/manifest.webmanifest',
  };
}
