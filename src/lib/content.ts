import { cache } from 'react';
import { CANONICAL_SITE_URL, NAV, normalizeSiteUrl, PROJECTS, SITE, SKILLS, SOCIALS } from './data';
import { getDict, type Locale } from './i18n';
import { db, safeQuery } from './db';
import { assetExists } from './public-assets';

// ─────────────────────────────────────────────────────────────────────────────
// Единый слой контента для публичного сайта.
//
// Порядок источников: база данных → значения по умолчанию из data.ts / i18n.ts.
// Fallback работает по каждой сущности отдельно: если, скажем, таблица projects
// пуста, проекты берутся из data.ts, а остальное всё равно приходит из базы.
// Поэтому сайт никогда не показывает пустую секцию из-за незаполненной админки.
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
  hero: { available: string; intro: string; getInTouch: string; viewWork: string; downloadCv: string };
  about: { eyebrow: string; title: string; paragraphs: string[] };
  services: { eyebrow: string; title: string };
  skills: { eyebrow: string; title: string };
  projects: { eyebrow: string; title: string };
  highlights: { eyebrow: string; title: string };
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

// ── Значения по умолчанию ────────────────────────────────────────────────────

export const defaultSite = (): SiteInfo => ({ ...SITE });

/**
 * Приводит запись сайта к тому виду, в котором её безопасно отдавать в SEO.
 *
 *  - url: нормализуется (https, без хвостового слэша) и откатывается на
 *    канонический домен, если в базе пусто, мусор или адрес preview-деплоя.
 *    Это гарантия, что canonical/sitemap/JSON-LD не уедут на технический домен.
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

export const defaultUi = (locale: Locale): UiText => {
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
    contact: { ...d.contact },
    footer: { ...d.footer },
    install: { ...d.install },
  };
};

const defaultSocials = (): SocialItem[] =>
  SOCIALS.map((s, i) => ({ id: -(i + 1), label: s.label, handle: s.handle, url: s.url, icon: s.icon, sort: i }));

const defaultProjects = (locale: Locale): ProjectItem[] => {
  const items = getDict(locale).projects.items;
  return PROJECTS.map((p, i) => ({
    id: -(i + 1),
    name: p.name,
    href: p.href,
    cover: null,
    tags: [...p.tags],
    featured: Boolean(p.featured),
    description: items[i]?.description ?? p.description,
    meta: items[i]?.meta ?? p.meta,
  }));
};

const defaultSkills = (locale: Locale): SkillGroupItem[] => {
  const titles = getDict(locale).skills.groupTitles;
  return SKILLS.map((g, i) => ({ id: -(i + 1), title: titles[i] ?? g.title, items: [...g.items] }));
};

const defaultServices = (locale: Locale): ServiceItem[] =>
  getDict(locale).services.items.map((s, i) => ({ id: -(i + 1), title: s.title, description: s.description }));

export const defaultNav = () => NAV.map((n) => ({ ...n }));

// ── Чтение из базы ───────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

const asArray = <T,>(value: unknown, fallback: T[]): T[] => (Array.isArray(value) ? (value as T[]) : fallback);

/** Достаёт перевод для нужного языка с откатом на английский, затем на первый доступный. */
function pickTranslation<T extends Record<string, unknown>>(translations: unknown, locale: Locale): Partial<T> {
  if (!translations || typeof translations !== 'object') return {};
  const map = translations as Record<string, T>;
  return map[locale] ?? map.en ?? Object.values(map)[0] ?? {};
}

// cache() дедуплицирует вызов в пределах одного рендера: layout, generateMetadata
// и страница просят контент независимо, но запрос к базе уходит один.
export const getContent = cache(async (locale: Locale): Promise<Content> => {
  const fallback: Content = {
    site: normalizeSite(defaultSite()),
    ui: defaultUi(locale),
    socials: defaultSocials(),
    projects: defaultProjects(locale),
    skills: defaultSkills(locale),
    services: defaultServices(locale),
    // Хайлайтов нет в data.ts — это новая секция, поэтому по умолчанию пусто.
    // Пустой список означает, что секция на сайте просто не отрисуется.
    highlights: [],
  };

  return safeQuery(async () => {
    const sql = db();

    // Один round-trip на сущность; Neon по HTTP — это обычные HTTP-запросы,
    // поэтому запускаем их параллельно.
    const [settings, texts, socials, projects, services, skills, highlights] = await Promise.all([
      sql`select data from site_settings where id = 1` as Promise<Row[]>,
      sql`select data from ui_texts where locale = ${locale}` as Promise<Row[]>,
      sql`select id, label, handle, url, icon, sort from socials order by sort, id` as Promise<Row[]>,
      sql`select id, name, href, cover, tags, featured, sort, translations from projects order by sort, id` as Promise<Row[]>,
      sql`select id, sort, translations from services order by sort, id` as Promise<Row[]>,
      sql`select id, sort, items, titles from skill_groups order by sort, id` as Promise<Row[]>,
      sql`select id, kind, src, sort, translations from highlights order by sort, id` as Promise<Row[]>,
    ]);

    const site = (settings[0]?.data as SiteInfo | undefined) ?? fallback.site;
    const storedUi = texts[0]?.data as UiText | undefined;

    return {
      // Мягкое слияние: поля, которых ещё нет в базе (например, добавленные
      // позже), подхватываются из дефолтов, а не превращаются в undefined.
      site: normalizeSite({ ...fallback.site, ...site }),
      ui: storedUi ? { ...fallback.ui, ...storedUi } : fallback.ui,

      socials: socials.length
        ? socials.map((r) => ({
            id: Number(r.id),
            label: String(r.label),
            handle: String(r.handle),
            url: String(r.url),
            icon: String(r.icon),
            sort: Number(r.sort),
          }))
        : fallback.socials,

      projects: projects.length
        ? projects.map((r) => {
            const t = pickTranslation<{ description: string; meta: string }>(r.translations, locale);
            return {
              id: Number(r.id),
              name: String(r.name),
              href: String(r.href ?? ''),
              cover: (r.cover as string | null) ?? null,
              tags: asArray<string>(r.tags, []),
              featured: Boolean(r.featured),
              description: t.description ?? '',
              meta: t.meta || undefined,
            };
          })
        : fallback.projects,

      services: services.length
        ? services.map((r) => {
            const t = pickTranslation<{ title: string; description: string }>(r.translations, locale);
            return { id: Number(r.id), title: t.title ?? '', description: t.description ?? '' };
          })
        : fallback.services,

      skills: skills.length
        ? skills.map((r) => {
            const titles = (r.titles ?? {}) as Record<string, string>;
            return {
              id: Number(r.id),
              title: titles[locale] ?? titles.en ?? '',
              items: asArray<string>(r.items, []),
            };
          })
        : fallback.skills,

      // Хайлайты не имеют дефолта: пусто в базе → пусто на сайте.
      highlights: highlights.map((r) => {
        const t = pickTranslation<{ caption: string }>(r.translations, locale);
        return {
          id: Number(r.id),
          kind: r.kind === 'video' ? ('video' as const) : ('image' as const),
          src: String(r.src),
          caption: t.caption ?? '',
        };
      }),
    };
  }, fallback);
});
