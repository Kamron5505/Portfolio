import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

// next/font скачивает шрифты на этапе сборки и раздаёт их с собственного
// домена: запросов к fonts.googleapis.com нет вовсе, поэтому preconnect к
// Google не нужен — Next сам вставляет <link rel="preload"> на свои .woff2.
//
// display: 'swap' — текст виден сразу системным шрифтом, без «невидимого»
// периода, который портит LCP.

// Основной текст: сайт есть на русском, без кириллического сабсета браузер
// подставлял бы под русские абзацы системный шрифт.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

// Space Grotesk кириллицы не содержит вовсе — для русских заголовков в цепочке
// font-display вторым идёт Inter (см. tailwind.config.ts).
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontVariables = `${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`;
