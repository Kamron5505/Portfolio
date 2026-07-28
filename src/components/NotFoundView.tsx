import Link from 'next/link';

// Общее наполнение страницы 404 для трёх маршрутов: app/not-found.tsx
// (несуществующие адреса верхнего уровня), (en)/not-found.tsx и
// (intl)/[locale]/not-found.tsx.
//
// Стили заданы инлайном, а не классами Tailwind, намеренно: корневой 404
// рендерится вне обоих корневых layout, и в его HTML нет <link rel="stylesheet">
// — таблица стилей приезжает только после гидрации. С классами страница успела
// бы моргнуть чёрным текстом на белом фоне. Инлайн этого не допускает, а
// значения цветов взяты из tailwind.config.ts.
const COLORS = {
  bg: '#08080C',
  ink: '#E7E8EE',
  muted: '#8A8F9A',
  accent: '#6366F1',
};

export default function NotFoundView() {
  return (
    <main
      id="main"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '0 20px',
        textAlign: 'center',
        background: COLORS.bg,
        color: COLORS.ink,
        fontFamily: 'var(--font-sans, system-ui), system-ui, sans-serif',
      }}
    >
      <div>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono, monospace), monospace', fontSize: 14, color: COLORS.accent }}>
          ~/404
        </p>
        <h1 style={{ margin: '12px 0 0', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p style={{ margin: '16px auto 0', maxWidth: 380, lineHeight: 1.6, color: COLORS.muted }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: 32,
            padding: '12px 20px',
            borderRadius: 8,
            background: COLORS.accent,
            color: '#fff',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
