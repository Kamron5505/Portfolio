import type { SiteInfo, SocialItem, UiText } from './content';
import { localeUrl, LOCALES, type Locale } from './i18n';

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
    image: site.avatar ? `${site.url}${site.avatar}` : undefined,
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
      'SEO',
      'Node.js',
      'PostgreSQL',
    ],
    knowsLanguage: ['uz', 'ru', 'en'],
    nationality: { '@type': 'Country', name: 'Uzbekistan' },
    homeLocation: {
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
    subjectOf: site.cv
      ? {
          '@type': 'CreativeWork',
          name: `${site.name} — CV / Resume`,
          url: `${site.url}${site.cv}`,
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
  };
}

// Рекомендованная Google разметка для персональных страниц — по одной на локаль,
// каждая со своим языком, но все указывают на одну и ту же сущность Person.
function profilePageSchema(site: SiteInfo, ui: UiText, locale: Locale) {
  const url = localeUrl(locale, site.url);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}/#profilepage`,
    url,
    name: ui.meta.title,
    inLanguage: locale,
    isPartOf: { '@id': `${site.url}/#website` },
    about: { '@id': `${site.url}/#person` },
    mainEntity: { '@id': `${site.url}/#person` },
    dateCreated: site.createdAt,
    dateModified: site.updatedAt,
  };
}

export function buildSchemas(site: SiteInfo, ui: UiText, socials: SocialItem[], locale: Locale) {
  return [personSchema(site, socials), websiteSchema(site), profilePageSchema(site, ui, locale)];
}
