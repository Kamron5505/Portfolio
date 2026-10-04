import { cache } from 'react';
import { CANONICAL_SITE_URL, NAV, normalizeSiteUrl, PROJECTS, SITE, SKILLS, SOCIALS } from './data';
import { getDict, type Locale, type QuizText } from './i18n';
import { assetExists } from './public-assets';

// ─────────────────────────────────────────────────────────────────────────────
// Единый слой контента для сайта.
//
// Источник один — src/lib/data.ts (языконезависимые данные: ссылки, теги,
// изображения) и src/lib/i18n.ts (тексты на en/uz/ru). Правки делаются в коде
// и выкатываются пушем: базы данных у проекта нет, страницы полностью
// статические.
//
// Слой существует ради формы: секции получают уже готовые к рендеру объекты
// с id, а не сырые константы, поэтому вёрстка не знает, откуда взялся контент.
// ─────────────────────────────────────────────────────────────────────────────

export type SiteInfo = {
  url: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: string;
  subRole: string;
  tagline: string;
  location: string;
  email: string;
  avatar: string;
  cv: string;
  createdAt: string;
  updatedAt: string;
};

export type UiText = {
  meta: { title: string; description: string; ogLocale: string };
  role: string;
  subRole: string;
  tagline: string;
  location: string;
  skipToContent: string;
  nav: { label: string; href: string }[];
  hero: { available: string; headline: string; auditCta: string; intro: string; getInTouch: string; viewWork: string; downloadCv: string };
  about: { eyebrow: string; title: string; paragraphs: string[] };
  services: { eyebrow: string; title: string };
  skills: { eyebrow: string; title: string };
  projects: { eyebrow: string; title: string };
  highlights: { eyebrow: string; title: string };
  quiz: QuizText;
  contact: { eyebrow: string; title: string; blurb: string; writeTelegram: string; downloadCv: string };
  footer: { built: string; credit: string };
  install: { button: string; iosHint: string };
};

export type SocialItem = { id: number; label: string; handle: string; url: string; icon: string; sort: number };

/** Проект, уже приведённый к одному языку. */
export type ProjectItem = {
  id: number;
  name: string;
  href: string;
  cover: string | null;
  tags: string[];
  featured: boolean;
  description: string;
  meta?: string;
};

export type SkillGroupItem = { id: number; title: string; items: string[] };
export type ServiceItem = { id: number; title: string; description: string };
export type HighlightItem = { id: number; kind: 'image' | 'video'; src: string; caption: string };

export type Content = {
  site: SiteInfo;
  ui: UiText;
  socials: SocialItem[];
  projects: ProjectItem[];
  skills: SkillGroupItem[];
  services: ServiceItem[];
  highlights: HighlightItem[];
};

// ── Сборка из констант ───────────────────────────────────────────────────────

/**
 * Приводит запись сайта к виду, в котором её безопасно отдавать в SEO.
 *
 *  - url: нормализуется (https, без хвостового слэша) и откатывается на
 *    канонический домен, если задан мусор или адрес preview-деплоя. Это
 *    гарантия, что canonical/sitemap/JSON-LD не уедут на технический домен.
 *  - cv: обнуляется, если файла нет в public/ — иначе кнопка «Скачать CV» и
 *    ссылка в sitemap вели бы на 404.
 */
function normalizeSite(site: SiteInfo): SiteInfo {
  return {
    ...site,
    url: normalizeSiteUrl(site.url) ?? SITE.url ?? CANONICAL_SITE_URL,
    cv: assetExists(site.cv) ? site.cv : '',
  };
}

const buildSocials = (): SocialItem[] =>
  SOCIALS.map((s, i) => ({ id: i + 1, label: s.label, handle: s.handle, url: s.url, icon: s.icon, sort: i }));

const buildProjects = (locale: Locale): ProjectItem[] => {
  const items = getDict(locale).projects.items;
  return PROJECTS.map((p, i) => ({
    id: i + 1,
    name: p.name,
    href: p.href,
    // Как и с CV: путь обнуляется, если файла нет в public/. Иначе карточка
    // отрисовала бы <Image> на 404 — с дырой в вёрстке вместо обложки.
    cover: assetExists(p.cover) ? (p.cover as string) : null,
    tags: [...p.tags],
    featured: Boolean(p.featured),
    description: items[i]?.description ?? p.description,
    meta: items[i]?.meta ?? p.meta,
  }));
};

const buildSkills = (locale: Locale): SkillGroupItem[] => {
  const titles = getDict(locale).skills.groupTitles;
  return SKILLS.map((g, i) => ({ id: i + 1, title: titles[i] ?? g.title, items: [...g.items] }));
};

const buildServices = (locale: Locale): ServiceItem[] =>
  getDict(locale).services.items.map((s, i) => ({ id: i + 1, title: s.title, description: s.description }));

const buildUi = (locale: Locale): UiText => {
  const d = getDict(locale);
  return {
    meta: { ...d.meta },
    role: d.role,
    subRole: d.subRole,
    tagline: d.tagline,
    location: d.location,
    skipToContent: d.skipToContent,
    nav: d.nav.map((n) => ({ ...n })),
    hero: { ...d.hero },
    about: { eyebrow: d.about.eyebrow, title: d.about.title, paragraphs: [...d.about.paragraphs] },
    services: { eyebrow: d.services.eyebrow, title: d.services.title },
    skills: { eyebrow: d.skills.eyebrow, title: d.skills.title },
    projects: { eyebrow: d.projects.eyebrow, title: d.projects.title },
    highlights: { eyebrow: d.highlights.eyebrow, title: d.highlights.title },
    quiz: {
      ...d.quiz,
      remaining: { ...d.quiz.remaining },
      questions: d.quiz.questions.map((q) => ({ ...q, options: [...q.options] })),
      done: { ...d.quiz.done },
    },
    contact: { ...d.contact },
    footer: { ...d.footer },
    install: { ...d.install },
  };
};

export const defaultNav = () => NAV.map((n) => ({ ...n }));

// cache() дедуплицирует вызов в пределах одного рендера: layout,
// generateMetadata и страница просят контент независимо, а собирается он один
// раз. Функция async, потому что её вызывают из server components, ожидающих
// промис — менять их сигнатуры ради синхронности незачем.
export const getContent = cache(async (locale: Locale): Promise<Content> => {
  return {
    site: normalizeSite({ ...SITE }),
    ui: buildUi(locale),
    socials: buildSocials(),
    projects: buildProjects(locale),
    skills: buildSkills(locale),
    services: buildServices(locale),
    // Секция «Хайлайты» осталась в вёрстке, но своих данных у неё нет:
    // пустой список — секция просто не рендерится.
    highlights: [],
  };
});
