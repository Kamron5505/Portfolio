/**
 * Создаёт схему, переносит нынешний контент сайта в базу и заводит админа.
 *
 *   npm run db:setup
 *
 * Скрипт идемпотентен: повторный запуск не ломает данные. Контент заливается
 * только в пустые таблицы, поэтому ваши правки из админки он не затрёт.
 * Пароль администратора обновляется при каждом запуске с ADMIN_PASSWORD.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';

import { db, isDbConfigured, isLocalDb, closeDb } from '../src/lib/db';
import { SITE, SOCIALS, PROJECTS, SKILLS } from '../src/lib/data';
import { getDict, LOCALES } from '../src/lib/i18n';
import { defaultUi } from '../src/lib/content';

if (!isDbConfigured()) {
  console.error(
    '✗ База не настроена. Либо вставьте строку Neon в DATABASE_URL, либо включите LOCAL_DB=1 в .env.local для встроенной локальной базы.',
  );
  process.exit(1);
}
if (isLocalDb()) console.log('· локальный режим: встроенная база PGlite в папке .pglite/');

const sql = db();

async function main() {
  // 1. Схема
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
  const schema = await readFile(schemaPath, 'utf8');

  // Драйвер Neon по HTTP выполняет по одному запросу за раз, поэтому режем файл
  // на отдельные выражения. Комментарии убираем ДО разреза по «;» — внутри
  // комментария тоже может встретиться точка с запятой.
  const statements = schema
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) await sql.query(statement);
  console.log(`✓ схема применена (${statements.length} выражений)`);

  // 2. Администратор
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.error('✗ Задайте ADMIN_USERNAME и ADMIN_PASSWORD в .env.local — без них в админку не войти.');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('✗ ADMIN_PASSWORD короче 10 символов. Возьмите пароль подлиннее.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await sql`
    insert into admin_users (username, password_hash) values (${username}, ${hash})
    on conflict (username) do update set password_hash = excluded.password_hash
  `;
  console.log(`✓ администратор «${username}» готов (пароль обновлён)`);

  // 3. Профиль
  const settings = (await sql`select 1 from site_settings where id = 1`) as unknown[];
  if (settings.length === 0) {
    await sql`insert into site_settings (id, data) values (1, ${JSON.stringify(SITE)}::jsonb)`;
    console.log('✓ профиль перенесён');
  } else {
    console.log('· профиль уже есть, пропускаем');
  }

  // 4. Тексты по языкам
  for (const locale of LOCALES) {
    const rows = (await sql`select 1 from ui_texts where locale = ${locale}`) as unknown[];
    if (rows.length) {
      console.log(`· тексты (${locale}) уже есть, пропускаем`);
      continue;
    }
    const data = JSON.stringify(defaultUi(locale));
    await sql`insert into ui_texts (locale, data) values (${locale}, ${data}::jsonb)`;
    console.log(`✓ тексты (${locale}) перенесены`);
  }

  // 5. Соцсети
  const socials = (await sql`select 1 from socials limit 1`) as unknown[];
  if (socials.length === 0) {
    for (const [i, s] of SOCIALS.entries()) {
      await sql`
        insert into socials (label, handle, url, icon, sort)
        values (${s.label}, ${s.handle}, ${s.url}, ${s.icon}, ${i})
      `;
    }
    console.log(`✓ соцсети перенесены (${SOCIALS.length})`);
  } else {
    console.log('· соцсети уже есть, пропускаем');
  }

  // 6. Проекты — описания собираются из всех трёх словарей по индексу.
  const projects = (await sql`select 1 from projects limit 1`) as unknown[];
  if (projects.length === 0) {
    for (const [i, p] of PROJECTS.entries()) {
      const translations: Record<string, { description: string; meta: string }> = {};
      for (const locale of LOCALES) {
        const item = getDict(locale).projects.items[i];
        translations[locale] = {
          description: item?.description ?? p.description,
          meta: item?.meta ?? p.meta ?? '',
        };
      }
      await sql`
        insert into projects (name, href, cover, tags, featured, sort, translations)
        values (
          ${p.name}, ${p.href}, null, ${JSON.stringify(p.tags)}::jsonb,
          ${Boolean(p.featured)}, ${i}, ${JSON.stringify(translations)}::jsonb
        )
      `;
    }
    console.log(`✓ проекты перенесены (${PROJECTS.length})`);
  } else {
    console.log('· проекты уже есть, пропускаем');
  }

  // 7. Услуги
  const services = (await sql`select 1 from services limit 1`) as unknown[];
  if (services.length === 0) {
    const count = getDict('en').services.items.length;
    for (let i = 0; i < count; i++) {
      const translations: Record<string, { title: string; description: string }> = {};
      for (const locale of LOCALES) {
        const item = getDict(locale).services.items[i];
        translations[locale] = { title: item?.title ?? '', description: item?.description ?? '' };
      }
      await sql`
        insert into services (sort, translations) values (${i}, ${JSON.stringify(translations)}::jsonb)
      `;
    }
    console.log(`✓ услуги перенесены (${count})`);
  } else {
    console.log('· услуги уже есть, пропускаем');
  }

  // 8. Навыки
  const skills = (await sql`select 1 from skill_groups limit 1`) as unknown[];
  if (skills.length === 0) {
    for (const [i, group] of SKILLS.entries()) {
      const titles: Record<string, string> = {};
      for (const locale of LOCALES) {
        titles[locale] = getDict(locale).skills.groupTitles[i] ?? group.title;
      }
      await sql`
        insert into skill_groups (sort, items, titles)
        values (${i}, ${JSON.stringify(group.items)}::jsonb, ${JSON.stringify(titles)}::jsonb)
      `;
    }
    console.log(`✓ навыки перенесены (${SKILLS.length})`);
  } else {
    console.log('· навыки уже есть, пропускаем');
  }

  console.log('\nГотово. Откройте /admin/login и войдите.');
  await closeDb();
}

main().catch((error) => {
  console.error('\n✗ Установка не удалась:', error);
  process.exit(1);
});
