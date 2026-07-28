import type { SiteInfo, SocialItem, UiText } from './content';
import { localeUrl, LOCALES, type Locale } from './i18n';

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD сайта. Все URL строятся от site.url (уже нормализованного в
// content.ts), поэтому canonical, hreflang и структурированные данные всегда
// указывают на один и тот же домен.
//
// Схемы связаны через @id: Person ← WebSite.publisher, ProfilePage.mainEntity,
// BreadcrumbList.itemListElement. Так Google видит один граф, а не три
// независимых объекта.
// ─────────────────────────────────────────────────────────────────────────────

/** Абсолютный URL из пути в public/ или готовой внешней ссылки. */
const absolute = (site: SiteInfo, src: string) =>
  /^https?:\/\//i.test(src) ? src : `${site.url}${src.startsWith('/') ? '' : '/'}${src}`;

// Каноническая сущность Person для Google. Сайт — авторитетный «дом» этой
// сущности: sameAs связывает все профили воедино. Сама сущность не зависит от
// языка, поэтому одинакова на всех локалях.
function personSchema(site: SiteInfo, socials: SocialItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: site.name,
    // Кириллическое написание — чтобы Яндекс и кириллический поиск сводили
    // запросы к той же сущности.
    alternateName: ['Камрон Фазилов', site.name],
    givenName: site.firstName,
    familyName: site.lastName,
    url: site.url,
    mainEntityOfPage: { '@id': `${site.url}/#website` },
    image: site.avatar
      ? {
          '@type': 'ImageObject',
          url: absolute(site, site.avatar),
          caption: `${site.name} — ${site.role}`,
        }
      : undefined,
    jobTitle: [site.role, 'Web Developer'],
    description: `${site.name} — ${site.role} based in ${site.location}. ${site.tagline}`,
    email: `mailto:${site.email}`,
    knowsAbout: [
      'Frontend Development',
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Responsive Web Design',
      'Web Performance',
      'Core Web Vitals',
      'SEO',
      'Tailwind CSS',
      'Node.js',
      'PostgreSQL',
      'REST API',
    ],
    knowsLanguage: ['uz', 'ru', 'en'],
    nationality: { '@type': 'Country', name: 'Uzbekistan' },
    homeLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
    },
    workLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'Tashkent', addressCountry: 'UZ' },
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: site.role,
      occupationLocation: { '@type': 'City', name: 'Tashkent' },
      skills: 'React, Next.js, TypeScript, responsive layout, web performance, SEO',
    },
    // Резюме, привязанное к сущности, — поисковики индексируют PDF под именем.
    // site.cv пуст, пока файла нет в public/, поэтому битой ссылки не будет.
    subjectOf: site.cv
      ? {
          '@type': 'CreativeWork',
          name: `${site.name} — CV / Resume`,
          url: absolute(site, site.cv),
          encodingFormat: 'application/pdf',
        }
      : undefined,
    sameAs: socials.map((s) => s.url),
  };
}

function websiteSchema(site: SiteInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: `${site.name} — Portfolio`,
    description: `${site.name} — ${site.role} and ${site.subRole} based in ${site.location}.`,
    inLanguage: [...LOCALES],
    publisher: { '@id': `${site.url}/#person` },
    author: { '@id': `${site.url}/#person` },
    copyrightHolder: { '@id': `${site.url}/#person` },
    // SearchAction здесь намеренно нет: поиска по сайту не существует, а
    // разметка, ведущая на несуществующий обработчик, — невалидные данные.
  };
}

// Рекомендованная Google разметка для персональных страниц — по одной на локаль,
// каждая со своим языком, но все указывают на одну и ту же сущность Person.
function profilePageSchema(site: SiteInfo, ui: UiText, locale: Locale) {
  const url = localeUrl(locale, site.url);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profilepage`,
    url,
    name: ui.meta.title,
    description: ui.meta.description,
    inLanguage: locale,
    isPartOf: { '@id': `${site.url}/#website` },
    about: { '@id': `${site.url}/#person` },
    mainEntity: { '@id': `${site.url}/#person` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    primaryImageOfPage: site.avatar ? { '@type': 'ImageObject', url: absolute(site, site.avatar) } : undefined,
    dateCreated: site.createdAt,
    dateModified: site.updatedAt,
  };
}

// Хлебные крошки. Сайт одностраничный, поэтому цепочка короткая: на английском
// это одна «Home», на остальных языках — Home → язык. Этого достаточно, чтобы
// Google показал путь в выдаче вместо голого URL.
function breadcrumbSchema(site: SiteInfo, ui: UiText, locale: Locale) {
  const items = [{ name: 'Home', item: site.url }];
  if (locale !== 'en') {
    items.push({ name: ui.meta.title, item: localeUrl(locale, site.url) });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${localeUrl(locale, site.url)}#breadcrumb`,
    itemListElement: items.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildSchemas(site: SiteInfo, ui: UiText, socials: SocialItem[], locale: Locale) {
  return [
    personSchema(site, socials),
    websiteSchema(site),
    profilePageSchema(site, ui, locale),
    breadcrumbSchema(site, ui, locale),
  ];
}
