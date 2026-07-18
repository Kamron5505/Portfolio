import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { FiLogOut } from 'react-icons/fi';
import '@/app/globals.css';
import DevSwCleanup from '@/components/DevSwCleanup';
import { fontVariables } from '@/lib/fonts';
import { getSession } from '@/lib/auth';
import { logoutAction } from './actions';

// /admin лежит вне групп (en) и (intl), поэтому это самостоятельный корневой
// layout со своими <html> и <body>.
export const metadata: Metadata = {
  title: 'Админка',
  // Панель управления не должна попадать в поиск ни при каких условиях.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#08080C',
  width: 'device-width',
  initialScale: 1,
};

const NAV = [
  { href: '/admin', label: 'Обзор' },
  { href: '/admin/profile', label: 'Профиль' },
  { href: '/admin/projects', label: 'Проекты' },
  { href: '/admin/highlights', label: 'Хайлайты' },
  { href: '/admin/services', label: 'Услуги' },
  { href: '/admin/skills', label: 'Навыки' },
  { href: '/admin/socials', label: 'Соцсети' },
  { href: '/admin/texts', label: 'Тексты сайта' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="ru" className={fontVariables}>
      <body className="antialiased">
        {/* На странице входа сессии ещё нет — шапку и меню там не показываем. */}
        {session ? (
          <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
              <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
                <div className="flex items-center gap-6">
                  <Link href="/admin" className="font-mono text-sm font-bold text-ink">
                    <span className="text-accent">~/</span>admin
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="hidden font-mono text-xs text-faint transition-colors hover:text-ink sm:block"
                  >
                    открыть сайт ↗
                  </Link>
                </div>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    <FiLogOut size={14} aria-hidden="true" /> {session.username}
                  </button>
                </form>
              </div>

              <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[13px] text-muted transition-colors hover:bg-surface hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
        {process.env.NODE_ENV === 'development' && <DevSwCleanup />}
      </body>
    </html>
  );
}
