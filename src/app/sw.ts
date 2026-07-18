import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// Service worker сайта. Собирается Serwist на этапе build в public/sw.js —
// править сгенерированный файл руками не нужно, только этот исходник.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Список файлов для предкеша подставляет сборщик.
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Админка и API не должны проходить через service worker вовсе: в офлайне там
// показать нечего, а любой перехват добавляет точку отказа (сбой сети внутри
// стратегии превращается в необработанный no-response). Незаматченные запросы
// Serwist не трогает — браузер выполняет их нативно.
const isBypassed = (url: URL) => url.pathname.startsWith('/admin') || url.pathname.startsWith('/api');

const withBypass = (entry: RuntimeCaching): RuntimeCaching => {
  const base = entry.matcher;
  return {
    ...entry,
    matcher: (options) => {
      if (isBypassed(options.url)) return false;
      if (typeof base === 'function') return base(options);
      if (base instanceof RegExp) return base.test(options.url.href);
      return options.url.href === new URL(base, self.location.href).href;
    },
  };
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Новый воркер не ждёт закрытия всех вкладок: после деплоя пользователь
  // получает свежую версию, а не застревает на старой.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache.map(withBypass),
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
