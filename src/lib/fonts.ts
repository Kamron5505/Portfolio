import { Anton_SC, Montserrat, Oswald } from 'next/font/google';

// next/font скачивает шрифты на этапе сборки и раздаёт их с собственного
// домена. display: 'swap' — текст виден сразу системным шрифтом.

// Текст и мелкие подписи: Montserrat с кириллицей (сайт есть на русском).
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Заголовки-«постер» в стиле small caps. Кириллицы у Anton SC нет — русские
// заголовки подхватывает Oswald (см. @theme в globals.css).
const antonSc = Anton_SC({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
  // Без автоподобранного Arial-фолбэка: иначе кириллица рисовалась бы им,
  // а не Oswald из стека --font-display в globals.css.
  adjustFontFallback: false,
});

const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-oswald',
  display: 'swap',
});

export const fontVariables = `${montserrat.variable} ${antonSc.variable} ${oswald.variable}`;
