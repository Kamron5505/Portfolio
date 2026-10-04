'use client';

import './globals.css';

// Последний рубеж: ошибка, до которой не дотянулся ни один error.tsx ниже по
// дереву (в том числе падение самого корневого layout). Next отдаёт такую
// страницу со статусом 500, поэтому поисковик не проиндексирует её как контент,
// а вернётся позже. Компонент обязан рендерить свои <html> и <body>: layout в
// этот момент уже недоступен.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <title>Something went wrong</title>
      </head>
      <body className="antialiased">
        <main className="grid min-h-screen place-items-center px-5 text-center">
          <div>
            <p className="font-mono text-sm text-accent">~/500</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">
              Something went wrong
            </h1>
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-muted">
              An unexpected error occurred while rendering this page. Try again in a moment.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
