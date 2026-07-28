import { db } from './db';
import { normalizeSiteUrl } from './data';
import { defaultSite, defaultUi, type SiteInfo, type UiText } from './content';
import { LOCALES, type Locale } from './i18n';

// Чтение «сырых» строк для админки: в отличие от content.ts, здесь нужны все
// языки сразу, а не один — редактор правит en/uz/ru рядом друг с другом.

export type Translated<T> = Partial<Record<Locale, T>>;

export type SocialRow = { id: number; label: string; handle: string; url: string; icon: string; sort: number };

export type ProjectRow = {
  id: number;
  name: string;
  href: string;
  cover: string | null;
  tags: string[];
  featured: boolean;
  sort: number;
  translations: Translated<{ description: string; meta: string }>;
};

export type ServiceRow = {
  id: number;
  sort: number;
  translations: Translated<{ title: string; description: string }>;
};

export type SkillGroupRow = {
  id: number;
  sort: number;
  items: string[];
  titles: Translated<string>;
};

export type HighlightRow = {
  id: number;
  kind: 'image' | 'video';
  src: string;
  sort: number;
  translations: Translated<{ caption: string }>;
};

type Row = Record<string, unknown>;

export async function getSiteSettings(): Promise<SiteInfo> {
  const sql = db();
  const rows = (await sql`select data from site_settings where id = 1`) as Row[];
  // Слияние с дефолтами: поля, добавленные в код позже, не станут undefined.
  const merged = { ...defaultSite(), ...((rows[0]?.data as SiteInfo | undefined) ?? {}) };
  // Домен в форме показываем уже нормализованным: если в базе лежит старый
  // адрес preview-деплоя, админ увидит канонический, а не технический.
  return { ...merged, url: normalizeSiteUrl(merged.url) ?? defaultSite().url };
}

export async function getUiTexts(): Promise<Record<Locale, UiText>> {
  const sql = db();
  const rows = (await sql`select locale, data from ui_texts`) as Row[];
  const stored = new Map(rows.map((r) => [String(r.locale), r.data as UiText]));

  const result = {} as Record<Locale, UiText>;
  for (const locale of LOCALES) {
    const fallback = defaultUi(locale);
    const value = stored.get(locale);
    result[locale] = value ? { ...fallback, ...value } : fallback;
  }
  return result;
}

export async function getSocials(): Promise<SocialRow[]> {
  const sql = db();
  const rows = (await sql`select id, label, handle, url, icon, sort from socials order by sort, id`) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    label: String(r.label),
    handle: String(r.handle),
    url: String(r.url),
    icon: String(r.icon),
    sort: Number(r.sort),
  }));
}

export async function getProjects(): Promise<ProjectRow[]> {
  const sql = db();
  const rows = (await sql`
    select id, name, href, cover, tags, featured, sort, translations from projects order by sort, id
  `) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    href: String(r.href ?? ''),
    cover: (r.cover as string | null) ?? null,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    featured: Boolean(r.featured),
    sort: Number(r.sort),
    translations: (r.translations ?? {}) as ProjectRow['translations'],
  }));
}

export async function getServices(): Promise<ServiceRow[]> {
  const sql = db();
  const rows = (await sql`select id, sort, translations from services order by sort, id`) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    sort: Number(r.sort),
    translations: (r.translations ?? {}) as ServiceRow['translations'],
  }));
}

export async function getSkillGroups(): Promise<SkillGroupRow[]> {
  const sql = db();
  const rows = (await sql`select id, sort, items, titles from skill_groups order by sort, id`) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    sort: Number(r.sort),
    items: Array.isArray(r.items) ? (r.items as string[]) : [],
    titles: (r.titles ?? {}) as Translated<string>,
  }));
}

export async function getHighlights(): Promise<HighlightRow[]> {
  const sql = db();
  const rows = (await sql`select id, kind, src, sort, translations from highlights order by sort, id`) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    kind: r.kind === 'video' ? 'video' : 'image',
    src: String(r.src),
    sort: Number(r.sort),
    translations: (r.translations ?? {}) as HighlightRow['translations'],
  }));
}

/** Сводка для дашборда: сколько чего заполнено. */
export async function getCounts() {
  const sql = db();
  const rows = (await sql`
    select
      (select count(*) from projects)     as projects,
      (select count(*) from services)     as services,
      (select count(*) from socials)      as socials,
      (select count(*) from skill_groups) as skills,
      (select count(*) from highlights)   as highlights
  `) as Row[];
  const r = rows[0] ?? {};
  return {
    projects: Number(r.projects ?? 0),
    services: Number(r.services ?? 0),
    socials: Number(r.socials ?? 0),
    skills: Number(r.skills ?? 0),
    highlights: Number(r.highlights ?? 0),
  };
}
