-- Схема контента сайта. Применяется скриптом `npm run db:setup`.
-- Всё, что редактируется из админки, живёт здесь; src/lib/data.ts и i18n.ts
-- остаются значениями по умолчанию, если база пуста или не подключена.

create table if not exists admin_users (
  id            serial primary key,
  username      text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- Одна строка (id = 1): имя, роль, email, аватар, ссылка на CV.
create table if not exists site_settings (
  id         int primary key default 1,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

-- Тексты интерфейса, по строке на язык: заголовки секций, hero, about, footer.
create table if not exists ui_texts (
  locale     text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists socials (
  id     serial primary key,
  label  text not null,
  handle text not null,
  url    text not null,
  icon   text not null,
  sort   int  not null default 0
);

create table if not exists projects (
  id       serial primary key,
  name     text not null,
  href     text not null default '',
  cover    text,
  tags     jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort     int not null default 0,
  -- { "en": { "description": "...", "meta": "..." }, "uz": {...}, "ru": {...} }
  translations jsonb not null default '{}'::jsonb
);

create table if not exists services (
  id   serial primary key,
  sort int not null default 0,
  -- { "en": { "title": "...", "description": "..." }, ... }
  translations jsonb not null default '{}'::jsonb
);

create table if not exists skill_groups (
  id    serial primary key,
  sort  int not null default 0,
  items jsonb not null default '[]'::jsonb,
  -- { "en": "Frontend", "uz": "...", "ru": "..." }
  titles jsonb not null default '{}'::jsonb
);

-- Хайлайты: фото и короткие видео. src — либо загруженный файл, либо внешняя
-- прямая ссылка на медиа (для тяжёлых видео, которые не влезают в лимит загрузки).
create table if not exists highlights (
  id     serial primary key,
  kind   text not null default 'image',   -- 'image' | 'video'
  src    text not null,
  sort   int  not null default 0,
  -- { "en": { "caption": "..." }, "uz": {...}, "ru": {...} }
  translations jsonb not null default '{}'::jsonb
);

-- Живой чат (src/server/chat-server.ts): общий канал посетителей и админа.
-- Таблица также создаётся самим чат-сервером при старте, если её ещё нет.
create table if not exists chat_messages (
  id         uuid primary key,
  name       text not null,
  text       text not null,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_created_idx on chat_messages (created_at);
create index if not exists highlights_sort_idx on highlights (sort);
create index if not exists projects_sort_idx on projects (sort);
create index if not exists services_sort_idx on services (sort);
create index if not exists skill_groups_sort_idx on skill_groups (sort);
create index if not exists socials_sort_idx on socials (sort);
