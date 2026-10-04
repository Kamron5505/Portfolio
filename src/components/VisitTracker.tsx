'use client';

import { useEffect } from 'react';

// Анонимная аналитика визита для ежедневного ИИ-отчёта (см. /api/track и
// /api/report). Собирает: сколько секунд каждая секция была на экране,
// глубину прокрутки, клики по ссылкам и начало квиза. Никаких имён, IP и
// содержимого полей ввода. Если в браузере включён Do Not Track — не следим.

const VID_KEY = 'kf_vid';
const SID_KEY = 'kf_sid';
const FLUSH_MS = 15_000;

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

function storageId(storage: Storage | undefined, key: string): { id: string; existed: boolean } {
  try {
    const existing = storage?.getItem(key);
    if (existing) return { id: existing, existed: true };
    const id = uid();
    storage?.setItem(key, id);
    return { id, existed: false };
  } catch {
    return { id: uid(), existed: false };
  }
}

/** id посетителя — для склейки визита с заявкой из квиза. */
export function getVisitorSessionId(): string | null {
  try {
    return sessionStorage.getItem(SID_KEY);
  } catch {
    return null;
  }
}

function classifyClick(target: HTMLElement): string | null {
  const link = target.closest<HTMLAnchorElement>('a');
  if (link) {
    const href = link.getAttribute('href') ?? '';
    if (link.hasAttribute('download')) return 'cv';
    if (href.startsWith('mailto:')) return 'email';
    if (href.startsWith('#')) return `nav:${href}`;
    if (link.closest('#projects')) {
      const name = link.querySelector('h3')?.textContent?.trim();
      return `project:${name ?? href}`;
    }
    try {
      const host = new URL(href, location.href).hostname.replace(/^www\./, '');
      if (host === 't.me') return 'telegram';
      return `link:${host}`;
    } catch {
      return null;
    }
  }
  const button = target.closest<HTMLButtonElement>('button');
  if (button) return `button:${button.getAttribute('aria-label') ?? button.textContent?.trim().slice(0, 30) ?? ''}`;
  return null;
}

export default function VisitTracker({ locale }: { locale: string }) {
  useEffect(() => {
    if (navigator.doNotTrack === '1' || /bot|headless/i.test(navigator.userAgent)) return;

    const visitor = storageId(window.localStorage, VID_KEY);
    const session = storageId(window.sessionStorage, SID_KEY);
    const params = new URLSearchParams(location.search);
    const width = window.innerWidth;

    const state = {
      sid: session.id,
      vid: visitor.id,
      returning: visitor.existed,
      locale,
      path: location.pathname,
      referrer: (() => {
        try {
          return document.referrer ? new URL(document.referrer).hostname : '';
        } catch {
          return '';
        }
      })(),
      utm: {
        source: params.get('utm_source') ?? '',
        medium: params.get('utm_medium') ?? '',
        campaign: params.get('utm_campaign') ?? '',
      },
      device: width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
      lang: navigator.language,
      startedAt: Date.now(),
      durationSec: 0,
      maxScroll: 0,
      sections: {} as Record<string, number>,
      clicks: [] as string[],
      quizStarted: false,
    };
    let dirty = true;

    // Время на экране: раз в секунду добавляем по секунде каждой секции,
    // которая видна хотя бы наполовину, пока вкладка активна.
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting && e.intersectionRatio >= 0.35) visible.add(id);
          else visible.delete(id);
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );
    document.querySelectorAll<HTMLElement>('main section[id]').forEach((el) => observer.observe(el));

    const ticker = window.setInterval(() => {
      if (document.hidden) return;
      state.durationSec += 1;
      visible.forEach((id) => {
        state.sections[id] = (state.sections[id] ?? 0) + 1;
      });
      const doc = document.documentElement;
      const depth = Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100);
      state.maxScroll = Math.max(state.maxScroll, Math.min(100, depth));
      dirty = true;
    }, 1000);

    const onClick = (e: MouseEvent) => {
      const label = classifyClick(e.target as HTMLElement);
      if (!label || state.clicks[state.clicks.length - 1] === label || state.clicks.length >= 30) return;
      state.clicks.push(label);
      dirty = true;
    };
    const onFocus = (e: FocusEvent) => {
      if (!state.quizStarted && (e.target as HTMLElement).closest('#quiz')) {
        state.quizStarted = true;
        dirty = true;
      }
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('focusin', onFocus);

    const flush = () => {
      // Короткие «пролёты» без единой секунды на странице не шлём.
      if (!dirty || state.durationSec < 3) return;
      dirty = false;
      const body = JSON.stringify(state);
      const sent = navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }));
      if (!sent) fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {});
    };
    const flushTimer = window.setInterval(flush, FLUSH_MS);
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);

    return () => {
      flush();
      observer.disconnect();
      window.clearInterval(ticker);
      window.clearInterval(flushTimer);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
    };
  }, [locale]);

  return null;
}
