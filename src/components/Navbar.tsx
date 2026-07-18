'use client';

import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import InstallPWA from '@/components/InstallPWA';
import { LOCALES, type Locale } from '@/lib/i18n';

type NavItem = { label: string; href: string };
type InstallText = { button: string; iosHint: string };

const localeHref = (locale: Locale) => (locale === 'en' ? '/' : `/${locale}`);

function LocaleSwitcher({ current, className }: { current: Locale; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase ${className ?? ''}`}>
      {LOCALES.map((l, i) => (
        <span key={l} className="inline-flex items-center gap-2">
          {i > 0 && <span className="text-line">/</span>}
          {l === current ? (
            <span aria-current="true" className="text-accent">
              {l}
            </span>
          ) : (
            <a href={localeHref(l)} hrefLang={l} className="text-faint transition-colors hover:text-ink">
              {l}
            </a>
          )}
        </span>
      ))}
    </span>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        scrolled ? 'border-b border-line bg-bg/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav className="wrap flex h-16 items-center justify-between" aria-label="Primary">
        <a href="#top" className="font-mono text-sm font-bold tracking-tight text-ink">
          <span className="text-accent">~/</span>kamron
          <span className="animate-blink text-accent">_</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="font-mono text-[13px] text-muted transition-colors hover:text-ink">
                {item.label}
              </a>
            </li>
          ))}
          <li className="flex items-center gap-6">
            {/* Кнопка сама скрывается там, где установка невозможна или уже сделана. */}
            <InstallPWA label={install.button} iosHint={install.iosHint} />
            <a
              href="#contact"
              className="rounded-md border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-mono text-[13px] text-ink transition-colors hover:bg-accent/20"
            >
              {cta}
            </a>
          </li>
          <li>
            <LocaleSwitcher current={locale} />
          </li>
        </ul>

        <div className="flex items-center gap-4 md:hidden">
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
        <div id="mobile-nav" className="border-t border-line bg-bg/95 backdrop-blur-md md:hidden">
          <ul className="wrap flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 font-mono text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
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
