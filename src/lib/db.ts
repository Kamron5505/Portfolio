import { neon } from '@neondatabase/serverless';
import path from 'node:path';

// Подключение к Neon по HTTP: без пула соединений, поэтому безопасно работает
// в serverless-функциях Vercel и одинаково — с локальной машины.
//
// База опциональна. Пока DATABASE_URL не задан, сайт отдаёт контент из
// src/lib/data.ts и src/lib/i18n.ts, а админка сообщает, что БД не подключена.
//
// Локальный режим: LOCAL_DB=1 в .env.local включает встроенный Postgres
// (PGlite) с данными в папке .pglite/ — админку можно смотреть без Neon
// и вообще без сети. На проде этот флаг задавать нельзя: файловая система
// serverless-функций доступна только на чтение.
export const isLocalDb = () => process.env.LOCAL_DB === '1' && !process.env.DATABASE_URL;

export const isDbConfigured = () => Boolean(process.env.DATABASE_URL) || isLocalDb();

// Минимальный общий интерфейс Neon-клиента и локального адаптера:
// tagged template + .query(). Больше ничего в проекте не используется.
type Row = Record<string, unknown>;
export type SqlClient = ((strings: TemplateStringsArray, ...params: unknown[]) => Promise<Row[]>) & {
  query: (text: string, params?: unknown[]) => Promise<Row[]>;
};

let client: SqlClient | null = null;

// PGlite живёт на globalThis: при hot reload в next dev модуль пересоздаётся,
// а второй инстанс поверх той же папки данных приведёт к конфликту.
type PGliteLike = { query: (text: string, params?: unknown[]) => Promise<{ rows: Row[] }> };
const g = globalThis as { __pglite?: Promise<PGliteLike> };

function getPGlite(): Promise<PGliteLike> {
  if (!g.__pglite) {
    g.__pglite = import('@electric-sql/pglite').then(({ PGlite }) =>
      PGlite.create(path.join(process.cwd(), '.pglite')),
    ) as Promise<PGliteLike>;
  }
  return g.__pglite;
}

function localClient(): SqlClient {
  const run = async (text: string, params: unknown[] = []): Promise<Row[]> => {
    const pg = await getPGlite();
    const res = await pg.query(text, params);
    return res.rows;
  };
  const sql = ((strings: TemplateStringsArray, ...params: unknown[]) => {
    // Neon принимает tagged template; PGlite — текст с $1, $2... Склеиваем.
    let text = strings[0];
    for (let i = 1; i < strings.length; i++) text += `$${i}${strings[i]}`;
    return run(text, params);
  }) as SqlClient;
  sql.query = run;
  return sql;
}

export function db(): SqlClient {
  if (client) return client;

  if (isLocalDb()) {
    client = localClient();
    return client;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL не задан. Добавьте строку подключения Neon в .env.local (см. .env.example) или включите LOCAL_DB=1 для встроенной базы.',
    );
  }
  client = neon(url) as unknown as SqlClient;
  return client;
}

/** Закрывает встроенную базу (нужно скриптам, чтобы данные точно легли на диск). */
export async function closeDb() {
  if (!g.__pglite) return;
  const pg = (await g.__pglite) as PGliteLike & { close?: () => Promise<void> };
  await pg.close?.();
  g.__pglite = undefined;
  client = null;
}

// Запрос, который не должен ронять публичную страницу: если база недоступна
// (нет сети, спящий Neon, кривой URL), возвращаем fallback и логируем причину.
// Публичный сайт в этом случае просто показывает значения по умолчанию.
export async function safeQuery<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error('[db] запрос не выполнен, используются значения по умолчанию:', error);
    return fallback;
  }
}
