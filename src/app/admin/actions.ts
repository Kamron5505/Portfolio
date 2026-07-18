'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { endSession, requireSession, startSession, verifyCredentials } from '@/lib/auth';
import { saveUpload, deleteUpload, guessMediaKind, UploadError } from '@/lib/storage';
import { LOCALES, isLocale, type Locale } from '@/lib/i18n';
import type { SiteInfo, UiText } from '@/lib/content';

export type ActionState = { ok?: string; error?: string };

// Публичные страницы статические, поэтому после каждой правки их кеш нужно
// сбросить явно — иначе изменения не появятся до следующей сборки.
function revalidateSite() {
  revalidatePath('/', 'layout');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/sitemap.xml');
  revalidatePath('/manifest.webmanifest');
}

/** Оборачивает действие: проверка сессии + единая обработка ошибок вместо белого экрана. */
async function guard(run: () => Promise<void>): Promise<ActionState> {
  try {
    await requireSession();
    await run();
    revalidateSite();
    return { ok: 'Сохранено' };
  } catch (error) {
    if (error instanceof UploadError) return { error: error.message };
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('[admin]', error);
    return { error: message };
  }
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();
const num = (fd: FormData, key: string) => Number(fd.get(key) ?? 0) || 0;
const bool = (fd: FormData, key: string) => fd.get(key) === 'on' || fd.get(key) === 'true';
const file = (fd: FormData, key: string) => {
  const value = fd.get(key);
  return value instanceof File && value.size > 0 ? value : null;
};
const lines = (fd: FormData, key: string) =>
  str(fd, key)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

// ── Вход / выход ─────────────────────────────────────────────────────────────

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = str(formData, 'username');
  const password = String(formData.get('password') ?? '');
  const next = str(formData, 'next') || '/admin';

  if (!username || !password) return { error: 'Введите логин и пароль.' };

  let ok = false;
  try {
    const session = await verifyCredentials(username, password);
    if (!session) return { error: 'Неверный логин или пароль.' };
    await startSession(session);
    ok = true;
  } catch (error) {
    console.error('[admin] ошибка входа:', error);
    return { error: 'Не удалось проверить данные — похоже, база недоступна.' };
  }

  // redirect() бросает управляющее исключение, поэтому вызывается вне try/catch.
  if (ok) redirect(next.startsWith('/admin') ? next : '/admin');
  return {};
}

export async function logoutAction() {
  await endSession();
  redirect('/admin/login');
}

// ── Профиль ──────────────────────────────────────────────────────────────────

const siteSchema = z.object({
  url: z.string().url('Укажите полный URL, например https://example.com'),
  name: z.string().min(1, 'Имя не может быть пустым'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  initials: z.string().min(1).max(3),
  role: z.string().min(1),
  subRole: z.string(),
  tagline: z.string(),
  location: z.string(),
  email: z.string().email('Некорректный email'),
});

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const current = ((await sql`select data from site_settings where id = 1`) as Record<string, unknown>[])[0]
      ?.data as SiteInfo | undefined;

    const parsed = siteSchema.safeParse({
      url: str(formData, 'url').replace(/\/$/, ''),
      name: str(formData, 'name'),
      firstName: str(formData, 'firstName'),
      lastName: str(formData, 'lastName'),
      initials: str(formData, 'initials'),
      role: str(formData, 'role'),
      subRole: str(formData, 'subRole'),
      tagline: str(formData, 'tagline'),
      location: str(formData, 'location'),
      email: str(formData, 'email'),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);

    let avatar = current?.avatar ?? '';
    let cv = current?.cv ?? '';

    const avatarFile = file(formData, 'avatarFile');
    if (avatarFile) {
      const url = await saveUpload(avatarFile, 'avatar');
      await deleteUpload(avatar);
      avatar = url;
    }
    if (bool(formData, 'removeAvatar')) {
      await deleteUpload(avatar);
      avatar = '';
    }

    const cvFile = file(formData, 'cvFile');
    if (cvFile) {
      const url = await saveUpload(cvFile, 'cv');
      await deleteUpload(cv);
      cv = url;
    }
    if (bool(formData, 'removeCv')) {
      await deleteUpload(cv);
      cv = '';
    }

    const data: SiteInfo = {
      ...parsed.data,
      avatar,
      cv,
      createdAt: current?.createdAt ?? new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    await sql`
      insert into site_settings (id, data, updated_at) values (1, ${JSON.stringify(data)}::jsonb, now())
      on conflict (id) do update set data = excluded.data, updated_at = now()
    `;
  });
}

// ── Тексты сайта ─────────────────────────────────────────────────────────────

export async function saveTextsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const locale = str(formData, 'locale');
    if (!isLocale(locale)) throw new Error('Неизвестный язык.');

    const sql = db();
    const rows = (await sql`select data from ui_texts where locale = ${locale}`) as Record<string, unknown>[];
    const current = rows[0]?.data as UiText | undefined;
    if (!current) throw new Error('Тексты для этого языка не найдены. Выполните `npm run db:setup`.');

    const navLabels = lines(formData, 'navLabels');
    const nav = current.nav.map((item, i) => ({ ...item, label: navLabels[i] ?? item.label }));

    const data: UiText = {
      ...current,
      meta: {
        ...current.meta,
        title: str(formData, 'metaTitle'),
        description: str(formData, 'metaDescription'),
      },
      role: str(formData, 'role'),
      subRole: str(formData, 'subRole'),
      tagline: str(formData, 'tagline'),
      location: str(formData, 'location'),
      skipToContent: str(formData, 'skipToContent'),
      nav,
      hero: {
        available: str(formData, 'heroAvailable'),
        intro: str(formData, 'heroIntro'),
        getInTouch: str(formData, 'heroGetInTouch'),
        viewWork: str(formData, 'heroViewWork'),
        downloadCv: str(formData, 'heroDownloadCv'),
      },
      about: {
        eyebrow: str(formData, 'aboutEyebrow'),
        title: str(formData, 'aboutTitle'),
        paragraphs: str(formData, 'aboutParagraphs')
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean),
      },
      services: { eyebrow: str(formData, 'servicesEyebrow'), title: str(formData, 'servicesTitle') },
      skills: { eyebrow: str(formData, 'skillsEyebrow'), title: str(formData, 'skillsTitle') },
      projects: { eyebrow: str(formData, 'projectsEyebrow'), title: str(formData, 'projectsTitle') },
      contact: {
        eyebrow: str(formData, 'contactEyebrow'),
        title: str(formData, 'contactTitle'),
        blurb: str(formData, 'contactBlurb'),
        writeTelegram: str(formData, 'contactWriteTelegram'),
        downloadCv: str(formData, 'contactDownloadCv'),
      },
      footer: { built: str(formData, 'footerBuilt'), credit: str(formData, 'footerCredit') },
    };

    await sql`
      insert into ui_texts (locale, data, updated_at) values (${locale}, ${JSON.stringify(data)}::jsonb, now())
      on conflict (locale) do update set data = excluded.data, updated_at = now()
    `;
  });
}

// ── Соцсети ──────────────────────────────────────────────────────────────────

export async function saveSocialAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const label = str(formData, 'label');
    const handle = str(formData, 'handle');
    const url = str(formData, 'url');
    const icon = str(formData, 'icon');
    const sort = num(formData, 'sort');

    if (!label || !url) throw new Error('Название и ссылка обязательны.');
    if (!/^https?:\/\//.test(url)) throw new Error('Ссылка должна начинаться с http:// или https://');

    if (id > 0) {
      await sql`
        update socials set label = ${label}, handle = ${handle}, url = ${url}, icon = ${icon}, sort = ${sort}
        where id = ${id}
      `;
    } else {
      await sql`
        insert into socials (label, handle, url, icon, sort) values (${label}, ${handle}, ${url}, ${icon}, ${sort})
      `;
    }
  });
}

export async function deleteSocialAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const id = num(formData, 'id');
    await db()`delete from socials where id = ${id}`;
  });
}

// ── Проекты ──────────────────────────────────────────────────────────────────

export async function saveProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const name = str(formData, 'name');
    if (!name) throw new Error('Название проекта обязательно.');

    const href = str(formData, 'href');
    const tags = str(formData, 'tags')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const featured = bool(formData, 'featured');
    const sort = num(formData, 'sort');

    const translations: Record<string, { description: string; meta: string }> = {};
    for (const locale of LOCALES) {
      translations[locale] = {
        description: str(formData, `description_${locale}`),
        meta: str(formData, `meta_${locale}`),
      };
    }

    // Текущая обложка нужна, чтобы удалить старый файл после замены.
    const existing = id
      ? ((await sql`select cover from projects where id = ${id}`) as Record<string, unknown>[])[0]
      : undefined;
    let cover = (existing?.cover as string | null) ?? null;

    const coverFile = file(formData, 'coverFile');
    if (coverFile) {
      const url = await saveUpload(coverFile, 'covers');
      await deleteUpload(cover);
      cover = url;
    }
    if (bool(formData, 'removeCover')) {
      await deleteUpload(cover);
      cover = null;
    }

    const tagsJson = JSON.stringify(tags);
    const translationsJson = JSON.stringify(translations);

    if (id > 0) {
      await sql`
        update projects set
          name = ${name}, href = ${href}, cover = ${cover}, tags = ${tagsJson}::jsonb,
          featured = ${featured}, sort = ${sort}, translations = ${translationsJson}::jsonb
        where id = ${id}
      `;
    } else {
      await sql`
        insert into projects (name, href, cover, tags, featured, sort, translations)
        values (${name}, ${href}, ${cover}, ${tagsJson}::jsonb, ${featured}, ${sort}, ${translationsJson}::jsonb)
      `;
    }
  });
}

export async function deleteProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const rows = (await sql`select cover from projects where id = ${id}`) as Record<string, unknown>[];
    await deleteUpload(rows[0]?.cover as string | null);
    await sql`delete from projects where id = ${id}`;
  });
}

// ── Услуги ───────────────────────────────────────────────────────────────────

export async function saveServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const sort = num(formData, 'sort');

    const translations: Record<string, { title: string; description: string }> = {};
    for (const locale of LOCALES) {
      translations[locale] = {
        title: str(formData, `title_${locale}`),
        description: str(formData, `description_${locale}`),
      };
    }
    if (!translations.en.title && !translations.ru.title) {
      throw new Error('Заполните название услуги хотя бы на одном языке.');
    }

    const json = JSON.stringify(translations);
    if (id > 0) {
      await sql`update services set sort = ${sort}, translations = ${json}::jsonb where id = ${id}`;
    } else {
      await sql`insert into services (sort, translations) values (${sort}, ${json}::jsonb)`;
    }
  });
}

export async function deleteServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    await db()`delete from services where id = ${num(formData, 'id')}`;
  });
}

// ── Навыки ───────────────────────────────────────────────────────────────────

export async function saveSkillGroupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const sort = num(formData, 'sort');

    const titles: Record<string, string> = {};
    for (const locale of LOCALES) titles[locale] = str(formData, `title_${locale}`);

    // Технологии вводятся через запятую — так быстрее, чем по одному полю.
    const items = str(formData, 'items')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!items.length) throw new Error('Добавьте хотя бы одну технологию.');

    const titlesJson = JSON.stringify(titles);
    const itemsJson = JSON.stringify(items);

    if (id > 0) {
      await sql`
        update skill_groups set sort = ${sort}, titles = ${titlesJson}::jsonb, items = ${itemsJson}::jsonb
        where id = ${id}
      `;
    } else {
      await sql`
        insert into skill_groups (sort, titles, items)
        values (${sort}, ${titlesJson}::jsonb, ${itemsJson}::jsonb)
      `;
    }
  });
}

export async function deleteSkillGroupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    await db()`delete from skill_groups where id = ${num(formData, 'id')}`;
  });
}

// ── Хайлайты ─────────────────────────────────────────────────────────────────

export async function saveHighlightAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const sort = num(formData, 'sort');
    const externalUrl = str(formData, 'externalUrl');
    const uploaded = file(formData, 'mediaFile');

    // Текущий src нужен, чтобы удалить старый файл при замене.
    const existing = id
      ? ((await sql`select src, kind from highlights where id = ${id}`) as Record<string, unknown>[])[0]
      : undefined;
    let src = (existing?.src as string | undefined) ?? '';
    let kind: 'image' | 'video' = (existing?.kind as 'image' | 'video' | undefined) ?? 'image';

    if (uploaded) {
      // Загрузка файла: тип определяется по MIME при сохранении.
      const url = await saveUpload(uploaded, 'highlights');
      if (src && src !== url) await deleteUpload(src);
      src = url;
      kind = uploaded.type.startsWith('video/') ? 'video' : 'image';
    } else if (externalUrl) {
      if (!/^https?:\/\//.test(externalUrl)) {
        throw new Error('Ссылка должна начинаться с http:// или https://');
      }
      // Внешняя ссылка заменяет ранее загруженный файл — старый убираем.
      if (src && src !== externalUrl && src.startsWith('/uploads/')) await deleteUpload(src);
      src = externalUrl;
      kind = guessMediaKind(externalUrl);
    }

    if (!src) throw new Error('Загрузите файл или укажите ссылку на медиа.');

    const translations: Record<string, { caption: string }> = {};
    for (const locale of LOCALES) translations[locale] = { caption: str(formData, `caption_${locale}`) };
    const json = JSON.stringify(translations);

    if (id > 0) {
      await sql`
        update highlights set kind = ${kind}, src = ${src}, sort = ${sort}, translations = ${json}::jsonb
        where id = ${id}
      `;
    } else {
      await sql`
        insert into highlights (kind, src, sort, translations)
        values (${kind}, ${src}, ${sort}, ${json}::jsonb)
      `;
    }
  });
}

export async function deleteHighlightAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guard(async () => {
    const sql = db();
    const id = num(formData, 'id');
    const rows = (await sql`select src from highlights where id = ${id}`) as Record<string, unknown>[];
    await deleteUpload(rows[0]?.src as string | null);
    await sql`delete from highlights where id = ${id}`;
  });
}

export type { Locale };
