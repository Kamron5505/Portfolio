import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f12',
        surface: '#11181d',
        'surface-2': '#172127',
        line: 'rgba(244, 241, 232, 0.14)',
        ink: '#f4f1e8',
        muted: '#a1adb0',
        faint: '#6d7c82',
        accent: '#b9ff6a',
        'accent-2': '#ff8c69',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Space Grotesk без кириллицы: русские заголовки подхватывает Inter
        // (--font-sans), а не случайный системный шрифт.
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1080px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'grid-pan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        blink: 'blink 1.1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
