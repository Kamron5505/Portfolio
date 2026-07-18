import Link from 'next/link';
import { FiAlertTriangle, FiArrowUpRight } from 'react-icons/fi';
import { isDbConfigured } from '@/lib/db';
import { isBlobStorageEnabled } from '@/lib/storage';
import { getCounts } from '@/lib/admin-data';

// Дашборд всегда рендерится свежим: счётчики должны меняться сразу после правок.
export const dynamic = 'force-dynamic';

const CARDS = [
  { href: '/admin/profile', title: 'Профиль', text: 'Имя, роль, email, фото и резюме.' },
  { href: '/admin/projects', title: 'Проекты', text: 'Публикация, обложки, теги, описания.' },
  { href: '/admin/highlights', title: 'Хайлайты', text: 'Фото и короткие видео на главной.' },
  { href: '/admin/services', title: 'Услуги', text: 'Что вы делаете — блок «Что я делаю».' },
  { href: '/admin/skills', title: 'Навыки', text: 'Группы технологий и стек.' },
  { href: '/admin/socials', title: 'Соцсети', text: 'Ссылки на профили и иконки.' },
  { href: '/admin/texts', title: 'Тексты сайта', text: 'Все надписи и заголовки, три языка.' },
];

export default async function AdminDashboard() {
  const dbReady = isDbConfigured();
  const counts = dbReady
    ? await getCounts().catch(() => null)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Панель управления</h1>
        <p className="mt-2 text-muted">Меняйте содержимое сайта без правок в коде.</p>
      </div>

      {!dbReady && (
        <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">База данных не подключена</p>
            <p className="mt-1 text-amber-200/80">
              Сайт сейчас показывает значения по умолчанию из кода, а сохранение работать не будет.
              Добавьте <code className="font-mono">DATABASE_URL</code> в <code className="font-mono">.env.local</code>{' '}
              и выполните <code className="font-mono">npm run db:setup</code>.
            </p>
          </div>
        </div>
      )}

      {dbReady && counts === null && (
        <div className="flex gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          <FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">База подключена, но таблиц нет</p>
            <p className="mt-1 text-red-300/80">
              Выполните <code className="font-mono">npm run db:setup</code> — он создаст схему и перенесёт
              нынешний контент сайта в базу.
            </p>
          </div>
        </div>
      )}

      {!isBlobStorageEnabled() && (
        <div className="rounded-xl border border-line bg-surface/60 p-4 text-sm text-muted">
          <p>
            <span className="text-ink">Хранилище файлов:</span> локальная папка{' '}
            <code className="font-mono text-faint">public/uploads</code>. Для продакшена на Vercel добавьте{' '}
            <code className="font-mono text-faint">BLOB_READ_WRITE_TOKEN</code> — иначе загруженные фото
            пропадут при следующем деплое.
          </p>
        </div>
      )}

      {counts && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Проекты', value: counts.projects },
            { label: 'Хайлайты', value: counts.highlights },
            { label: 'Услуги', value: counts.services },
            { label: 'Навыки', value: counts.skills },
            { label: 'Соцсети', value: counts.socials },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <dd className="font-display text-2xl font-bold text-ink">{stat.value}</dd>
              <dt className="mt-1 font-mono text-[11px] uppercase tracking-wider text-faint">{stat.label}</dt>
            </div>
          ))}
        </dl>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="card card-hover group p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink">{card.title}</h2>
              <FiArrowUpRight className="shrink-0 text-faint transition-colors group-hover:text-accent" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{card.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
