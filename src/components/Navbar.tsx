'use client';

import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import InstallPWA from '@/components/InstallPWA';
import { LOCALES, type Locale } from '@/lib/i18n';

type NavItem = { label: string; href: string };
type InstallText = { button: string; iosHint: string };

const localeHref = (locale: Locale) => (locale === 'en' ? '/' : `/${locale}`);

// Полные названия языков: код «uz» сам по себе не читается скринридером как
// язык, поэтому он уходит в aria-label, а на экране остаётся короткая метка.
const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  uz: "O'zbekcha",
  ru: 'Русский',
};

function LocaleSwitcher({ current, className }: { current: Locale; className?: string }) {
  return (
    <ul
      aria-label="Language"
      className={`m-0 inline-flex list-none items-center gap-2 p-0 font-mono text-[11px] uppercase ${className ?? ''}`}
    >
      {LOCALES.map((l, i) => (
        <li key={l} className="inline-flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden="true" className="text-line">
              /
            </span>
          )}
          {l === current ? (
            <span aria-current="true" lang={l} className="text-accent">
              <span className="sr-only">{LOCALE_NAMES[l]}</span>
              <span aria-hidden="true">{l}</span>
            </span>
          ) : (
            // Обычный <a>, а не next/link: у локалей разные корневые layout,
            // клиентский переход между ними всё равно превратится в полную
            // перезагрузку, зато краулер видит честную ссылку.
            <a
              href={localeHref(l)}
              hrefLang={l}
              lang={l}
              aria-label={LOCALE_NAMES[l]}
              className="text-faint transition-colors hover:text-ink"
            >
              <span aria-hidden="true">{l}</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Navbar({
  locale,
  nav,
  cta,
  install,
}: {
  locale: Locale;
  nav: NavItem[];
  cta: string;
  install: InstallText;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Подсветка активного пункта — «пилюля» как на слайдах референса.
  useEffect(() => {
    const sections = nav
      .map((n) => document.querySelector<HTMLElement>(n.href))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [nav]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'bg-bg/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="wrap flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <a href="#top" aria-label="Kamron Fazilov" className="display-type text-[26px] leading-none text-ink">
          K<span className="-ml-0.5 align-top text-[18px] text-accent">F</span>
        </a>

        <ul className="hidden items-center gap-1 rounded-full border border-line bg-bg/60 p-1 backdrop-blur-md lg:flex">
          {nav.map((item) => {
            const isActive = active === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block rounded-full px-3.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    isActive ? 'bg-accent text-bg' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          {/* Кнопка сама скрывается там, где установка невозможна или уже сделана. */}
          <InstallPWA label={install.button} iosHint={install.iosHint} />
          <LocaleSwitcher current={locale} />
          <a
            href="#contact"
            className="rounded-full border border-accent/60 px-4 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-bg"
          >
            {cta}
          </a>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <LocaleSwitcher current={locale} />
          <button
            type="button"
            className="text-ink"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-bg/95 backdrop-blur-md lg:hidden">
          <ul className="wrap flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-full px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    active === item.href ? 'bg-accent text-bg' : 'text-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <InstallPWA label={install.button} iosHint={install.iosHint} variant="menu" />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
